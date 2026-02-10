import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon profil",
  description: "Gérez votre profil, vos préférences et la sécurité de votre compte No Abo.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
