import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes résiliations",
  description:
    "Suivez vos demandes de résiliation et accédez aux guides pour résilier vos abonnements.",
};

export default function CancellationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
