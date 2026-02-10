import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description:
    "Réinitialisez votre mot de passe No Abo en quelques étapes simples.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
