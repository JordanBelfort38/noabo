import type { MetadataRoute } from "next";

const MERCHANTS = [
  "Netflix", "Spotify", "Amazon Prime", "Disney+", "Canal+", "Deezer",
  "Apple", "Microsoft 365", "Adobe Creative Cloud",
  "Free Mobile", "Free", "Orange", "SFR", "Bouygues Telecom",
  "Basic-Fit", "Fitness Park", "EDF", "NordVPN",
  "YouTube Premium", "ChatGPT Plus", "MAIF", "AXA",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://noabo.fr";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/help/cancel`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/help/export-bank-statement`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const merchantPages: MetadataRoute.Sitemap = MERCHANTS.map((m) => ({
    url: `${baseUrl}/help/cancel/${encodeURIComponent(m)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...merchantPages];
}
