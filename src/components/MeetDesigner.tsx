/*
  Self-contained "Meet the Designer" card. Bio + portrait migrated from Figma
  (node 0-8). Sits in the work grid to the right of the Product Advertisement
  card. The header (title + subtitle) mirrors the case-study ProjectCard so the
  divider lines up with the other cards; the portrait is centered above the bio.
*/
export default function MeetDesigner() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-3xl bg-module p-5 shadow-[var(--shadow-raised)] sm:p-6 md:p-8">
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

      <div className="flex flex-col items-center gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/bobo-portrait.jpg"
          alt="Bobo Khat"
          className="h-[140px] w-[140px] shrink-0 rounded-full object-cover object-[50%_18%] shadow-[var(--shadow-raised-sm)]"
          loading="lazy"
        />
        <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
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
      </div>
    </div>
  );
}
