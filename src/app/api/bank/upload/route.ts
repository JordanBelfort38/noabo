import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { parseCsv } from "@/lib/parsers/csv-parser";
import { parseOfx } from "@/lib/parsers/ofx-parser";
import { parsePdf } from "@/lib/parsers/pdf-parser";
import { normalizeTransactions, type RawTransaction } from "@/lib/transaction-normalizer";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = rateLimit(`upload:${ip}`, { limit: 5, windowSeconds: 3600 });
  if (!success) {
    return NextResponse.json(
      { error: "Trop de tentatives. Veuillez réessayer plus tard." },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Le fichier dépasse la taille maximale de 10 Mo" },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const extension = fileName.split(".").pop() ?? "";

    if (!["csv", "pdf", "ofx", "qif"].includes(extension)) {
      return NextResponse.json(
        { error: "Format non supporté. Formats acceptés : CSV, PDF, OFX, QIF" },
        { status: 400 }
      );
    }

    let rawTransactions: RawTransaction[] = [];
    let parserErrors: string[] = [];
    let bankFormat: string | null = null;
    let importSource = extension;

    if (extension === "csv") {
      const text = await file.text();
      const result = parseCsv(text);
      rawTransactions = result.transactions;
      parserErrors = result.errors;
      bankFormat = result.bankFormat;
      importSource = "csv";
    } else if (extension === "ofx" || extension === "qif") {
      const text = await file.text();
      const result = parseOfx(text);
      rawTransactions = result.transactions;
      parserErrors = result.errors;
      bankFormat = result.accountInfo?.bankId ?? "OFX";
      importSource = "ofx";
    } else if (extension === "pdf") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await parsePdf(buffer);
      rawTransactions = result.transactions;
      parserErrors = result.errors;
      bankFormat = `PDF (${result.pageCount} pages)`;
      importSource = "pdf";
    }

    if (rawTransactions.length === 0) {
      return NextResponse.json(
        {
          error: "Aucune transaction trouvée dans le fichier",
          details: parserErrors,
          bankFormat,
        },
        { status: 422 }
      );
    }

    // Normalize transactions
    const normalized = normalizeTransactions(rawTransactions);

    // Find or create a manual bank account for uploads
    let bankAccount = await prisma.bankAccount.findFirst({
      where: {
        userId: session!.user.id,
        accountType: "checking",
        bankConnectionId: null,
      },
    });

    if (!bankAccount) {
      bankAccount = await prisma.bankAccount.create({
        data: {
          userId: session!.user.id,
          name: "Import manuel",
          accountType: "checking",
          currency: "EUR",
        },
      });
    }

    // Store transactions (skip duplicates by checking date + amount + description)
    let importedCount = 0;
    let skippedCount = 0;

    for (const tx of normalized) {
      // Simple duplicate detection
      const existing = await prisma.transaction.findFirst({
        where: {
          userId: session!.user.id,
          date: tx.date,
          amount: tx.amount,
          description: tx.description,
        },
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      await prisma.transaction.create({
        data: {
          userId: session!.user.id,
          bankAccountId: bankAccount.id,
          date: tx.date,
          description: tx.description,
          rawDescription: tx.rawDescription,
          amount: tx.amount,
          currency: tx.currency,
          category: tx.category,
          merchantName: tx.merchantName,
          importSource,
          isRecurring: tx.isRecurring,
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            bankFormat,
            importedAt: new Date().toISOString(),
          },
        },
      });
      importedCount++;
    }

    return NextResponse.json({
      message: `${importedCount} transaction(s) importée(s) avec succès`,
      imported: importedCount,
      skipped: skippedCount,
      total: normalized.length,
      bankFormat,
      errors: parserErrors.length > 0 ? parserErrors : undefined,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Erreur lors du traitement du fichier" },
      { status: 500 }
    );
  }
}
