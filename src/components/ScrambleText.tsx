"use client";

import { useEffect, useRef } from "react";

/*
  Subtle "decode" / text-scramble effect: on mount a random subset of the
  characters flicker through random glyphs for a moment, then lock into
  their real letters.

  Pacing: each animating character has a short scramble lifetime that
  *begins* at a staggered, scattered moment (not all at once), and within
  that lifetime it swaps glyphs only every `flickerMs` so the flicker reads
  slowly. The start times are spread across the duration and shuffled, so
  only a couple of characters are ever mid-scramble at the same time.

  Layout notes: animating characters become fixed-width inline-block boxes
  (measured from their real glyph once the font is ready) so random glyphs
  can't change the heading's width. Each *word* is wrapped in a
  white-space:nowrap group, because the break opportunities inline-block
  boxes introduce would otherwise let a word split mid-letter; spaces
  between words stay breakable so the heading still wraps normally. The real
  text is kept in the DOM (sr-only copy + SSR children) for SEO/screen
  readers; the animation only mutates an aria-hidden layer. Honors
  prefers-reduced-motion by skipping to the end.
*/

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}—=+*^?#";

type Entry = {
  node: HTMLSpanElement;
  char: string;
  width: number; // locked box width in px
  start: number; // ms when this char begins scrambling
  lastFlick: number; // ms of its last glyph swap
};

type Props = {
  text: string;
  /** ms window across which characters begin scrambling. */
  duration?: number;
  /** how long each character scrambles before locking, in ms. */
  cycle?: number;
  /** how long each random glyph is held before swapping, in ms. */
  flickerMs?: number;
  /** extra delay before anything starts, in ms. */
  delay?: number;
  /** fraction of (non-space) characters that scramble, 0–1. */
  ratio?: number;
  className?: string;
};

export default function ScrambleText({
  text,
  duration = 2600,
  cycle = 450,
  flickerMs = 120,
  delay = 150,
  ratio = 0.35,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = text;
      return;
    }

    const chars = [...text];
    const anim: Entry[] = [];

    const rand = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

    // Show a random glyph, squeezing it horizontally if it's wider than the
    // locked box so it can never bleed into the neighbouring character.
    const flick = (e: Entry) => {
      e.node.textContent = rand();
      const nat = e.node.scrollWidth;
      e.node.style.transform =
        nat > e.width ? `scaleX(${(e.width / nat).toFixed(3)})` : "none";
    };

    const lock = (e: Entry) => {
      if (e.node.textContent !== e.char) e.node.textContent = e.char;
      if (e.node.style.transform !== "none") e.node.style.transform = "none";
    };

    let raf = 0;
    let t0 = 0;
    let cancelled = false;

    const frame = (now: number) => {
      if (!t0) t0 = now;
      const t = now - t0 - delay;

      let done = true;
      for (const e of anim) {
        if (t < e.start) {
          done = false; // still waiting to begin
          continue;
        }
        if (t >= e.start + cycle) {
          lock(e);
          continue;
        }
        // mid-scramble: swap glyph only every flickerMs so it reads slowly
        done = false;
        if (t - e.lastFlick >= flickerMs) {
          flick(e);
          e.lastFlick = t;
        }
      }

      if (done) {
        // Restore plain, fully fluid text so the heading stays responsive
        // (the fixed-width boxes were only needed during the animation).
        el.textContent = text;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    // Build + measure after the font loads so widths are correct. Each box
    // is sized to the character's width *in context* (kerned, via a Range
    // over the real text) — identical to the natural text — so swapping
    // between boxes and plain text never shifts the layout.
    const begin = () => {
      if (cancelled) return;

      // Pass 1: lay out the real text and measure per-character kerned width.
      el.textContent = text;
      const tn = el.firstChild as Text;
      const range = document.createRange();
      const widths = chars.map((_, i) => {
        range.setStart(tn, i);
        range.setEnd(tn, i + 1);
        return range.getBoundingClientRect().width;
      });

      // Pass 2: rebuild. Whitespace is breakable text; each word is a nowrap
      // group so it can't split between inline-block letters. A random subset
      // of letters become fixed-width boxes we can flicker. Runs of plain
      // (non-scrambling) letters are coalesced into a single text node so
      // their kerning is preserved — otherwise the plain runs render wider
      // than the real text and the line shifts when it settles.
      el.textContent = "";
      let word: HTMLSpanElement | null = null;
      let buf = "";
      const flush = () => {
        if (buf && word) word.append(document.createTextNode(buf));
        buf = "";
      };
      chars.forEach((c, i) => {
        if (/\s/.test(c)) {
          flush();
          word = null;
          el.append(document.createTextNode(c));
          return;
        }
        if (!word) {
          word = document.createElement("span");
          word.style.whiteSpace = "nowrap";
          el.append(word);
        }
        if (Math.random() >= ratio) {
          buf += c;
          return;
        }
        flush(); // emit the plain run before this box
        const span = document.createElement("span");
        span.textContent = c;
        span.style.display = "inline-block";
        span.style.width = `${widths[i]}px`;
        span.style.textAlign = "center";
        span.style.transformOrigin = "center";
        word.append(span);
        anim.push({ node: span, char: c, width: widths[i], start: 0, lastFlick: -Infinity });
      });
      flush(); // trailing plain run of the last word

      // Spread start times evenly across the window, then shuffle so the
      // scramble scatters instead of sweeping — only a couple are ever active
      // at once since each is alive for just `cycle` ms.
      const spread = Math.max(0, duration - cycle);
      const slots = anim.map((_, i) =>
        anim.length > 1 ? (i / (anim.length - 1)) * spread : 0,
      );
      for (let i = slots.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [slots[i], slots[j]] = [slots[j], slots[i]];
      }
      anim.forEach((e, i) => {
        e.start = slots[i] + Math.random() * (cycle * 0.4);
      });

      raf = requestAnimationFrame(frame);
    };

    if (document.fonts?.ready) document.fonts.ready.then(begin);
    else begin();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [text, duration, cycle, flickerMs, delay, ratio]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
