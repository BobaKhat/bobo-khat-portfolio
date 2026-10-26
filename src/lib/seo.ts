import type { Metadata } from "next";

const SITE_URL = "https://bobokhat.com";

// Builds a complete metadata object (title + description + a full openGraph and
// twitter card) so every page's rendered HTML carries its own og:/twitter:
// tags without relying on parent-merge behaviour.
export function pageMetadata({
  title,
  description,
  path = "",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: "Bobo Khat",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
