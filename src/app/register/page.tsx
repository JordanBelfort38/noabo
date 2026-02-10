"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg">
            NA
          </div>
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>
            Inscrivez-vous pour gérer vos abonnements avec No Abo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
            >
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
