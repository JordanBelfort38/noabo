import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";

const BRIDGE_API_URL = process.env.BRIDGE_API_URL ?? "https://api.bridgeapi.io/v2";
const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY ?? "";
const BRIDGE_API_SECRET = process.env.BRIDGE_API_SECRET ?? "";
const BRIDGE_REDIRECT_URI =
  process.env.BRIDGE_REDIRECT_URI ?? "http://localhost:3000/api/bank/callback";

const USE_MOCK = !BRIDGE_API_KEY || process.env.NODE_ENV === "development";

// --- State token management (CSRF protection) ---

const stateStore = new Map<string, { userId: string; expiresAt: number }>();

export function generateStateToken(userId: string): string {
  const state = randomBytes(32).toString("hex");
  stateStore.set(state, { userId, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 min
  return state;
}

export function validateStateToken(state: string): string | null {
  const entry = stateStore.get(state);
  if (!entry) return null;
  stateStore.delete(state);
  if (entry.expiresAt < Date.now()) return null;
  return entry.userId;
}

// --- Bridge API integration ---

interface BridgeAuthResponse {
  redirect_url: string;
}

interface BridgeTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  item_id?: number;
}

interface BridgeAccount {
  id: number;
  name: string;
  iban?: string;
  balance: number;
  currency_code: string;
  type: string;
  bank_id?: number;
}

interface BridgeTransaction {
  id: number;
  date: string;
  description: string;
  raw_description?: string;
  amount: number;
  currency_code: string;
  category_id?: number;
  is_future: boolean;
}

export async function initiateBankConnection(
  userId: string,
  _provider: string = "bridge"
): Promise<{ redirectUrl: string; state: string }> {
  const state = generateStateToken(userId);

  if (USE_MOCK) {
    return {
      redirectUrl: `/api/bank/callback?code=mock_auth_code_${Date.now()}&state=${state}`,
      state,
    };
  }

  const res = await fetch(`${BRIDGE_API_URL}/connect/items/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Bridge-Version": "2021-06-01",
      "Client-Id": BRIDGE_API_KEY,
      "Client-Secret": BRIDGE_API_SECRET,
    },
    body: JSON.stringify({
      redirect_url: `${BRIDGE_REDIRECT_URI}?state=${state}`,
      country: "fr",
    }),
  });

  if (!res.ok) {
    throw new Error(`Bridge API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as BridgeAuthResponse;
  return { redirectUrl: data.redirect_url, state };
}

export async function handleBankCallback(
  code: string,
  state: string
): Promise<{ connectionId: string; accountCount: number }> {
  const userId = validateStateToken(state);
  if (!userId) {
    throw new Error("Invalid or expired state token");
  }

  if (USE_MOCK) {
    return createMockConnection(userId);
  }

  // Exchange code for tokens
  const tokenRes = await fetch(`${BRIDGE_API_URL}/connect/items/add/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Bridge-Version": "2021-06-01",
      "Client-Id": BRIDGE_API_KEY,
      "Client-Secret": BRIDGE_API_SECRET,
    },
    body: JSON.stringify({ code }),
  });

  if (!tokenRes.ok) {
    throw new Error(`Token exchange failed: ${tokenRes.status}`);
  }

  const tokenData = (await tokenRes.json()) as BridgeTokenResponse;

  // Create bank connection
  const connection = await prisma.bankConnection.create({
    data: {
      userId,
      provider: "bridge",
      providerItemId: tokenData.item_id?.toString(),
      accessToken: encrypt(tokenData.access_token),
      refreshToken: tokenData.refresh_token
        ? encrypt(tokenData.refresh_token)
        : null,
      status: "active",
      consentExpiresAt: tokenData.expires_at
        ? new Date(tokenData.expires_at)
        : null,
      bankName: "Banque connectée",
    },
  });

  // Fetch accounts
  const accounts = await fetchBridgeAccounts(tokenData.access_token);
  for (const acc of accounts) {
    await prisma.bankAccount.create({
      data: {
        userId,
        bankConnectionId: connection.id,
        providerAccountId: acc.id.toString(),
        name: acc.name,
        iban: acc.iban,
        balance: Math.round(acc.balance * 100),
        currency: acc.currency_code,
        accountType: mapAccountType(acc.type),
      },
    });
  }

  return { connectionId: connection.id, accountCount: accounts.length };
}

async function fetchBridgeAccounts(accessToken: string): Promise<BridgeAccount[]> {
  const res = await fetch(`${BRIDGE_API_URL}/accounts`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Bridge-Version": "2021-06-01",
      "Client-Id": BRIDGE_API_KEY,
      "Client-Secret": BRIDGE_API_SECRET,
    },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.resources ?? [];
}

export async function syncTransactions(
  connectionId: string
): Promise<{ newCount: number; totalCount: number }> {
  const connection = await prisma.bankConnection.findUnique({
    where: { id: connectionId },
    include: { bankAccounts: true },
  });

  if (!connection) throw new Error("Connection not found");

  if (USE_MOCK) {
    return syncMockTransactions(connection.userId, connectionId, connection.bankAccounts[0]?.id);
  }

  if (!connection.accessToken) throw new Error("No access token");
  const accessToken = decrypt(connection.accessToken);

  let newCount = 0;
  for (const account of connection.bankAccounts) {
    const since = connection.lastSyncAt?.toISOString().split("T")[0];
    let url = `${BRIDGE_API_URL}/accounts/${account.providerAccountId}/transactions`;
    if (since) url += `?since=${since}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Bridge-Version": "2021-06-01",
        "Client-Id": BRIDGE_API_KEY,
        "Client-Secret": BRIDGE_API_SECRET,
      },
    });

    if (!res.ok) continue;
    const data = await res.json();
    const txs: BridgeTransaction[] = data.resources ?? [];

    for (const tx of txs) {
      if (tx.is_future) continue;
      const externalId = `bridge_${tx.id}`;

      await prisma.transaction.upsert({
        where: { userId_externalId: { userId: connection.userId, externalId } },
        create: {
          userId: connection.userId,
          bankAccountId: account.id,
          externalId,
          date: new Date(tx.date),
          description: tx.description,
          rawDescription: tx.raw_description,
          amount: Math.round(tx.amount * 100),
          currency: tx.currency_code,
          importSource: "api",
        },
        update: {
          description: tx.description,
          amount: Math.round(tx.amount * 100),
        },
      });
      newCount++;
    }
  }

  await prisma.bankConnection.update({
    where: { id: connectionId },
    data: { lastSyncAt: new Date(), lastSyncError: null },
  });

  const totalCount = await prisma.transaction.count({
    where: { userId: connection.userId },
  });

  return { newCount, totalCount };
}

export async function refreshBankToken(connectionId: string): Promise<boolean> {
  const connection = await prisma.bankConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection?.refreshToken) return false;
  if (USE_MOCK) return true;

  const refreshToken = decrypt(connection.refreshToken);

  const res = await fetch(`${BRIDGE_API_URL}/connect/items/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Bridge-Version": "2021-06-01",
      "Client-Id": BRIDGE_API_KEY,
      "Client-Secret": BRIDGE_API_SECRET,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    await prisma.bankConnection.update({
      where: { id: connectionId },
      data: { status: "expired" },
    });
    return false;
  }

  const data = (await res.json()) as BridgeTokenResponse;
  await prisma.bankConnection.update({
    where: { id: connectionId },
    data: {
      accessToken: encrypt(data.access_token),
      refreshToken: data.refresh_token ? encrypt(data.refresh_token) : undefined,
      status: "active",
    },
  });

  return true;
}

export async function disconnectBank(connectionId: string, userId: string): Promise<void> {
  const connection = await prisma.bankConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection || connection.userId !== userId) {
    throw new Error("Connection not found");
  }

  // Revoke token with provider (best effort)
  if (!USE_MOCK && connection.accessToken) {
    try {
      const accessToken = decrypt(connection.accessToken);
      await fetch(`${BRIDGE_API_URL}/connect/items/${connection.providerItemId}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Bridge-Version": "2021-06-01",
          "Client-Id": BRIDGE_API_KEY,
          "Client-Secret": BRIDGE_API_SECRET,
        },
      });
    } catch {
      // Best effort — continue with local deletion
    }
  }

  await prisma.bankConnection.update({
    where: { id: connectionId },
    data: {
      status: "revoked",
      accessToken: null,
      refreshToken: null,
    },
  });
}

// --- Mock data for development ---

const MOCK_BANKS = [
  { name: "BNP Paribas", logo: "/banks/bnp.svg" },
  { name: "Crédit Agricole", logo: "/banks/ca.svg" },
  { name: "Société Générale", logo: "/banks/sg.svg" },
  { name: "Boursorama", logo: "/banks/boursorama.svg" },
];

async function createMockConnection(userId: string) {
  const bank = MOCK_BANKS[Math.floor(Math.random() * MOCK_BANKS.length)];

  const connection = await prisma.bankConnection.create({
    data: {
      userId,
      provider: "bridge",
      providerItemId: `mock_${Date.now()}`,
      accessToken: encrypt("mock_access_token"),
      refreshToken: encrypt("mock_refresh_token"),
      status: "active",
      bankName: bank.name,
      bankLogoUrl: bank.logo,
      lastSyncAt: new Date(),
    },
  });

  const account = await prisma.bankAccount.create({
    data: {
      userId,
      bankConnectionId: connection.id,
      providerAccountId: `mock_acc_${Date.now()}`,
      name: "Compte courant",
      iban: "FR76 •••• •••• •••• •••• ••42",
      balance: 234567, // 2345.67€
      currency: "EUR",
      accountType: "checking",
      balanceDate: new Date(),
    },
  });

  // Create mock transactions
  await syncMockTransactions(userId, connection.id, account.id);

  return { connectionId: connection.id, accountCount: 1 };
}

const MOCK_TRANSACTIONS = [
  { description: "NETFLIX", amount: -1399, category: "subscription", merchant: "Netflix", recurring: true },
  { description: "SPOTIFY PREMIUM", amount: -999, category: "subscription", merchant: "Spotify", recurring: true },
  { description: "PRLV SEPA FREE MOBILE", amount: -1999, category: "telecom", merchant: "Free Mobile", recurring: true },
  { description: "PRLV SEPA EDF", amount: -8500, category: "housing", merchant: "EDF", recurring: true },
  { description: "CB CARREFOUR", amount: -6723, category: "groceries", merchant: null, recurring: false },
  { description: "CB AMAZON EU", amount: -3499, category: "shopping", merchant: "Amazon", recurring: false },
  { description: "VIR SEPA SALAIRE", amount: 250000, category: null, merchant: null, recurring: true },
  { description: "PRLV SEPA MAIF ASSURANCE", amount: -4200, category: "insurance", merchant: "MAIF", recurring: true },
  { description: "CB UBER EATS", amount: -1890, category: "restaurant", merchant: null, recurring: false },
  { description: "PRLV SEPA CANAL+", amount: -2199, category: "subscription", merchant: "Canal+", recurring: true },
  { description: "CB SNCF", amount: -4500, category: "transport", merchant: null, recurring: false },
  { description: "CB BASIC-FIT", amount: -2999, category: "subscription", merchant: "Basic-Fit", recurring: true },
  { description: "CB PHARMACIE DU CENTRE", amount: -1250, category: "health", merchant: null, recurring: false },
  { description: "PRLV SEPA DISNEY PLUS", amount: -899, category: "subscription", merchant: "Disney+", recurring: true },
  { description: "CB LIDL", amount: -4312, category: "groceries", merchant: null, recurring: false },
  { description: "PRLV SEPA ADOBE CREATIVE", amount: -5999, category: "subscription", merchant: "Adobe Creative Cloud", recurring: true },
  { description: "CB DECATHLON", amount: -7890, category: "shopping", merchant: null, recurring: false },
  { description: "PRLV SEPA BOUYGUES TEL", amount: -2499, category: "telecom", merchant: "Bouygues Telecom", recurring: true },
  { description: "CB TOTAL ENERGIES", amount: -6500, category: "transport", merchant: null, recurring: false },
  { description: "PRLV SEPA CHATGPT PLUS", amount: -2000, category: "subscription", merchant: "ChatGPT Plus", recurring: true },
];

async function syncMockTransactions(
  userId: string,
  connectionId: string,
  accountId?: string
): Promise<{ newCount: number; totalCount: number }> {
  const now = new Date();
  let newCount = 0;

  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    for (const mock of MOCK_TRANSACTIONS) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - monthOffset);
      // Randomize day slightly
      date.setDate(Math.max(1, Math.min(28, Math.floor(Math.random() * 28) + 1)));

      const externalId = `mock_${mock.description.replace(/\s/g, "_")}_${date.toISOString().slice(0, 7)}`;

      try {
        await prisma.transaction.upsert({
          where: { userId_externalId: { userId, externalId } },
          create: {
            userId,
            bankAccountId: accountId,
            externalId,
            date,
            description: mock.description,
            rawDescription: mock.description,
            amount: mock.amount + Math.floor(Math.random() * 100 - 50), // slight variance
            currency: "EUR",
            category: mock.category,
            merchantName: mock.merchant,
            importSource: "api",
            isRecurring: mock.recurring,
          },
          update: {},
        });
        newCount++;
      } catch {
        // Skip duplicates
      }
    }
  }

  await prisma.bankConnection.update({
    where: { id: connectionId },
    data: { lastSyncAt: new Date() },
  });

  const totalCount = await prisma.transaction.count({ where: { userId } });
  return { newCount, totalCount };
}

function mapAccountType(type: string): string {
  const map: Record<string, string> = {
    checking: "checking",
    savings: "savings",
    card: "card",
    loan: "loan",
    brokerage: "investment",
  };
  return map[type.toLowerCase()] ?? "checking";
}

// SUPPORTED_BANKS is in @/lib/bank-constants.ts (client-safe)
