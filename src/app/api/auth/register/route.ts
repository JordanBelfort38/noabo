import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validations";
import { generateVerificationToken } from "@/lib/tokens";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = rateLimit(`register:${ip}`, {
    limit: 5,
    windowSeconds: 900,
  });
  if (!success) {
    return NextResponse.json({ error: "Trop de tentatives. Veuillez réessayer plus tard." }, { status: 429 });
  }

  try {
    const body = await request.json();
    console.log("[register] Requête reçue pour:", body.email ?? "email manquant");

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      console.log("[register] Erreur de validation:", parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: "Données invalides. Vérifiez les champs du formulaire." },
        { status: 400 },
      );
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log("[register] Email déjà utilisé:", email);
      return NextResponse.json(
        { error: "Cette adresse e-mail est déjà utilisée." },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gdprConsent: true,
        gdprConsentAt: new Date(),
      },
    });
    console.log("[register] Utilisateur créé:", user.id);

    const token = await generateVerificationToken(email);

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[DEV] Verification URL: ${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/auth/verify?token=${token}`,
      );
    }

    return NextResponse.json(
      { message: "Inscription réussie. Vérifiez votre e-mail pour activer votre compte." },
      { status: 201 },
    );
  } catch (err) {
    console.error("[register] Erreur:", err);

    // Prisma connection error
    const error = err as { code?: string; message?: string };
    if (error.code === "P1001" || error.code === "P1002" || error.message?.includes("Can't reach database")) {
      return NextResponse.json(
        { error: "Erreur de connexion à la base de données. Veuillez réessayer." },
        { status: 503 },
      );
    }

    // Prisma unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Cette adresse e-mail est déjà utilisée." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Erreur serveur. Veuillez réessayer plus tard." },
      { status: 500 },
    );
  }
}
