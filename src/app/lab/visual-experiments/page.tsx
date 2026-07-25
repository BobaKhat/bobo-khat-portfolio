import Link from "next/link";

export const metadata = {
  title: "Visual Experiments — Bobo Khat",
  description: "Graphic design and 3D renders",
};

const images = [
  "ve-01.jpg",
  "ve-02.jpg",
  "ve-03.jpg",
  "ve-04.jpg",
  "ve-05.jpg",
  "ve-06.jpg",
  "ve-07.jpg",
  "ve-08.jpg",
  "ve-09.jpg",
  "ve-10.jpg",
  "ve-11.jpg",
  "ve-12.jpg",
  "ve-13.jpg",
  "ve-14.jpg",
  "ve-15.jpg",
  "ve-16.jpg",
  "ve-17.jpg",
  "ve-18.jpg",
  "ve-19.jpg",
  "ve-20.jpg",
  "ve-21.jpg",
  "ve-22.jpg",
  "ve-23.jpg",
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
        {images.map((file) => (
          <div
            key={file}
            className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-border bg-module"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/visual-experiments/${file}`}
              alt="Visual experiment — graphic design or 3D render"
              className="w-full"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </main>
  );
}
