export interface RawTransaction {
  date: string;
  description: string;
  amount: number; // In euros (will be converted to cents)
  currency?: string;
  category?: string;
  balance?: number;
}

export interface NormalizedTransaction {
  date: Date;
  description: string;
  rawDescription: string;
  amount: number; // In cents (negative = debit)
  currency: string;
  category: string | null;
  merchantName: string | null;
  isRecurring: boolean;
}

const KNOWN_SUBSCRIPTIONS: Record<string, string> = {
  netflix: "Netflix",
  spotify: "Spotify",
  "amazon prime": "Amazon Prime",
  "disney+": "Disney+",
  "disney plus": "Disney+",
  deezer: "Deezer",
  "apple music": "Apple Music",
  "apple.com/bill": "Apple",
  "google storage": "Google One",
  "google *": "Google",
  "microsoft*": "Microsoft 365",
  "adobe creative": "Adobe Creative Cloud",
  "adobe *": "Adobe",
  canal: "Canal+",
  "canal+": "Canal+",
  "orange sa": "Orange",
  sfr: "SFR",
  bouygues: "Bouygues Telecom",
  free: "Free",
  "free mobile": "Free Mobile",
  "free telecom": "Free",
  edf: "EDF",
  engie: "Engie",
  veolia: "Veolia",
  "assurance hab": "Assurance Habitation",
  "assurance auto": "Assurance Auto",
  maif: "MAIF",
  macif: "MACIF",
  "axa ": "AXA",
  "allianz": "Allianz",
  "basic fit": "Basic-Fit",
  "fitness park": "Fitness Park",
  "salle de sport": "Salle de sport",
  "gym ": "Salle de sport",
  "youtube premium": "YouTube Premium",
  "youtube music": "YouTube Music",
  chatgpt: "ChatGPT Plus",
  openai: "OpenAI",
  "notion ": "Notion",
  "figma ": "Figma",
  "github ": "GitHub",
  "linkedin premium": "LinkedIn Premium",
  "playstation": "PlayStation Plus",
  "xbox": "Xbox Game Pass",
  "nintendo": "Nintendo Switch Online",
  "crunchyroll": "Crunchyroll",
  "molotov": "Molotov TV",
  "salto": "Salto",
  "paramount": "Paramount+",
  "hbo max": "HBO Max",
  "nord vpn": "NordVPN",
  "nordvpn": "NordVPN",
  "express vpn": "ExpressVPN",
  "expressvpn": "ExpressVPN",
};

const CATEGORY_PATTERNS: Record<string, RegExp[]> = {
  subscription: [
    /abonnement/i,
    /mensuel/i,
    /monthly/i,
    /subscription/i,
    /premium/i,
    /prelevement/i,
  ],
  groceries: [
    /carrefour/i,
    /leclerc/i,
    /auchan/i,
    /lidl/i,
    /intermarche/i,
    /monoprix/i,
    /franprix/i,
    /picard/i,
    /casino/i,
    /super\s?u/i,
  ],
  transport: [
    /sncf/i,
    /ratp/i,
    /navigo/i,
    /uber/i,
    /bolt/i,
    /blablacar/i,
    /total\s?energies/i,
    /shell/i,
    /bp\s/i,
    /essence/i,
    /parking/i,
    /autoroute/i,
    /peage/i,
  ],
  restaurant: [
    /restaurant/i,
    /mcdonalds/i,
    /burger king/i,
    /kfc/i,
    /subway/i,
    /deliveroo/i,
    /uber\s?eats/i,
    /just\s?eat/i,
  ],
  health: [
    /pharmacie/i,
    /medecin/i,
    /docteur/i,
    /hopital/i,
    /mutuelle/i,
    /cpam/i,
    /ameli/i,
  ],
  housing: [
    /loyer/i,
    /edf/i,
    /engie/i,
    /veolia/i,
    /eau/i,
    /electricite/i,
    /gaz/i,
    /charges/i,
  ],
  insurance: [
    /assurance/i,
    /maif/i,
    /macif/i,
    /axa/i,
    /allianz/i,
    /groupama/i,
    /matmut/i,
  ],
  telecom: [
    /orange/i,
    /sfr/i,
    /bouygues/i,
    /free\s/i,
    /free\s?mobile/i,
    /sosh/i,
    /red\s?by/i,
  ],
  entertainment: [
    /netflix/i,
    /spotify/i,
    /disney/i,
    /canal/i,
    /cinema/i,
    /fnac/i,
    /amazon\s?prime/i,
  ],
  shopping: [
    /amazon/i,
    /cdiscount/i,
    /zalando/i,
    /h&m/i,
    /zara/i,
    /decathlon/i,
    /ikea/i,
  ],
};

export function normalizeDescription(description: string): string {
  return description
    .replace(/\s+/g, " ")
    .replace(/[*]+/g, " ")
    .replace(/\d{2}\/\d{2}\/?\d{0,4}/g, "")
    .replace(/CB\s*\d+/gi, "")
    .replace(/CARTE\s*\d+/gi, "")
    .replace(/PAIEMENT\s*(CB|CARTE)/gi, "")
    .replace(/PRELEVEMENT\s*/gi, "")
    .replace(/VIREMENT\s*(DE|POUR|SEPA)?\s*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function detectMerchant(description: string): string | null {
  const lower = description.toLowerCase();
  for (const [pattern, name] of Object.entries(KNOWN_SUBSCRIPTIONS)) {
    if (lower.includes(pattern)) {
      return name;
    }
  }
  return null;
}

export function detectCategory(description: string): string | null {
  const lower = description.toLowerCase();

  // Check subscription merchants first
  for (const pattern of Object.keys(KNOWN_SUBSCRIPTIONS)) {
    if (lower.includes(pattern)) {
      return "subscription";
    }
  }

  // Check category patterns
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const regex of patterns) {
      if (regex.test(description)) {
        return category;
      }
    }
  }

  return null;
}

export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

export function parseDate(dateStr: string): Date | null {
  // DD/MM/YYYY
  const frMatch = dateStr.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (frMatch) {
    const day = parseInt(frMatch[1], 10);
    const month = parseInt(frMatch[2], 10) - 1;
    let year = parseInt(frMatch[3], 10);
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // YYYY-MM-DD (ISO)
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
  }

  // Try native parsing as fallback
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  return null;
}

export function normalizeTransaction(raw: RawTransaction): NormalizedTransaction | null {
  const date = parseDate(raw.date);
  if (!date) return null;

  const normalized = normalizeDescription(raw.description);
  const merchant = detectMerchant(raw.description) ?? detectMerchant(normalized);
  const category = raw.category ?? detectCategory(raw.description) ?? detectCategory(normalized);
  const isRecurring = category === "subscription" || !!merchant;

  return {
    date,
    description: normalized || raw.description,
    rawDescription: raw.description,
    amount: eurosToCents(raw.amount),
    currency: raw.currency ?? "EUR",
    category,
    merchantName: merchant,
    isRecurring,
  };
}

export function normalizeTransactions(raws: RawTransaction[]): NormalizedTransaction[] {
  return raws
    .map(normalizeTransaction)
    .filter((t): t is NormalizedTransaction => t !== null);
}
