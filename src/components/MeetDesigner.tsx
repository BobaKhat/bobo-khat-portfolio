/*
  Self-contained "Meet the Designer" card. Bio + portrait migrated from Figma
  (node 0-8). On desktop it sits to the right of the Product Advertisement card;
  in the tablet range it spans the full width at the bottom of the grid (see the
  col-span passed from page.tsx). The header (title + subtitle) mirrors the
  case-study ProjectCard so the divider lines up with the other cards.
*/
export default function MeetDesigner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-3xl bg-module p-5 shadow-[var(--shadow-raised)] sm:p-6 ${className}`}
    >
      {/* Header matches ProjectCard's title + subtitle so the divider aligns */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="min-w-0">
          <h3 className="t-heading text-2xl text-text-primary sm:text-3xl">
            Meet the Designer
          </h3>
          <p className="t-subtitle mt-1 text-sm text-text-secondary">
            The person behind the work
          </p>
        </div>
      </div>

      <div className="my-5 border-t border-text-secondary/30" />

      {/*
        Bio and portrait sit side by side wherever this card is full-width — the
        tablet range (md–1199, where it spans both columns) and desktop (≥1200).
        Only on narrow mobile (<768), where the card is a single column, does it
        stack so the fixed-width portrait can't crush the bio.
      */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
        <div className="min-w-0 space-y-3 text-sm leading-relaxed text-text-secondary">
          <p className="font-semibold text-text-primary">Hi, I&apos;m Bobo!</p>
          <p>
            I&apos;m a first-generation college graduate from UC Berkeley. I was
            born in Tokyo, Japan, however I am ethnically Burmese. I became a
            product designer because so many products are frustrating to use,
            and I find real fulfillment in making interactions feel effortless.
            I love creating interfaces that are both beautiful and functional,
            using a design process rooted in research, rapid prototyping, and
            clean visual systems that align user needs with business goals.
          </p>
          <p>
            Outside of product design, I&apos;ve always loved animation —
            especially motion design. Beyond creative tech, I&apos;m also into
            traveling to new places to try the food and nightlife, going on
            hikes, exploring the city, music festivals, and meeting new people.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/bobo-portrait.jpg"
          alt="Bobo Khat"
          className="order-first mx-auto h-48 w-48 shrink-0 rounded-full object-cover object-[50%_18%] shadow-[var(--shadow-raised-sm)] md:order-none md:mx-0 min-[1200px]:h-60 min-[1200px]:w-60"
          loading="lazy"
        />
      </div>
    </div>
  );
}
