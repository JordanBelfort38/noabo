import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connecter une banque",
  description:
    "Connectez votre banque en toute sécurité via Open Banking (DSP2) pour détecter automatiquement vos abonnements.",
};

export default function BankConnectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
