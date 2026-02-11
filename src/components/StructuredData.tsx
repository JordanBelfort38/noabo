import { WebSiteSchema } from "@/components/seo/WebSiteSchema";

export function OrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://noabo.fr";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "No Abo",
            description:
              "Plateforme gratuite de gestion et résiliation d'abonnements en France. Détectez vos abonnements oubliés, suivez vos dépenses récurrentes et résiliez en quelques clics.",
            url: baseUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            inLanguage: "fr-FR",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
            },
            author: {
              "@type": "Organization",
              name: "No Abo",
              url: baseUrl,
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              ratingCount: "127",
              bestRating: "5",
            },
          }),
        }}
      />
      <WebSiteSchema />
    </>
  );
}
