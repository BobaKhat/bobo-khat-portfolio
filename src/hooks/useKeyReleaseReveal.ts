import { useEffect, useRef } from "react";

/**
 * Key-release reveal hook.
 *
 * Arms a card into its pressed starting state once the client has hydrated,
 * then reveals it (pressed → raised) whenever its top edge crosses ~10% into
 * the viewport. When the card scrolls back out it re-arms, so scrolling to it
 * again replays the reveal. Everything is driven through a single
 * `data-revealed` attribute the CSS keys off of:
 *
 *   (absent)  SSR / no-JS / reduced-motion → final raised state, never pressed.
 *   "false"   armed (hydrated, out of view) → pressed (inset shadow, LED off).
 *   "true"    in view                       → animate pressed → raised, LED on.
 *
 * Reusable for any element — attach the returned ref. Pass `enabled={false}`
 * to opt an element out entirely.
 */
export function useKeyReleaseReveal<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    // Reduced motion: jump straight to the final revealed state and stay there.
    // No arming, no replay (the reveal keyframes are gated behind no-preference
    // CSS, so there is nothing to animate anyway).
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.dataset.revealed = "true";
      return;
    }

    // Arm: drop the card into its pressed starting state. Client-only — SSR
    // leaves the attribute off so the card is never stuck pressed before JS.
    el.dataset.revealed = "false";

    let first = true;
    let timer: number | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries[0].isIntersecting;
        window.clearTimeout(timer);
        if (inView) {
          // In view on first load → a short beat before the pop. Any later
          // re-entry (after scrolling away) replays immediately.
          if (first) {
            timer = window.setTimeout(() => {
              el.dataset.revealed = "true";
            }, 150);
          } else {
            el.dataset.revealed = "true";
          }
        } else {
          // Left the viewport — re-arm so scrolling back to it replays.
          el.dataset.revealed = "false";
        }
        first = false;
      },
      // Top edge ~10% into the viewport.
      { rootMargin: "0px 0px -10% 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [enabled]);

  return ref;
}
