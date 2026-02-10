const FREQUENCY_MULTIPLIERS: Record<string, number> = {
  WEEKLY: 52 / 12,      // ~4.33
  BIWEEKLY: 26 / 12,    // ~2.17
  MONTHLY: 1,
  BIMONTHLY: 0.5,
  QUARTERLY: 1 / 3,     // ~0.33
  SEMIANNUAL: 1 / 6,    // ~0.17
  ANNUAL: 1 / 12,       // ~0.083
};

interface SubscriptionLike {
  amount: number; // in cents (positive)
  frequency: string;
  status?: string | null;
  merchantName?: string | null;
  category?: string | null;
}

export function calculateMonthlyCost(sub: SubscriptionLike): number {
  const multiplier = FREQUENCY_MULTIPLIERS[sub.frequency] ?? 1;
  return Math.round(sub.amount * multiplier);
}

export function calculateAnnualCost(sub: SubscriptionLike): number {
  return calculateMonthlyCost(sub) * 12;
}

export function calculateTotalMonthlyCost(subscriptions: SubscriptionLike[]): number {
  return subscriptions
    .filter((s) => s.status === "ACTIVE" || s.status === "ENDING_SOON")
    .reduce((sum, s) => sum + calculateMonthlyCost(s), 0);
}

export function calculateTotalAnnualCost(subscriptions: SubscriptionLike[]): number {
  return calculateTotalMonthlyCost(subscriptions) * 12;
}

// Known alternatives database
const ALTERNATIVES: Record<string, { name: string; monthlyCost: number; description: string }[]> = {
  "Netflix": [
    { name: "Netflix Standard avec pub", monthlyCost: 599, description: "Même contenu avec publicités" },
    { name: "Disney+", monthlyCost: 599, description: "Alternative streaming" },
  ],
  "Spotify": [
    { name: "Spotify Free", monthlyCost: 0, description: "Version gratuite avec publicités" },
    { name: "YouTube Music Free", monthlyCost: 0, description: "Streaming musical gratuit" },
    { name: "Deezer Free", monthlyCost: 0, description: "Alternative gratuite" },
  ],
  "Disney+": [
    { name: "Disney+ avec pub", monthlyCost: 599, description: "Même contenu avec publicités" },
  ],
  "Canal+": [
    { name: "Molotov TV", monthlyCost: 399, description: "TV en streaming moins cher" },
  ],
  "Adobe Creative Cloud": [
    { name: "Affinity Suite", monthlyCost: 0, description: "Achat unique ~70€, pas d'abonnement" },
    { name: "Canva Pro", monthlyCost: 1099, description: "Alternative design plus abordable" },
  ],
  "ChatGPT Plus": [
    { name: "ChatGPT Free", monthlyCost: 0, description: "Version gratuite avec limites" },
    { name: "Claude Free", monthlyCost: 0, description: "Alternative IA gratuite" },
  ],
  "NordVPN": [
    { name: "ProtonVPN Free", monthlyCost: 0, description: "VPN gratuit et sécurisé" },
  ],
  "ExpressVPN": [
    { name: "ProtonVPN Free", monthlyCost: 0, description: "VPN gratuit et sécurisé" },
  ],
  "Basic-Fit": [
    { name: "Sport en extérieur", monthlyCost: 0, description: "Course, vélo, musculation au poids du corps" },
  ],
  "Fitness Park": [
    { name: "Basic-Fit", monthlyCost: 1999, description: "Salle de sport moins chère" },
  ],
  "YouTube Premium": [
    { name: "YouTube Free + uBlock", monthlyCost: 0, description: "Version gratuite avec bloqueur de pub" },
  ],
  "LinkedIn Premium": [
    { name: "LinkedIn Free", monthlyCost: 0, description: "Version gratuite suffisante pour la plupart" },
  ],
};

export interface SavingSuggestion {
  subscription: SubscriptionLike & { merchantName: string };
  currentMonthlyCost: number;
  alternatives: { name: string; monthlyCost: number; description: string; savingsPerMonth: number }[];
  bestSavingPerMonth: number;
}

export function suggestAlternatives(sub: SubscriptionLike & { merchantName: string }): SavingSuggestion | null {
  const alts = ALTERNATIVES[sub.merchantName];
  if (!alts || alts.length === 0) return null;

  const currentMonthly = calculateMonthlyCost(sub);

  const alternatives = alts
    .map((alt) => ({
      ...alt,
      savingsPerMonth: currentMonthly - alt.monthlyCost,
    }))
    .filter((alt) => alt.savingsPerMonth > 0)
    .sort((a, b) => b.savingsPerMonth - a.savingsPerMonth);

  if (alternatives.length === 0) return null;

  return {
    subscription: sub,
    currentMonthlyCost: currentMonthly,
    alternatives,
    bestSavingPerMonth: alternatives[0].savingsPerMonth,
  };
}

export function calculatePotentialSavings(
  subscriptions: (SubscriptionLike & { merchantName: string })[]
): {
  suggestions: SavingSuggestion[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
} {
  const active = subscriptions.filter(
    (s) => s.status === "ACTIVE" || s.status === "ENDING_SOON"
  );

  const suggestions: SavingSuggestion[] = [];
  for (const sub of active) {
    const suggestion = suggestAlternatives(sub);
    if (suggestion) {
      suggestions.push(suggestion);
    }
  }

  suggestions.sort((a, b) => b.bestSavingPerMonth - a.bestSavingPerMonth);

  const totalMonthlySavings = suggestions.reduce(
    (sum, s) => sum + s.bestSavingPerMonth,
    0
  );

  return {
    suggestions,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
  };
}

export function formatCentsToEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function getFrequencyLabel(frequency: string): string {
  const labels: Record<string, string> = {
    WEEKLY: "Hebdomadaire",
    BIWEEKLY: "Bi-hebdomadaire",
    MONTHLY: "Mensuel",
    BIMONTHLY: "Bimestriel",
    QUARTERLY: "Trimestriel",
    SEMIANNUAL: "Semestriel",
    ANNUAL: "Annuel",
  };
  return labels[frequency] ?? frequency;
}

export function getFrequencyShortLabel(frequency: string): string {
  const labels: Record<string, string> = {
    WEEKLY: "/sem",
    BIWEEKLY: "/2 sem",
    MONTHLY: "/mois",
    BIMONTHLY: "/2 mois",
    QUARTERLY: "/trim",
    SEMIANNUAL: "/sem",
    ANNUAL: "/an",
  };
  return labels[frequency] ?? "";
}
