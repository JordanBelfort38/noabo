interface LetterData {
  // Sender info
  senderName: string;
  senderAddress: string;
  senderPostalCode: string;
  senderCity: string;
  senderEmail: string;
  customerNumber?: string;

  // Service info
  serviceName: string;
  serviceAddress: string;

  // Template
  template: string;
  lawReference?: string;
}

export function generateLetterText(data: LetterData): string {
  const date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let text = data.template;

  // Replace all template variables
  const replacements: Record<string, string> = {
    "{{NOM}}": data.senderName,
    "{{ADRESSE}}": data.senderAddress,
    "{{CODE_POSTAL}}": data.senderPostalCode,
    "{{VILLE}}": data.senderCity,
    "{{EMAIL}}": data.senderEmail,
    "{{NUM_CLIENT}}": data.customerNumber ?? "(non renseigné)",
    "{{SERVICE}}": data.serviceName,
    "{{SERVICE_ADRESSE}}": data.serviceAddress,
    "{{DATE}}": date,
    "{{LOI}}": data.lawReference
      ? ` (${data.lawReference})`
      : "",
  };

  for (const [key, value] of Object.entries(replacements)) {
    text = text.replaceAll(key, value);
  }

  return text;
}

export function generateEmailText(data: {
  senderName: string;
  senderEmail: string;
  serviceName: string;
  template: string;
  lawReference?: string;
  customerNumber?: string;
}): string {
  const date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let text = data.template;

  const replacements: Record<string, string> = {
    "{{NOM}}": data.senderName,
    "{{EMAIL}}": data.senderEmail,
    "{{SERVICE}}": data.serviceName,
    "{{NUM_CLIENT}}": data.customerNumber ?? "",
    "{{DATE}}": date,
    "{{LOI}}": data.lawReference
      ? ` (${data.lawReference})`
      : "",
  };

  for (const [key, value] of Object.entries(replacements)) {
    text = text.replaceAll(key, value);
  }

  return text;
}

// Generate a simple text-based PDF-like content (plain text for download)
// For a real PDF, you'd use a library like pdfkit or jspdf
export function generateLetterForDownload(data: LetterData): {
  content: string;
  filename: string;
} {
  const text = generateLetterText(data);
  const sanitizedName = data.serviceName
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase();
  const dateStr = new Date().toISOString().split("T")[0];

  return {
    content: text,
    filename: `lettre-resiliation-${sanitizedName}-${dateStr}.txt`,
  };
}
