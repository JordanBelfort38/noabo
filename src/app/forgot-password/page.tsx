"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok && res.status === 429) {
        setError("Trop de tentatives. Veuillez réessayer plus tard.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Erreur de connexion. Veuillez vérifier votre connexion internet.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre adresse e-mail pour recevoir un lien de réinitialisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">E-mail envoyé !</p>
                <p className="mt-1">
                  Si un compte existe avec cette adresse, vous recevrez un lien de
                  réinitialisation dans quelques minutes.
                </p>
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
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.fr"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  {...register("email")}
                />
                {errors.email && (
                  <p id="email-error" className="text-xs text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le lien"
                )}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
            >
              <ArrowLeft className="h-3 w-3" />
              Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
