import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

// --- Configuration ---

const BRIDGE_BASE_URL = process.env.BRIDGE_API_URL ?? "https://api.bridgeapi.io/v3";
const BRIDGE_CLIENT_ID = process.env.BRIDGE_CLIENT_ID ?? "";
const BRIDGE_CLIENT_SECRET = process.env.BRIDGE_CLIENT_SECRET ?? "";
const BRIDGE_REDIRECT_URI =
  process.env.BRIDGE_REDIRECT_URI ?? "http://localhost:3000/api/bank/callback";
const BRIDGE_VERSION = "2025-01-15";

const USE_MOCK = !BRIDGE_CLIENT_ID;

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

// --- Bridge API v3 helpers ---

function bridgeHeaders(accessToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Bridge-Version": BRIDGE_VERSION,
    "Client-Id": BRIDGE_CLIENT_ID,
    "Client-Secret": BRIDGE_CLIENT_SECRET,
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return headers;
}

async function bridgeFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; accessToken?: string } = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${BRIDGE_BASE_URL}${path}`;
  const method = options.method ?? "GET";

  console.log(`[Bridge API] ${method} ${url}`);

  const res = await fetch(url, {
    method,
    headers: bridgeHeaders(options.accessToken),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    console.error(`[Bridge API] ${res.status} ${method} ${url}:`, errorBody);
    throw new Error(`Bridge API ${res.status}: ${errorBody}`);
  }

  return res.json() as Promise<T>;
}

// --- Bridge API v3 types ---

interface BridgeUser {
  uuid: string;
  external_user_id?: string;
}

interface BridgeAuthToken {
  access_token: string;
  expires_at: string;
  user: BridgeUser;
}

interface BridgeConnectSession {
  id: string;
  url: string;
}

interface BridgeItem {
  id: number;
  status: number;
  bank_id?: number;
  status_code_info?: string;
  status_code_description?: string;
  authentication_expires_at?: string;
}

interface BridgeAccount {
  id: number;
  item_id: number;
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
  clean_description: string;
  bank_description: string;
  amount: number;
  currency_code: string;
  category_id?: number;
  is_future: boolean;
  account_id: number;
}

interface BridgePaginatedResponse<T> {
  resources: T[];
  pagination: {
    next_uri: string | null;
  };
}

interface BridgeBank {
  id: number;
  name: string;
  logo_url?: string;
  country_code: string;
}

// --- Bridge user management ---

async function getOrCreateBridgeUser(userId: string, email: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.bridgeUserUuid) return user.bridgeUserUuid;

  const data = await bridgeFetch<{ uuid: string }>("/aggregation/users", {
    method: "POST",
    body: { external_user_id: userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { bridgeUserUuid: data.uuid },
  });

  return data.uuid;
}

async function getBridgeAccessToken(userId: string, email: string): Promise<string> {
  const bridgeUserUuid = await getOrCreateBridgeUser(userId, email);

  const data = await bridgeFetch<BridgeAuthToken>("/aggregation/authorization/token", {
    method: "POST",
    body: { user_uuid: bridgeUserUuid },
  });

  return data.access_token;
}

// --- Public API ---

export async function initiateBankConnection(
  userId: string,
  email: string,
  _provider: string = "bridge"
): Promise<{ redirectUrl: string; state: string }> {
  const state = generateStateToken(userId);

  if (USE_MOCK) {
    return {
      redirectUrl: `/api/bank/callback?item_id=mock_item_${Date.now()}&user_uuid=mock_uuid&success=true&state=${state}`,
      state,
    };
  }

  const accessToken = await getBridgeAccessToken(userId, email);

  const session = await bridgeFetch<BridgeConnectSession>("/aggregation/connect-sessions", {
    method: "POST",
    accessToken,
    body: {
      callback_url: `${BRIDGE_REDIRECT_URI}?state=${state}`,
      user_email: email,
    },
  });

  return { redirectUrl: session.url, state };
}

export async function handleBankCallback(
  params: { itemId?: string; userUuid?: string; success?: string; state: string }
): Promise<{ connectionId: string; accountCount: number }> {
  const userId = validateStateToken(params.state);
  if (!userId) {
    throw new Error("Invalid or expired state token");
  }

  if (USE_MOCK) {
    return createMockConnection(userId);
  }

  if (params.success !== "true" || !params.itemId) {
    throw new Error("Bank connection was not completed successfully");
  }

  const itemId = params.itemId;

  // Get a fresh access token to fetch data
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  const accessToken = await getBridgeAccessToken(userId, user.email);

  // Fetch item details to get bank info
  let bankName = "Banque connectée";
  let bankLogoUrl: string | null = null;
  let authExpiresAt: Date | null = null;

  try {
    const item = await bridgeFetch<BridgeItem>(`/aggregation/items/${itemId}`, {
      accessToken,
    });
    authExpiresAt = item.authentication_expires_at
      ? new Date(item.authentication_expires_at)
      : null;

    if (item.bank_id) {
      try {
        const bank = await bridgeFetch<BridgeBank>(`/aggregation/banks/${item.bank_id}`, {
          accessToken,
        });
        bankName = bank.name;
        bankLogoUrl = bank.logo_url ?? null;
      } catch {
        // Non-critical — keep default name
      }
    }
  } catch {
    // Non-critical — keep defaults
  }

  // Store the access token encrypted for future sync calls
  const connection = await prisma.bankConnection.create({
    data: {
      userId,
      provider: "bridge",
      providerItemId: itemId,
      accessToken: encrypt(accessToken),
      status: "active",
      bankName,
      bankLogoUrl,
      consentExpiresAt: authExpiresAt,
      lastSyncAt: new Date(),
    },
  });

  // Fetch and store accounts
  const accounts = await fetchAllAccounts(accessToken, parseInt(itemId, 10));
  for (const acc of accounts) {
    await prisma.bankAccount.create({
      data: {
        userId,
        bankConnectionId: connection.id,
        providerAccountId: acc.id.toString(),
        name: acc.name,
        iban: acc.iban ? maskIban(acc.iban) : null,
        balance: Math.round(acc.balance * 100),
        currency: acc.currency_code ?? "EUR",
        accountType: mapAccountType(acc.type),
        balanceDate: new Date(),
      },
    });
  }

  // Fetch initial transactions
  await syncTransactionsForConnection(connection.id, userId, accessToken);

  return { connectionId: connection.id, accountCount: accounts.length };
}

export async function syncTransactions(
  connectionId: string
): Promise<{ newCount: number; totalCount: number }> {
  const connection = await prisma.bankConnection.findUnique({
    where: { id: connectionId },
    include: { bankAccounts: true, user: { select: { email: true, bridgeUserUuid: true } } },
  });

  if (!connection) throw new Error("Connection not found");

  if (USE_MOCK) {
    return syncMockTransactions(connection.userId, connectionId, connection.bankAccounts[0]?.id);
  }

  if (!connection.user.bridgeUserUuid) throw new Error("No Bridge user linked");

  // Get a fresh access token (tokens expire after 2h)
  const accessToken = await getBridgeAccessToken(connection.userId, connection.user.email);

  // Update stored token
  await prisma.bankConnection.update({
    where: { id: connectionId },
    data: { accessToken: encrypt(accessToken) },
  });

  return syncTransactionsForConnection(connectionId, connection.userId, accessToken);
}

async function syncTransactionsForConnection(
  connectionId: string,
  userId: string,
  accessToken: string
): Promise<{ newCount: number; totalCount: number }> {
  const connection = await prisma.bankConnection.findUnique({
    where: { id: connectionId },
    include: { bankAccounts: true },
  });
  if (!connection) throw new Error("Connection not found");

  let newCount = 0;

  for (const account of connection.bankAccounts) {
    const since = connection.lastSyncAt?.toISOString().split("T")[0];
    let url = `/aggregation/accounts/${account.providerAccountId}/transactions?limit=500`;
    if (since) url += `&since=${since}`;

    try {
      // Paginate through all transactions
      let nextUri: string | null = url;
      while (nextUri) {
        const page: BridgePaginatedResponse<BridgeTransaction> = await bridgeFetch<BridgePaginatedResponse<BridgeTransaction>>(nextUri, {
          accessToken,
        });
        const data = page;

        for (const tx of data.resources) {
          if (tx.is_future) continue;
          const externalId = `bridge_${tx.id}`;

          try {
            await prisma.transaction.upsert({
              where: { userId_externalId: { userId, externalId } },
              create: {
                userId,
                bankAccountId: account.id,
                externalId,
                date: new Date(tx.date),
                description: tx.clean_description || tx.bank_description,
                rawDescription: tx.bank_description,
                amount: Math.round(tx.amount * 100),
                currency: tx.currency_code ?? "EUR",
                importSource: "api",
              },
              update: {
                description: tx.clean_description || tx.bank_description,
                amount: Math.round(tx.amount * 100),
              },
            });
            newCount++;
          } catch {
            // Skip individual transaction errors
          }
        }

        nextUri = data.pagination?.next_uri ?? null;
      }
    } catch (err) {
      console.error(`Error syncing account ${account.providerAccountId}:`, err);
    }
  }

  // Update account balances
  try {
    for (const account of connection.bankAccounts) {
      const accData = await bridgeFetch<BridgeAccount>(
        `/aggregation/accounts/${account.providerAccountId}`,
        { accessToken }
      );
      await prisma.bankAccount.update({
        where: { id: account.id },
        data: {
          balance: Math.round(accData.balance * 100),
          balanceDate: new Date(),
        },
      });
    }
  } catch {
    // Non-critical
  }

  await prisma.bankConnection.update({
    where: { id: connectionId },
    data: { lastSyncAt: new Date(), lastSyncError: null },
  });

  const totalCount = await prisma.transaction.count({ where: { userId } });
  return { newCount, totalCount };
}

export async function refreshBankConnection(connectionId: string): Promise<boolean> {
  const connection = await prisma.bankConnection.findUnique({
    where: { id: connectionId },
    include: { user: { select: { email: true, bridgeUserUuid: true } } },
  });

  if (!connection) return false;
  if (USE_MOCK) return true;

  if (!connection.user.bridgeUserUuid) return false;

  try {
    const accessToken = await getBridgeAccessToken(connection.userId, connection.user.email);
    await prisma.bankConnection.update({
      where: { id: connectionId },
      data: {
        accessToken: encrypt(accessToken),
        status: "active",
      },
    });
    return true;
  } catch {
    await prisma.bankConnection.update({
      where: { id: connectionId },
      data: { status: "expired" },
    });
    return false;
  }
}

export async function disconnectBank(connectionId: string, userId: string): Promise<void> {
  const connection = await prisma.bankConnection.findUnique({
    where: { id: connectionId },
    include: { user: { select: { email: true, bridgeUserUuid: true } } },
  });

  if (!connection || connection.userId !== userId) {
    throw new Error("Connection not found");
  }

  // Delete item with Bridge (best effort)
  if (!USE_MOCK && connection.providerItemId && connection.user.bridgeUserUuid) {
    try {
      const accessToken = await getBridgeAccessToken(userId, connection.user.email);
      await bridgeFetch(`/aggregation/items/${connection.providerItemId}`, {
        method: "DELETE",
        accessToken,
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

// --- Helpers ---

function maskIban(iban: string): string {
  if (iban.length < 8) return iban;
  return iban.slice(0, 4) + " •••• •••• •••• •••• ••" + iban.slice(-2);
}

function mapAccountType(type: string): string {
  const map: Record<string, string> = {
    checking: "checking",
    savings: "savings",
    card: "card",
    loan: "loan",
    brokerage: "investment",
    life_insurance: "savings",
  };
  return map[type?.toLowerCase()] ?? "checking";
}

async function fetchAllAccounts(accessToken: string, itemId?: number): Promise<BridgeAccount[]> {
  const allAccounts: BridgeAccount[] = [];
  let nextUri: string | null = "/aggregation/accounts?limit=500";

  while (nextUri) {
    const page: BridgePaginatedResponse<BridgeAccount> = await bridgeFetch<BridgePaginatedResponse<BridgeAccount>>(nextUri, {
      accessToken,
    });
    const filtered = itemId
      ? page.resources.filter((a: BridgeAccount) => a.item_id === itemId)
      : page.resources;
    allAccounts.push(...filtered);
    nextUri = page.pagination?.next_uri ?? null;
  }

  return allAccounts;
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
      balance: 234567,
      currency: "EUR",
      accountType: "checking",
      balanceDate: new Date(),
    },
  });

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
            amount: mock.amount + Math.floor(Math.random() * 100 - 50),
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
