import Link from "next/link";
import GalleryVideo from "@/components/GalleryVideo";

export const metadata = {
  title: "Visual Experiments — Bobo Khat",
  description: "Graphic design and 3D renders",
};

type GalleryItem =
  | { type: "image"; src: string }
  | { type: "video"; src: string };

const img = (file: string): GalleryItem => ({
  type: "image",
  src: `/images/visual-experiments/${file}`,
});
const vid = (file: string): GalleryItem => ({
  type: "video",
  src: `/videos/visual-experiments/${file}`,
});

// Videos are sprinkled through the images roughly every third tile rather
// than grouped together, per direction.
const items: GalleryItem[] = [
  img("ve-01.jpg"),
  img("ve-02.jpg"),
  vid("ve-01.mp4"),
  img("ve-03.jpg"),
  img("ve-04.jpg"),
  vid("ve-02.mp4"),
  img("ve-05.jpg"),
  img("ve-06.jpg"),
  vid("ve-03.mp4"),
  img("ve-07.jpg"),
  img("ve-08.jpg"),
  vid("ve-04.mp4"),
  img("ve-09.jpg"),
  img("ve-10.jpg"),
  vid("ve-05.mp4"),
  img("ve-11.jpg"),
  img("ve-12.jpg"),
  vid("ve-06.mp4"),
  img("ve-13.jpg"),
  img("ve-14.jpg"),
  vid("ve-07.mp4"),
  img("ve-15.jpg"),
  img("ve-16.jpg"),
  vid("ve-08.mp4"),
  img("ve-17.jpg"),
  img("ve-18.jpg"),
  vid("ve-09.mp4"),
  img("ve-19.jpg"),
  img("ve-20.jpg"),
  vid("ve-10.mp4"),
  img("ve-21.jpg"),
  img("ve-22.jpg"),
  img("ve-23.jpg"),
  img("ve-24.jpg"),
  img("ve-25.jpg"),
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

      <div className="columns-1 gap-4 pb-16 sm:columns-2 lg:columns-3">
        {items.map((item, i) => (
          <div
            key={item.src}
            className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-border bg-module"
          >
            {item.type === "video" ? (
              <GalleryVideo src={item.src} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt="Visual experiment — graphic design or 3D render"
                className="w-full"
                loading={i < 4 ? "eager" : "lazy"}
              />
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
