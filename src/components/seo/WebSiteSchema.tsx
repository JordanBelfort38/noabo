export function WebSiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://noabo.fr";

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "No Abo",
          url: baseUrl,
          description:
            "Plateforme gratuite de gestion et résiliation d'abonnements en France. Détectez, suivez et résiliez vos abonnements inutiles.",
          inLanguage: "fr-FR",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${baseUrl}/help/cancel?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }),
      }}
    />
  );
}
