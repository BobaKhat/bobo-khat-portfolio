"use client";

import { usePathname } from "next/navigation";
import WidgetBar from "./WidgetBar";

export default function ConditionalWidgetBar() {
  const pathname = usePathname();
  if (pathname?.startsWith("/work/")) return null;
  return <WidgetBar />;
}
