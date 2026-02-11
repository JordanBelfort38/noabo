import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte gratuit — Gérez vos abonnements avec No Abo",
  description:
    "Inscription gratuite en 30 secondes. Détectez vos abonnements oubliés, suivez vos dépenses récurrentes et économisez jusqu'à 550€/an. Aucune carte bancaire requise.",
  keywords: [
    "créer compte gestion abonnements",
    "inscription gratuite",
    "gérer ses abonnements",
    "suivi abonnements gratuit",
  ],
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
