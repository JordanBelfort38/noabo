export function OrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://noabo.fr";

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "No Abo",
          description:
            "Plateforme de gestion et résiliation d'abonnements. Détectez vos abonnements oubliés, suivez vos dépenses et résiliez en quelques clics.",
          url: baseUrl,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
          },
          author: {
            "@type": "Organization",
            name: "No Abo",
            url: baseUrl,
          },
        }),
      }}
    />
  );
}
