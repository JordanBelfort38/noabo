"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gdprConsent: false as unknown as true,
    },
  });

  const password = watch("password", "");
  const gdprConsent = watch("gdprConsent");

  const onSubmit = async (data: RegisterInput) => {
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let body: { error?: string; message?: string } = {};
      try {
        body = await res.json();
      } catch {
        // Response was not JSON (e.g. 500 HTML error page)
      }

      if (!res.ok) {
        if (typeof body.error === "string") {
          setError(body.error);
        } else if (res.status === 409) {
          setError("Cette adresse e-mail est déjà utilisée.");
        } else if (res.status === 429) {
          setError("Trop de tentatives. Veuillez réessayer plus tard.");
        } else if (res.status === 503) {
          setError("Service temporairement indisponible. Veuillez réessayer.");
        } else if (res.status >= 500) {
          setError("Erreur serveur. Veuillez réessayer plus tard.");
        } else {
          setError("Une erreur est survenue. Veuillez réessayer.");
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError("Impossible de contacter le serveur. Vérifiez votre connexion internet.");
    }
  };

  if (success) {
    return (
      <Alert variant="success">
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium">Inscription réussie !</p>
          <p className="mt-1">
            Un e-mail de vérification a été envoyé à votre adresse. Veuillez vérifier votre boîte
            de réception pour activer votre compte.
          </p>
          <Link
            href="/login"
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Retour à la connexion
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <Input
          id="name"
          type="text"
          placeholder="Jean Dupont"
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="name-error" className="text-xs text-red-600 dark:text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Adresse e-mail</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="vous@exemple.fr"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "register-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="register-email-error" className="text-xs text-red-600 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Mot de passe</Label>
        <div className="relative">
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="Créez un mot de passe fort"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "register-password-error" : undefined}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p id="register-password-error" className="text-xs text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
        <PasswordStrengthIndicator password={password ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmez votre mot de passe"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p id="confirm-password-error" className="text-xs text-red-600 dark:text-red-400">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Checkbox
            id="gdprConsent"
            checked={!!gdprConsent}
            onCheckedChange={(checked) => setValue("gdprConsent", checked as true, { shouldValidate: true })}
            aria-invalid={!!errors.gdprConsent}
          />
          <Label htmlFor="gdprConsent" className="text-sm font-normal leading-snug cursor-pointer">
            J&apos;accepte la{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank">
              politique de confidentialité
            </Link>{" "}
            et les{" "}
            <Link href="/terms" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank">
              conditions d&apos;utilisation
            </Link>
          </Label>
        </div>
        {errors.gdprConsent && (
          <p className="text-xs text-red-600 dark:text-red-400">
            Vous devez accepter la politique de confidentialité
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Inscription en cours...
          </>
        ) : (
          "Créer un compte"
        )}
      </Button>
    </form>
  );
}
