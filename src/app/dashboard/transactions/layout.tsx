import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions",
  description:
    "Consultez et filtrez toutes vos transactions bancaires importées dans No Abo.",
};

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
