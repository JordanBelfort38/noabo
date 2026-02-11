export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://noabo.fr";

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
          })),
        }),
      }}
    />
  );
}
