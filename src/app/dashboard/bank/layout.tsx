import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes comptes bancaires",
  description:
    "Gérez vos connexions bancaires et synchronisez vos transactions automatiquement.",
};

export default function BankLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
