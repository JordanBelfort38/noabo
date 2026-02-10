import Papa from "papaparse";
import { type RawTransaction } from "@/lib/transaction-normalizer";

export interface CsvParserResult {
  transactions: RawTransaction[];
  errors: string[];
  bankFormat: string | null;
}

interface CsvRow {
  [key: string]: string;
}

interface BankFormat {
  name: string;
  detect: (headers: string[]) => boolean;
  parse: (row: CsvRow) => RawTransaction | null;
}

const BANK_FORMATS: BankFormat[] = [
  {
    name: "BNP Paribas",
    detect: (headers) => {
      const h = headers.map((s) => s.toLowerCase().trim());
      return (
        h.includes("date opération") ||
        h.includes("date operation") ||
        (h.includes("date") && h.includes("libellé") && h.includes("débit"))
      );
    },
    parse: (row) => {
      const date =
        row["Date opération"] ?? row["Date operation"] ?? row["Date"] ?? "";
      const description = row["Libellé"] ?? row["Libelle"] ?? row["Libellé simplifié"] ?? "";
      const debit = row["Débit"] ?? row["Debit"] ?? "";
      const credit = row["Crédit"] ?? row["Credit"] ?? "";
      if (!date || !description) return null;
      const amount = parseAmount(credit) - parseAmount(debit);
      return { date, description, amount };
    },
  },
  {
    name: "Crédit Agricole",
    detect: (headers) => {
      const h = headers.map((s) => s.toLowerCase().trim());
      return (
        h.includes("date") &&
        h.includes("libellé") &&
        h.includes("montant") &&
        !h.includes("débit")
      );
    },
    parse: (row) => {
      const date = row["Date"] ?? "";
      const description = row["Libellé"] ?? row["Libelle"] ?? "";
      const amountStr = row["Montant"] ?? "";
      if (!date || !description) return null;
      return { date, description, amount: parseAmount(amountStr) };
    },
  },
  {
    name: "Société Générale",
    detect: (headers) => {
      const h = headers.map((s) => s.toLowerCase().trim());
      return (
        h.includes("date de l'opération") ||
        (h.includes("date") && h.includes("détail de l'opération"))
      );
    },
    parse: (row) => {
      const date =
        row["Date de l'opération"] ?? row["Date"] ?? "";
      const description =
        row["Détail de l'opération"] ?? row["Libellé"] ?? row["Libelle"] ?? "";
      const debit = row["Débit"] ?? row["Debit"] ?? "";
      const credit = row["Crédit"] ?? row["Credit"] ?? "";
      const montant = row["Montant"] ?? "";
      if (!date || !description) return null;
      const amount = montant
        ? parseAmount(montant)
        : parseAmount(credit) - parseAmount(debit);
      return { date, description, amount };
    },
  },
  {
    name: "Boursorama",
    detect: (headers) => {
      const h = headers.map((s) => s.toLowerCase().trim());
      return (
        h.includes("dateop") ||
        (h.includes("date") && h.includes("label") && h.includes("amount"))
      );
    },
    parse: (row) => {
      const date = row["dateOp"] ?? row["Date"] ?? row["date"] ?? "";
      const description =
        row["label"] ?? row["Label"] ?? row["Libellé"] ?? "";
      const amountStr = row["amount"] ?? row["Amount"] ?? row["Montant"] ?? "";
      if (!date || !description) return null;
      return { date, description, amount: parseAmount(amountStr) };
    },
  },
  {
    name: "N26",
    detect: (headers) => {
      const h = headers.map((s) => s.toLowerCase().trim());
      return h.includes("date") && h.includes("payee") && h.includes("amount (eur)");
    },
    parse: (row) => {
      const date = row["Date"] ?? row["date"] ?? "";
      const description =
        row["Payee"] ?? row["payee"] ?? row["Payment reference"] ?? "";
      const amountStr =
        row["Amount (EUR)"] ?? row["amount (eur)"] ?? "";
      if (!date || !description) return null;
      return { date, description, amount: parseAmount(amountStr) };
    },
  },
];

function parseAmount(str: string): number {
  if (!str || str.trim() === "") return 0;
  const cleaned = str
    .replace(/\s/g, "")
    .replace(/€/g, "")
    .replace(/EUR/gi, "")
    .trim();
  // Handle French format: 1.234,56 or 1 234,56
  if (cleaned.includes(",")) {
    const parts = cleaned.split(",");
    const intPart = parts[0].replace(/\./g, "");
    const decPart = parts[1] ?? "00";
    return parseFloat(`${intPart}.${decPart}`);
  }
  return parseFloat(cleaned) || 0;
}

function detectBankFormat(headers: string[]): BankFormat | null {
  for (const format of BANK_FORMATS) {
    if (format.detect(headers)) {
      return format;
    }
  }
  return null;
}

function genericParse(row: CsvRow): RawTransaction | null {
  const keys = Object.keys(row);
  const lower = keys.map((k) => k.toLowerCase());

  const dateKey = keys[lower.findIndex((k) => k.includes("date"))] ?? keys[0];
  const descKey =
    keys[
      lower.findIndex(
        (k) =>
          k.includes("libellé") ||
          k.includes("libelle") ||
          k.includes("description") ||
          k.includes("label") ||
          k.includes("payee")
      )
    ] ?? keys[1];
  const amountKey =
    keys[
      lower.findIndex(
        (k) => k.includes("montant") || k.includes("amount") || k.includes("somme")
      )
    ];
  const debitKey =
    keys[lower.findIndex((k) => k.includes("débit") || k.includes("debit"))];
  const creditKey =
    keys[lower.findIndex((k) => k.includes("crédit") || k.includes("credit"))];

  if (!dateKey || !descKey) return null;

  const date = row[dateKey] ?? "";
  const description = row[descKey] ?? "";
  if (!date || !description) return null;

  let amount: number;
  if (amountKey && row[amountKey]) {
    amount = parseAmount(row[amountKey]);
  } else if (debitKey || creditKey) {
    amount =
      parseAmount(row[creditKey] ?? "") - parseAmount(row[debitKey] ?? "");
  } else {
    // Try third column as amount
    amount = parseAmount(row[keys[2]] ?? "");
  }

  return { date, description, amount };
}

export function parseCsv(
  content: string,
  options?: { delimiter?: string; encoding?: string }
): CsvParserResult {
  const errors: string[] = [];

  // Try to detect delimiter
  const firstLine = content.split("\n")[0] ?? "";
  let delimiter = options?.delimiter;
  if (!delimiter) {
    const semicolons = (firstLine.match(/;/g) ?? []).length;
    const commas = (firstLine.match(/,/g) ?? []).length;
    const tabs = (firstLine.match(/\t/g) ?? []).length;
    if (semicolons > commas && semicolons > tabs) delimiter = ";";
    else if (tabs > commas) delimiter = "\t";
    else delimiter = ",";
  }

  const result = Papa.parse<CsvRow>(content, {
    header: true,
    delimiter,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  });

  if (result.errors.length > 0) {
    for (const err of result.errors) {
      errors.push(`Ligne ${err.row ?? "?"}: ${err.message}`);
    }
  }

  if (!result.data.length || !result.meta.fields?.length) {
    return { transactions: [], errors: ["Fichier CSV vide ou format non reconnu"], bankFormat: null };
  }

  const headers = result.meta.fields;
  const bankFormat = detectBankFormat(headers);
  const parser = bankFormat?.parse ?? genericParse;

  const transactions: RawTransaction[] = [];
  for (let i = 0; i < result.data.length; i++) {
    const row = result.data[i];
    try {
      const tx = parser(row);
      if (tx && tx.date && tx.description) {
        transactions.push(tx);
      }
    } catch {
      errors.push(`Ligne ${i + 2}: Erreur de parsing`);
    }
  }

  return {
    transactions,
    errors,
    bankFormat: bankFormat?.name ?? "Format générique",
  };
}
