import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides de résiliation",
  description:
    "Guides complets pour résilier vos abonnements en France : Netflix, Spotify, Canal+, Free, Orange, SFR et plus encore.",
  keywords: [
    "résilier abonnement",
    "résiliation Netflix",
    "résiliation Spotify",
    "résiliation Canal+",
    "lettre résiliation",
    "loi Hamon",
    "loi Chatel",
  ],
};

export default function CancelHelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
