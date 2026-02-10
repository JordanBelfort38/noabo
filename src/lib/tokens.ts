import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export async function generateVerificationToken(
  email: string,
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  return token;
}

export async function verifyEmailToken(token: string): Promise<string | null> {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) return null;

  await prisma.verificationToken.delete({ where: { token } });

  return record.identifier;
}

export async function generatePasswordResetToken(
  email: string,
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.deleteMany({ where: { email } });

  await prisma.passwordResetToken.create({
    data: { email, token, expires },
  });

  return token;
}

export async function verifyPasswordResetToken(
  token: string,
): Promise<string | null> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) return null;

  await prisma.passwordResetToken.delete({ where: { token } });

  return record.email;
}
