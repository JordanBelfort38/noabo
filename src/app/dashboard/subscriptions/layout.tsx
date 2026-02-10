import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abonnements",
  description:
    "Gérez vos abonnements détectés, confirmez-les et suivez vos dépenses récurrentes.",
};

export default function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
