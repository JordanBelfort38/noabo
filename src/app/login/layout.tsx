import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion — Accédez à votre espace No Abo",
  description:
    "Connectez-vous à No Abo pour suivre vos abonnements, détecter les dépenses inutiles et économiser jusqu'à 550€/an. Accès gratuit et sécurisé.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
