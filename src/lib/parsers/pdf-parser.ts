import { type RawTransaction } from "@/lib/transaction-normalizer";

export interface PdfParserResult {
  transactions: RawTransaction[];
  errors: string[];
  pageCount: number;
}

// Transaction line patterns for common French bank statements
const TRANSACTION_PATTERNS = [
  // DD/MM/YYYY description amount (with optional negative sign)
  /^(\d{2}[/.-]\d{2}[/.-]\d{2,4})\s+(.+?)\s+(-?\s*[\d\s]+[.,]\d{2})\s*$/,
  // DD/MM description amount (short year implied)
  /^(\d{2}[/.-]\d{2})\s+(.+?)\s+(-?\s*[\d\s]+[.,]\d{2})\s*$/,
  // DD/MM/YYYY description debit credit
  /^(\d{2}[/.-]\d{2}[/.-]\d{2,4})\s+(.+?)\s+([\d\s]+[.,]\d{2})?\s+([\d\s]+[.,]\d{2})?\s*$/,
];

function parseAmountFromPdf(str: string): number {
  if (!str || str.trim() === "") return 0;
  const cleaned = str.replace(/\s/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function tryParseTransactionLine(line: string): RawTransaction | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 10) return null;

  for (const pattern of TRANSACTION_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const date = match[1];
      const description = match[2]?.trim();
      if (!date || !description) continue;

      // Pattern with single amount
      if (match[3] && !match[4]) {
        const amount = parseAmountFromPdf(match[3]);
        return { date, description, amount };
      }

      // Pattern with debit/credit columns
      if (match[3] || match[4]) {
        const debit = parseAmountFromPdf(match[3] ?? "");
        const credit = parseAmountFromPdf(match[4] ?? "");
        const amount = credit - debit;
        return { date, description, amount };
      }
    }
  }

  return null;
}

export async function parsePdf(buffer: Buffer): Promise<PdfParserResult> {
  const errors: string[] = [];
  let pageCount = 0;

  try {
    // Dynamic import to avoid issues in client-side bundling
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ numpages: number; text: string }>;
    const data = await pdfParse(buffer);
    pageCount = data.numpages;

    const lines = data.text.split("\n");
    const transactions: RawTransaction[] = [];

    for (let i = 0; i < lines.length; i++) {
      const tx = tryParseTransactionLine(lines[i]);
      if (tx) {
        transactions.push(tx);
      }
    }

    if (transactions.length === 0) {
      errors.push(
        "Aucune transaction détectée dans le PDF. Le format de votre relevé bancaire n'est peut-être pas supporté."
      );
    }

    return { transactions, errors, pageCount };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return {
      transactions: [],
      errors: [`Erreur lors de la lecture du PDF : ${message}`],
      pageCount,
    };
  }
}
