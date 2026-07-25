"use client";

import { useState } from "react";

type Point = { year: string; value: number };

const DATA: Point[] = [
  { year: "2026", value: 231000 },
  { year: "2029", value: 279000 },
  { year: "2033", value: 431000 },
  { year: "2036", value: 519000 },
  { year: "2039", value: 636920 },
];

const MAX = 700000;
const AXIS_STEPS = [700, 600, 500, 400, 300, 200, 100];
const BASE = DATA[0].value;
const CURRENT = DATA[DATA.length - 1];

function formatCurrency(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export default function NetWorthChart() {
  const [active, setActive] = useState<number | null>(null);
  const point = active !== null ? DATA[active] : CURRENT;
  const pctChange = Math.round(((point.value - BASE) / BASE) * 100);

  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-[#6b6b64]">
        Estimated networth
      </p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="font-mono text-[26px] font-bold leading-none text-[#f2f2ec]">
          {formatCurrency(point.value)}
        </span>
        <span className="font-mono text-xs font-medium text-[#c9f24d]">
          {pctChange >= 0 ? "+" : ""}
          {pctChange}%
        </span>
      </div>
      <p className="mt-1 text-[11px] text-[#6b6b64]">by 47</p>

      <div className="mt-4 flex gap-2">
        <div className="flex h-[130px] flex-col justify-between text-right font-mono text-[8px] text-[#4a4a44]">
          {AXIS_STEPS.map((k) => (
            <span key={k}>{k}k</span>
          ))}
        </div>
        <div className="flex h-[130px] flex-1 items-end gap-2.5 border-l border-white/[0.06] pl-2.5">
          {DATA.map((d, i) => {
            const isActive = active === i;
            const isDefault = active === null && i === DATA.length - 1;
            const lit = isActive || isDefault;
            return (
              <button
                key={d.year}
                type="button"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive((prev) => (prev === i ? null : i))}
                className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                aria-label={`${d.year}: ${formatCurrency(d.value)}`}
              >
                <div className="relative flex w-full flex-1 items-end justify-center">
                  {isActive && (
                    <span className="absolute -top-4 whitespace-nowrap font-mono text-[9px] font-medium text-[#c9f24d]">
                      {formatCurrency(d.value)}
                    </span>
                  )}
                  <div
                    className={`w-full rounded-t-[2px] border transition-all duration-200 ${
                      lit
                        ? "border-[#c9f24d]/80 bg-[#c9f24d]/70 shadow-[0_0_10px_rgba(201,242,77,0.45)]"
                        : "border-[#c9f24d]/25 bg-[#c9f24d]/[0.03] group-hover:border-[#c9f24d]/50"
                    }`}
                    style={{ height: `${(d.value / MAX) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[8px] text-[#55554e]">
                  {d.year}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
