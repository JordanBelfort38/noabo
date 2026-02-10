import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { generateLetterText, generateEmailText } from "@/lib/letter-generator";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const {
      merchantName,
      type,
      senderName,
      senderAddress,
      senderPostalCode,
      senderCity,
      senderEmail,
      customerNumber,
    } = body as {
      merchantName?: string;
      type?: "letter" | "email";
      senderName?: string;
      senderAddress?: string;
      senderPostalCode?: string;
      senderCity?: string;
      senderEmail?: string;
      customerNumber?: string;
    };

    if (!merchantName || !type || !senderName) {
      return NextResponse.json(
        { error: "merchantName, type et senderName sont requis" },
        { status: 400 }
      );
    }

    const template = await prisma.cancellationTemplate.findUnique({
      where: { merchantName },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Aucun template trouvé pour ce service" },
        { status: 404 }
      );
    }

    if (type === "letter") {
      if (!senderAddress || !senderPostalCode || !senderCity) {
        return NextResponse.json(
          { error: "Adresse complète requise pour une lettre" },
          { status: 400 }
        );
      }

      const letterTpl = template.letterTemplate ?? template.emailTemplate;
      if (!letterTpl) {
        return NextResponse.json(
          { error: "Aucun modèle de lettre disponible pour ce service" },
          { status: 404 }
        );
      }

      const text = generateLetterText({
        senderName,
        senderAddress,
        senderPostalCode,
        senderCity,
        senderEmail: senderEmail ?? session!.user.email ?? "",
        customerNumber,
        serviceName: template.displayName,
        serviceAddress: template.postalAddress ?? "Adresse non disponible",
        template: letterTpl,
        lawReference: template.lawReference ?? undefined,
      });

      return NextResponse.json({
        type: "letter",
        text,
        filename: `lettre-resiliation-${merchantName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.txt`,
        postalAddress: template.postalAddress,
      });
    } else {
      const emailTpl = template.emailTemplate;
      if (!emailTpl) {
        return NextResponse.json(
          { error: "Aucun modèle d'email disponible pour ce service" },
          { status: 404 }
        );
      }

      const text = generateEmailText({
        senderName,
        senderEmail: senderEmail ?? session!.user.email ?? "",
        serviceName: template.displayName,
        template: emailTpl,
        lawReference: template.lawReference ?? undefined,
        customerNumber,
      });

      return NextResponse.json({
        type: "email",
        text,
        emailAddress: template.emailAddress,
        subject: `Demande de résiliation - ${template.displayName}`,
      });
    }
  } catch (err) {
    console.error("Letter generation error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la génération du document" },
      { status: 500 }
    );
  }
}
