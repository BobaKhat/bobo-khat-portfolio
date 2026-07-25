"use client";

import dynamic from "next/dynamic";
import type { GalleryItem } from "@/components/GalleryMasonry";

const GalleryMasonry = dynamic(() => import("@/components/GalleryMasonry"), {
  ssr: false,
});

export default function GalleryMasonryLoader({ items }: { items: GalleryItem[] }) {
  return <GalleryMasonry items={items} />;
}
