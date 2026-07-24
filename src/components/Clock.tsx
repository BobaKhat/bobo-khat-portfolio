"use client";

import { useEffect, useState } from "react";

function format(now: Date) {
  const time = now
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
  const date = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return { time, date };
}

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  // Render nothing until mounted to avoid a server/client time mismatch.
  const { time, date } = now ? format(now) : { time: "--:-- --", date: "" };

  return (
    <div className="flex flex-col leading-none">
      <span className="text-xs tabular-nums text-text-primary">{time}</span>
      <span className="text-[10px] text-text-secondary">{date}</span>
    </div>
  );
}
