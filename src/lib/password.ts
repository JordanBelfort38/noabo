import { hash, compare } from "bcryptjs";
import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return compare(password, hashedPassword);
}

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  checks: { label: string; passed: boolean }[];
} {
  const checks = [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "Contains uppercase letter", passed: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", passed: /[a-z]/.test(password) },
    { label: "Contains number", passed: /[0-9]/.test(password) },
    {
      label: "Contains special character",
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ];
  const score = checks.filter((c) => c.passed).length;
  const labels = [
    "Very weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
    "Very strong",
  ];
  return { score, label: labels[score], checks };
}
