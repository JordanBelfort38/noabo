"use client";

import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

const requirements = [
  { label: "Au moins 8 caractères", test: (p: string) => p.length >= 8 },
  { label: "Une lettre majuscule", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Une lettre minuscule", test: (p: string) => /[a-z]/.test(p) },
  { label: "Un chiffre", test: (p: string) => /[0-9]/.test(p) },
  { label: "Un caractère spécial", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const passed = requirements.filter((r) => r.test(password)).length;
  const total = requirements.length;
  const percentage = (passed / total) * 100;

  const getStrengthLabel = () => {
    if (passed <= 1) return "Très faible";
    if (passed <= 2) return "Faible";
    if (passed <= 3) return "Moyen";
    if (passed <= 4) return "Fort";
    return "Très fort";
  };

  const getStrengthColor = () => {
    if (passed <= 1) return "bg-red-500";
    if (passed <= 2) return "bg-orange-500";
    if (passed <= 3) return "bg-yellow-500";
    if (passed <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getTextColor = () => {
    if (passed <= 1) return "text-red-600 dark:text-red-400";
    if (passed <= 2) return "text-orange-600 dark:text-orange-400";
    if (passed <= 3) return "text-yellow-600 dark:text-yellow-400";
    if (passed <= 4) return "text-blue-600 dark:text-blue-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="mt-2 space-y-3" role="status" aria-label="Indicateur de force du mot de passe">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className={cn("text-xs font-medium", getTextColor())}>
            {getStrengthLabel()}
          </span>
          <span className="text-xs text-zinc-400">
            {passed}/{total}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className={cn("h-full rounded-full transition-all duration-300", getStrengthColor())}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={passed}
            aria-valuemin={0}
            aria-valuemax={total}
          />
        </div>
      </div>

      <ul className="space-y-1" aria-label="Exigences du mot de passe">
        {requirements.map((req) => {
          const isPassed = req.test(password);
          return (
            <li
              key={req.label}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                isPassed
                  ? "text-green-600 dark:text-green-400"
                  : "text-zinc-400 dark:text-zinc-500"
              )}
            >
              {isPassed ? (
                <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
              ) : (
                <X className="h-3 w-3 shrink-0" aria-hidden="true" />
              )}
              <span>{req.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
