"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { z } from "zod";

import { passwordSchema } from "@/lib/password";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";

const clientResetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof clientResetSchema>;

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(clientResetSchema),
  });

  const password = watch("password", "");

  const onSubmit = async (data: ResetFormData) => {
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        if (res.status === 400 && body.error === "Invalid or expired token") {
          setError("Ce lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.");
        } else if (res.status === 429) {
          setError("Trop de tentatives. Veuillez réessayer plus tard.");
        } else {
          setError("Une erreur est survenue. Veuillez réessayer.");
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch {
      setError("Erreur de connexion. Veuillez vérifier votre connexion internet.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Réinitialiser le mot de passe</CardTitle>
          <CardDescription>
            Choisissez un nouveau mot de passe pour votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Mot de passe modifié !</p>
                <p className="mt-1">
                  Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers
                  la page de connexion...
                </p>
                <Link
                  href="/login"
                  className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Se connecter maintenant
                </Link>
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre nouveau mot de passe"
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
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
                  <p id="password-error" className="text-xs text-red-600 dark:text-red-400">
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Réinitialisation en cours...
                  </>
                ) : (
                  "Réinitialiser le mot de passe"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
