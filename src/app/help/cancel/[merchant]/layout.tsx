import type { Metadata } from "next";

const MERCHANT_SEO: Record<string, { display: string; keywords: string[] }> = {
  Netflix: {
    display: "Netflix",
    keywords: ["résilier netflix", "annuler netflix", "résiliation netflix france", "comment résilier netflix", "se désabonner netflix"],
  },
  Spotify: {
    display: "Spotify",
    keywords: ["résilier spotify", "annuler spotify premium", "résiliation spotify", "comment résilier spotify"],
  },
  "Amazon Prime": {
    display: "Amazon Prime",
    keywords: ["résilier amazon prime", "annuler amazon prime", "se désabonner amazon prime", "résiliation amazon prime"],
  },
  "Disney+": {
    display: "Disney+",
    keywords: ["résilier disney plus", "annuler disney+", "résiliation disney+", "comment résilier disney+"],
  },
  "Canal+": {
    display: "Canal+",
    keywords: ["résilier canal plus", "résiliation canal+", "lettre résiliation canal+", "annuler canal plus", "loi chatel canal+"],
  },
  Deezer: {
    display: "Deezer",
    keywords: ["résilier deezer", "annuler deezer premium", "résiliation deezer"],
  },
  Apple: {
    display: "Apple (iCloud+, Apple Music, Apple TV+)",
    keywords: ["résilier apple music", "annuler icloud+", "résiliation apple tv+", "annuler abonnement apple"],
  },
  "Microsoft 365": {
    display: "Microsoft 365",
    keywords: ["résilier microsoft 365", "annuler microsoft 365", "résiliation office 365"],
  },
  "Adobe Creative Cloud": {
    display: "Adobe Creative Cloud",
    keywords: ["résilier adobe", "annuler adobe creative cloud", "résiliation adobe", "frais résiliation adobe"],
  },
  "Free Mobile": {
    display: "Free Mobile",
    keywords: ["résilier free mobile", "résiliation free mobile", "annuler forfait free"],
  },
  Free: {
    display: "Free (Freebox)",
    keywords: ["résilier freebox", "résiliation free internet", "annuler freebox", "lettre résiliation free"],
  },
  Orange: {
    display: "Orange",
    keywords: ["résilier orange", "résiliation orange", "annuler orange", "résilier livebox"],
  },
  SFR: {
    display: "SFR",
    keywords: ["résilier sfr", "résiliation sfr", "annuler sfr", "lettre résiliation sfr"],
  },
  "Bouygues Telecom": {
    display: "Bouygues Telecom",
    keywords: ["résilier bouygues", "résiliation bouygues telecom", "annuler bouygues"],
  },
  "Basic-Fit": {
    display: "Basic-Fit",
    keywords: ["résilier basic-fit", "résiliation basic fit", "annuler basic fit", "lettre résiliation salle sport"],
  },
  "Fitness Park": {
    display: "Fitness Park",
    keywords: ["résilier fitness park", "résiliation fitness park", "annuler fitness park"],
  },
  EDF: {
    display: "EDF",
    keywords: ["résilier edf", "résiliation edf", "annuler contrat edf", "résilier edf déménagement"],
  },
  NordVPN: {
    display: "NordVPN",
    keywords: ["résilier nordvpn", "annuler nordvpn", "résiliation nordvpn", "remboursement nordvpn"],
  },
  "YouTube Premium": {
    display: "YouTube Premium",
    keywords: ["résilier youtube premium", "annuler youtube premium", "résiliation youtube premium"],
  },
  "ChatGPT Plus": {
    display: "ChatGPT Plus",
    keywords: ["résilier chatgpt plus", "annuler chatgpt plus", "résiliation openai"],
  },
  MAIF: {
    display: "MAIF Assurance",
    keywords: ["résilier maif", "résiliation maif", "lettre résiliation maif", "loi hamon maif"],
  },
  AXA: {
    display: "AXA Assurance",
    keywords: ["résilier axa", "résiliation axa", "lettre résiliation axa", "loi hamon axa"],
  },
};

interface Props {
  params: Promise<{ merchant: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { merchant } = await params;
  const decoded = decodeURIComponent(merchant);
  const seo = MERCHANT_SEO[decoded];
  const display = seo?.display ?? decoded;

  return {
    title: `Comment résilier ${display} — Guide complet ${new Date().getFullYear()}`,
    description: `Guide gratuit et complet pour résilier ${display} en France. Étapes détaillées, lettres types, lois applicables (Loi Hamon, Loi Chatel). Résiliez en quelques minutes.`,
    keywords: seo?.keywords ?? [`résilier ${decoded}`, `résiliation ${decoded}`, `annuler ${decoded}`],
    openGraph: {
      title: `Résilier ${display} — Guide de résiliation No Abo`,
      description: `Comment résilier ${display} facilement ? Guide étape par étape, modèles de lettres et conseils juridiques gratuits.`,
    },
    alternates: {
      canonical: `/help/cancel/${encodeURIComponent(decoded)}`,
    },
  };
}

export default function MerchantCancelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
