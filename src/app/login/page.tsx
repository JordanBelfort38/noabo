"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg">
            NA
          </div>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte No Abo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-64 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />}>
            <LoginForm />
          </Suspense>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
            >
              Créer un compte
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
