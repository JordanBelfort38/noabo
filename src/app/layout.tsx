import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/Header";
import { OrganizationSchema } from "@/components/StructuredData";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "No Abo — Gérez et résiliez vos abonnements | Économisez jusqu'à 550€/an",
    template: "%s | No Abo",
  },
  description:
    "Détectez vos abonnements oubliés, suivez vos dépenses récurrentes et résiliez en quelques clics. Les Français dépensent 49€/mois en abonnements — reprenez le contrôle avec No Abo.",
  keywords: [
    "gestion abonnements",
    "résilier abonnement",
    "résiliation abonnement",
    "économiser argent",
    "abonnements oubliés",
    "suivi dépenses",
    "dépenses récurrentes",
    "annuler abonnement",
    "lettre résiliation",
    "loi hamon",
    "loi chatel",
    "budget mensuel",
    "abonnement streaming",
    "gérer ses abonnements",
    "no abo",
  ],
  authors: [{ name: "No Abo" }],
  creator: "No Abo",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "No Abo",
    title: "No Abo — Gérez et résiliez vos abonnements",
    description:
      "40% des Français paient des abonnements qu'ils n'utilisent plus. Détectez, analysez et résiliez vos abonnements inutiles. Économisez jusqu'à 550€/an.",
  },
  twitter: {
    card: "summary_large_image",
    title: "No Abo — Gérez et résiliez vos abonnements",
    description:
      "40% des Français paient des abonnements qu'ils n'utilisent plus. Économisez jusqu'à 550€/an avec No Abo.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://noabo.fr",
    languages: {
      "fr-FR": "https://noabo.fr",
    },
  },
  other: {
    "google-site-verification": "REPLACE_WITH_ACTUAL_CODE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <OrganizationSchema />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <SessionProvider>
            <Header />
            {children}
            <Toaster richColors position="bottom-right" />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
