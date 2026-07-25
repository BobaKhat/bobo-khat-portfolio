"use client";

import { useEffect, useState } from "react";
import GalleryVideo from "@/components/GalleryVideo";

export type GalleryItem = {
  type: "image" | "video";
  src: string;
  /** width / height, used to estimate rendered height per column width */
  aspect: number;
};

function useColumnCount() {
  const [columnCount, setColumnCount] = useState(3);

  useEffect(() => {
    const mqSm = window.matchMedia("(min-width: 640px)");
    const mqLg = window.matchMedia("(min-width: 1024px)");
    const update = () => setColumnCount(mqLg.matches ? 3 : mqSm.matches ? 2 : 1);
    update();
    mqSm.addEventListener("change", update);
    mqLg.addEventListener("change", update);
    return () => {
      mqSm.removeEventListener("change", update);
      mqLg.removeEventListener("change", update);
    };
  }, []);

  return columnCount;
}

export default function GalleryMasonry({ items }: { items: GalleryItem[] }) {
  const columnCount = useColumnCount();

  // Greedy "shortest column gets the next item" packing. Column width is
  // uniform within a given breakpoint, so relative rendered height for an
  // item is just 1 / aspect ratio — no DOM measurement needed, which means
  // no layout shift once this renders.
  const columns: GalleryItem[][] = Array.from({ length: columnCount }, () => []);
  const heights = new Array(columnCount).fill(0);
  for (const item of items) {
    let shortest = 0;
    for (let i = 1; i < columnCount; i++) {
      if (heights[i] < heights[shortest]) shortest = i;
    }
    columns[shortest].push(item);
    heights[shortest] += 1 / item.aspect;
  }

  return (
    <div className="flex gap-4 pb-16">
      {columns.map((col, i) => (
        <div key={i} className="flex flex-1 flex-col gap-4">
          {col.map((item) => (
            <div
              key={item.src}
              className="overflow-hidden rounded-xl border border-border bg-module"
            >
              {item.type === "video" ? (
                <GalleryVideo src={item.src} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.src}
                  alt="Visual experiment — graphic design or 3D render"
                  className="w-full"
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
