import { prisma } from "@/lib/prisma";

export interface DetectedSubscription {
  merchantName: string;
  averageAmount: number; // in cents (positive)
  frequency: string;
  confidence: number; // 0-100
  nextChargeDate: Date | null;
  firstChargeDate: Date;
  lastChargeDate: Date;
  transactionIds: string[];
  category: string | null;
  occurrences: number;
}

interface TransactionGroup {
  merchantName: string;
  transactions: {
    id: string;
    date: Date;
    amount: number;
    category: string | null;
  }[];
}

const FREQUENCY_PATTERNS: {
  name: string;
  days: number;
  tolerance: number;
}[] = [
  { name: "WEEKLY", days: 7, tolerance: 2 },
  { name: "BIWEEKLY", days: 14, tolerance: 3 },
  { name: "MONTHLY", days: 30, tolerance: 5 },
  { name: "BIMONTHLY", days: 60, tolerance: 7 },
  { name: "QUARTERLY", days: 90, tolerance: 10 },
  { name: "SEMIANNUAL", days: 180, tolerance: 15 },
  { name: "ANNUAL", days: 365, tolerance: 30 },
];

const KNOWN_SUBSCRIPTION_MERCHANTS = new Set([
  "Netflix",
  "Spotify",
  "Amazon Prime",
  "Disney+",
  "Canal+",
  "Deezer",
  "Apple Music",
  "Apple",
  "Google One",
  "Microsoft 365",
  "Adobe Creative Cloud",
  "YouTube Premium",
  "YouTube Music",
  "ChatGPT Plus",
  "OpenAI",
  "Notion",
  "Figma",
  "GitHub",
  "LinkedIn Premium",
  "PlayStation Plus",
  "Xbox Game Pass",
  "Nintendo Switch Online",
  "Crunchyroll",
  "Molotov TV",
  "Paramount+",
  "HBO Max",
  "NordVPN",
  "ExpressVPN",
  "Basic-Fit",
  "Fitness Park",
  "Free Mobile",
  "Free",
  "Orange",
  "SFR",
  "Bouygues Telecom",
  "EDF",
  "Engie",
  "Veolia",
  "MAIF",
  "MACIF",
  "AXA",
  "Allianz",
]);

function calculateIntervals(dates: Date[]): number[] {
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diffMs = sorted[i].getTime() - sorted[i - 1].getTime();
    intervals.push(Math.round(diffMs / (1000 * 60 * 60 * 24)));
  }
  return intervals;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function detectFrequency(intervals: number[]): { name: string; days: number } | null {
  if (intervals.length === 0) return null;

  const avgInterval = mean(intervals);

  for (const pattern of FREQUENCY_PATTERNS) {
    if (Math.abs(avgInterval - pattern.days) <= pattern.tolerance) {
      return { name: pattern.name, days: pattern.days };
    }
  }

  // If no standard pattern matches, check if intervals are at least consistent
  const sd = stddev(intervals);
  if (sd < avgInterval * 0.2 && avgInterval > 5) {
    // Custom but consistent interval — map to nearest standard
    const closest = FREQUENCY_PATTERNS.reduce((best, p) =>
      Math.abs(p.days - avgInterval) < Math.abs(best.days - avgInterval) ? p : best
    );
    return { name: closest.name, days: closest.days };
  }

  return null;
}

function calculateConfidence(
  occurrences: number,
  intervalStdDev: number,
  amountStdDevPercent: number,
  isKnownMerchant: boolean,
  isSubscriptionCategory: boolean
): number {
  let score = 0;

  // +40 points: 3+ occurrences
  if (occurrences >= 3) score += 40;
  else if (occurrences >= 2) score += 20;

  // +20 points: consistent interval (σ < 3 days)
  if (intervalStdDev < 3) score += 20;
  else if (intervalStdDev < 5) score += 10;

  // +20 points: consistent amount (σ < 5%)
  if (amountStdDevPercent < 5) score += 20;
  else if (amountStdDevPercent < 10) score += 10;

  // +10 points: known subscription merchant
  if (isKnownMerchant) score += 10;

  // +10 points: category = subscription
  if (isSubscriptionCategory) score += 10;

  return Math.min(100, score);
}

function extrapolateNextCharge(lastDate: Date, frequencyDays: number): Date {
  const next = new Date(lastDate);
  next.setDate(next.getDate() + frequencyDays);

  // If the extrapolated date is in the past, keep adding intervals until future
  const now = new Date();
  while (next < now) {
    next.setDate(next.getDate() + frequencyDays);
  }

  return next;
}

export async function analyzeTransactionsForSubscriptions(
  userId: string
): Promise<DetectedSubscription[]> {
  // Fetch all debit transactions with a merchant name
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      amount: { lt: 0 }, // Only debits
      merchantName: { not: null },
    },
    orderBy: { date: "asc" },
    select: {
      id: true,
      date: true,
      amount: true,
      merchantName: true,
      category: true,
    },
  });

  // Group by merchant name
  const groups = new Map<string, TransactionGroup>();
  for (const tx of transactions) {
    if (!tx.merchantName) continue;
    const key = tx.merchantName;
    if (!groups.has(key)) {
      groups.set(key, { merchantName: key, transactions: [] });
    }
    groups.get(key)!.transactions.push({
      id: tx.id,
      date: tx.date,
      amount: tx.amount,
      category: tx.category,
    });
  }

  const detected: DetectedSubscription[] = [];

  for (const [, group] of groups) {
    // Minimum 2 occurrences
    if (group.transactions.length < 2) continue;

    const dates = group.transactions.map((t) => t.date);
    const amounts = group.transactions.map((t) => Math.abs(t.amount));

    // Calculate intervals
    const intervals = calculateIntervals(dates);
    if (intervals.length === 0) continue;

    // Detect frequency
    const frequency = detectFrequency(intervals);
    if (!frequency) continue;

    // Calculate stats
    const intervalSD = stddev(intervals);
    const avgAmount = mean(amounts);
    const amountSD = stddev(amounts);
    const amountSDPercent = avgAmount > 0 ? (amountSD / avgAmount) * 100 : 100;

    // Check amount consistency (within ±10%)
    if (amountSDPercent > 15) continue;

    // Determine category from most common
    const categories = group.transactions
      .map((t) => t.category)
      .filter(Boolean) as string[];
    const categoryCount = new Map<string, number>();
    for (const c of categories) {
      categoryCount.set(c, (categoryCount.get(c) ?? 0) + 1);
    }
    const topCategory = [...categoryCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const isKnown = KNOWN_SUBSCRIPTION_MERCHANTS.has(group.merchantName);
    const isSubCategory = topCategory === "subscription";

    const confidence = calculateConfidence(
      group.transactions.length,
      intervalSD,
      amountSDPercent,
      isKnown,
      isSubCategory
    );

    // Only include if confidence >= 60
    if (confidence < 60) continue;

    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const firstDate = sortedDates[0];
    const lastDate = sortedDates[sortedDates.length - 1];

    detected.push({
      merchantName: group.merchantName,
      averageAmount: Math.round(avgAmount),
      frequency: frequency.name,
      confidence,
      nextChargeDate: extrapolateNextCharge(lastDate, frequency.days),
      firstChargeDate: firstDate,
      lastChargeDate: lastDate,
      transactionIds: group.transactions.map((t) => t.id),
      category: topCategory,
      occurrences: group.transactions.length,
    });
  }

  // Sort by confidence descending, then by amount
  detected.sort((a, b) => b.confidence - a.confidence || b.averageAmount - a.averageAmount);

  return detected;
}

export async function persistDetectedSubscriptions(
  userId: string,
  detected: DetectedSubscription[]
): Promise<{ created: number; updated: number; unchanged: number }> {
  let created = 0;
  let updated = 0;
  let unchanged = 0;

  for (const sub of detected) {
    const existing = await prisma.subscription.findFirst({
      where: { userId, merchantName: sub.merchantName },
    });

    if (existing) {
      // Only update if auto-detected (confidence < 100 means not manually confirmed)
      if (existing.confidence < 100) {
        const hasChanged =
          existing.amount !== sub.averageAmount ||
          existing.frequency !== sub.frequency ||
          existing.confidence !== sub.confidence;

        if (hasChanged) {
          await prisma.subscription.update({
            where: { id: existing.id },
            data: {
              amount: sub.averageAmount,
              frequency: sub.frequency,
              confidence: Math.max(existing.confidence, sub.confidence),
              nextChargeDate: sub.nextChargeDate,
              lastChargeDate: sub.lastChargeDate,
              firstChargeDate: sub.firstChargeDate ?? existing.firstChargeDate,
              category: sub.category ?? existing.category,
              transactionIds: sub.transactionIds,
            },
          });
          updated++;
        } else {
          unchanged++;
        }
      } else {
        // Update transaction IDs and dates even for confirmed subscriptions
        await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            transactionIds: sub.transactionIds,
            lastChargeDate: sub.lastChargeDate,
            nextChargeDate: sub.nextChargeDate,
          },
        });
        unchanged++;
      }
    } else {
      await prisma.subscription.create({
        data: {
          userId,
          merchantName: sub.merchantName,
          displayName: sub.merchantName,
          amount: sub.averageAmount,
          currency: "EUR",
          frequency: sub.frequency,
          category: sub.category,
          status: "ACTIVE",
          confidence: sub.confidence,
          nextChargeDate: sub.nextChargeDate,
          lastChargeDate: sub.lastChargeDate,
          firstChargeDate: sub.firstChargeDate,
          transactionIds: sub.transactionIds,
        },
      });
      created++;
    }
  }

  return { created, updated, unchanged };
}
