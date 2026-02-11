import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://noabo.fr";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/help/", "/login", "/register", "/privacy", "/terms"],
        disallow: ["/dashboard/", "/api/", "/profile/", "/forgot-password/", "/reset-password/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
