import { type RawTransaction } from "@/lib/transaction-normalizer";

export interface OfxParserResult {
  transactions: RawTransaction[];
  errors: string[];
  accountInfo: {
    bankId?: string;
    accountId?: string;
    accountType?: string;
    currency?: string;
  } | null;
}

interface OfxTransaction {
  type: string;
  datePosted: string;
  amount: string;
  name?: string;
  memo?: string;
  fitId?: string;
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>([^<\\n]+)`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function extractBlocks(xml: string, tag: string): string[] {
  const blocks: string[] = [];
  const openTag = `<${tag}>`;
  const closeTag = `</${tag}>`;
  let start = xml.indexOf(openTag);

  while (start !== -1) {
    const end = xml.indexOf(closeTag, start);
    if (end === -1) break;
    blocks.push(xml.substring(start + openTag.length, end));
    start = xml.indexOf(openTag, end + closeTag.length);
  }

  return blocks;
}

function parseOfxDate(dateStr: string): string {
  // OFX dates: YYYYMMDDHHMMSS or YYYYMMDD
  const clean = dateStr.replace(/\[.*\]/, "").trim();
  if (clean.length >= 8) {
    const year = clean.substring(0, 4);
    const month = clean.substring(4, 6);
    const day = clean.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

function parseOfxTransaction(block: string): OfxTransaction | null {
  const type = extractTag(block, "TRNTYPE");
  const datePosted = extractTag(block, "DTPOSTED");
  const amount = extractTag(block, "TRNAMT");
  const name = extractTag(block, "NAME");
  const memo = extractTag(block, "MEMO");
  const fitId = extractTag(block, "FITID");

  if (!datePosted || !amount) return null;

  return {
    type: type ?? "OTHER",
    datePosted,
    amount,
    name: name ?? undefined,
    memo: memo ?? undefined,
    fitId: fitId ?? undefined,
  };
}

export function parseOfx(content: string): OfxParserResult {
  const errors: string[] = [];

  // Strip SGML header (OFX 1.x)
  let xml = content;
  const ofxStart = content.indexOf("<OFX>");
  if (ofxStart === -1) {
    // Try lowercase
    const ofxStartLower = content.toLowerCase().indexOf("<ofx>");
    if (ofxStartLower === -1) {
      return {
        transactions: [],
        errors: ["Format OFX non reconnu : balise <OFX> introuvable"],
        accountInfo: null,
      };
    }
    xml = content.substring(ofxStartLower);
  } else {
    xml = content.substring(ofxStart);
  }

  // Extract account info
  const bankId = extractTag(xml, "BANKID");
  const accountId = extractTag(xml, "ACCTID");
  const accountType = extractTag(xml, "ACCTTYPE");
  const currency = extractTag(xml, "CURDEF");

  const accountInfo = {
    bankId: bankId ?? undefined,
    accountId: accountId ?? undefined,
    accountType: accountType ?? undefined,
    currency: currency ?? undefined,
  };

  // Extract transactions
  const txBlocks = extractBlocks(xml, "STMTTRN");
  const transactions: RawTransaction[] = [];

  for (let i = 0; i < txBlocks.length; i++) {
    try {
      const ofxTx = parseOfxTransaction(txBlocks[i]);
      if (!ofxTx) {
        errors.push(`Transaction ${i + 1}: données manquantes`);
        continue;
      }

      const date = parseOfxDate(ofxTx.datePosted);
      const description = ofxTx.name ?? ofxTx.memo ?? "Transaction inconnue";
      const amount = parseFloat(ofxTx.amount);

      if (isNaN(amount)) {
        errors.push(`Transaction ${i + 1}: montant invalide "${ofxTx.amount}"`);
        continue;
      }

      transactions.push({
        date,
        description,
        amount,
        currency: currency ?? "EUR",
      });
    } catch {
      errors.push(`Transaction ${i + 1}: erreur de parsing`);
    }
  }

  return { transactions, errors, accountInfo };
}
