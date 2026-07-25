import Link from "next/link";
import type { GalleryItem } from "@/components/GalleryMasonry";
import GalleryMasonryLoader from "@/components/GalleryMasonryLoader";

export const metadata = {
  title: "Visual Experiments — Bobo Khat",
  description: "Graphic design and 3D renders",
};

const img = (file: string, aspect: number): GalleryItem => ({
  type: "image",
  src: `/images/visual-experiments/${file}`,
  aspect,
});
const vid = (file: string, aspect: number): GalleryItem => ({
  type: "video",
  src: `/videos/visual-experiments/${file}`,
  aspect,
});

// Videos sprinkled through the images roughly every third tile. Aspect
// ratios (width / height) are the real measured values for each asset, used
// to pack columns evenly without needing to measure the DOM.
const items: GalleryItem[] = [
  img("ve-01.jpg", 1.004),
  img("ve-02.jpg", 0.863),
  vid("ve-01.mp4", 1.78),
  img("ve-03.jpg", 1.537),
  img("ve-04.jpg", 1.0),
  vid("ve-02.mp4", 1.478),
  img("ve-05.jpg", 0.8),
  img("ve-06.jpg", 1.778),
  vid("ve-03.mp4", 1.78),
  img("ve-07.jpg", 0.791),
  img("ve-08.jpg", 0.803),
  vid("ve-04.mp4", 0.562),
  img("ve-09.jpg", 1.143),
  img("ve-10.jpg", 1.0),
  vid("ve-05.mp4", 1.0),
  img("ve-11.jpg", 0.8),
  img("ve-12.jpg", 0.994),
  vid("ve-06.mp4", 0.625),
  img("ve-13.jpg", 0.8),
  img("ve-14.jpg", 1.0),
  vid("ve-07.mp4", 1.0),
  img("ve-15.jpg", 0.808),
  img("ve-16.jpg", 0.8),
  vid("ve-08.mp4", 0.562),
  img("ve-17.jpg", 0.863),
  img("ve-18.jpg", 0.863),
  vid("ve-09.mp4", 1.301),
  img("ve-19.jpg", 0.897),
  img("ve-20.jpg", 1.143),
  vid("ve-10.mp4", 1.0),
  img("ve-21.jpg", 0.8),
  img("ve-22.jpg", 0.788),
  img("ve-23.jpg", 0.8),
  img("ve-24.jpg", 1.778),
  img("ve-25.jpg", 1.778),
];

export default function VisualExperimentsPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 pt-[56px]">
      <div className="py-8">
        <Link
          href="/#lab"
          className="text-xs text-text-secondary transition-colors hover:text-accent"
        >
          ← Back to home
        </Link>
      </div>

      <header className="pb-8">
        <h1 className="font-mono text-3xl text-text-primary md:text-4xl">
          Visual Experiments
        </h1>
        <p className="mt-2 text-base text-text-secondary">
          Graphic design + 3D renders
        </p>
      </header>

      <GalleryMasonryLoader items={items} />
    </main>
  );
}
