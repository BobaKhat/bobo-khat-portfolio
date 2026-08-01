import Link from "next/link";

export const metadata = {
  title: "Product Advertisement — Bobo Khat",
  description: "Concept product ad campaign",
};

const slides = [1, 2, 3, 4, 5, 6].map(
  (n) => `/images/lab/product-ad/phone-${n}.png`
);

export default function ProductAdvertisementPage() {
  return (
    <main className="mx-auto w-full max-w-[1800px] flex-1 px-5 pt-20 sm:px-8 sm:pt-[84px]">
      <div className="py-8">
        <Link
          href="/#lab"
          className="text-xs text-text-secondary transition-colors hover:text-accent"
        >
          ← Back to home
        </Link>
      </div>

      <header className="pb-8">
        <h1 className="t-heading text-3xl text-text-primary md:text-4xl">
          Product Advertisement
        </h1>
        <p className="t-subtitle mt-2 text-base text-text-secondary">
          Concept ad campaign
        </p>
        <p className="t-eyebrow mt-4 text-text-secondary">Made with Illustrator</p>
      </header>

      {/* Flush stack — no cards, no gaps; slides sit directly on top of one
          another (0px between). */}
      <div className="mx-auto max-w-[1265px] pb-16">
        {slides.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={`Product advertisement slide ${i + 1}`}
            className="block w-full"
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>
    </main>
  );
}
