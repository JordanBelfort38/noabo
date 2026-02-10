import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description:
    "Gérez vos abonnements, suivez vos dépenses récurrentes et économisez avec No Abo.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
