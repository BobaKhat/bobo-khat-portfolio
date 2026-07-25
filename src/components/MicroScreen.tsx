import type { ReactNode } from "react";

/**
 * The always-dark "screen" that houses a single microinteraction preview.
 *
 * These previews are recreations of widgets from a separate project
 * (MoceanVault) and intentionally keep that project's own dark/lime
 * palette regardless of the portfolio site's light/dark theme — like an
 * OLED screen inset into a device shell that itself can be light or dark
 * plastic. The theme-adaptive part is the bezel rendered by the parent
 * (bg-surface / border-border), not this component.
 */
export default function MicroScreen({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-[220px] flex-col justify-center gap-5 rounded-xl border border-white/5 bg-[#0a0a09] p-5">
      <div className="flex flex-1 flex-col justify-center">{children}</div>
      {footer}
    </div>
  );
}
