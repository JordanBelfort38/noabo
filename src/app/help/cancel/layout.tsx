import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides de résiliation d'abonnements — Comment résilier en France",
  description:
    "Guides complets et gratuits pour résilier vos abonnements en France : Netflix, Spotify, Canal+, Free, Orange, SFR, Basic-Fit et 15+ autres services. Lettres types, étapes détaillées, lois applicables.",
  keywords: [
    "résilier abonnement",
    "comment résilier",
    "résiliation Netflix",
    "résiliation Spotify",
    "résiliation Canal+",
    "annuler abonnement",
    "lettre résiliation",
    "loi Hamon résiliation",
    "loi Chatel abonnement",
    "résiliation sans frais",
    "résilier streaming",
    "résilier opérateur",
  ],
  openGraph: {
    title: "Guides de résiliation d'abonnements — No Abo",
    description:
      "22 guides gratuits pour résilier vos abonnements en France. Netflix, Spotify, Canal+, Free, Orange et plus encore.",
  },
};

export default function CancelHelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
