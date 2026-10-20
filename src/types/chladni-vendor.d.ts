// Type declaration for the vendored Chladni component (src/vendor/chladni/).
// That folder is generated/read-only (synced from an external repo), so this
// lives here instead. TS can't infer optional props from the component's
// plain-JS destructured parameters — without this it treats every
// destructured prop as required. Keep in sync with ChladniTones.jsx's
// signature if a re-sync changes it.
declare module "@/vendor/chladni/portfolio/ChladniTones.jsx" {
  import type { ComponentType } from "react";

  export interface ChladniFailure {
    reason: string;
    detail?: string;
  }

  export interface ChladniColors {
    bg: string;
    ink: string;
  }

  export interface ChladniTonesProps {
    onFailure?: (info: ChladniFailure) => void;
    shimmerAmp?: number;
    shimmerSpeed?: number;
    turnoffMode?: "hybrid" | "spread" | "dissolve";
    spreadDur?: number;
    spreadGain?: number;
    dissolveDur?: number;
    unstyled?: boolean;
    className?: string;
    colors?: ChladniColors;
  }

  const ChladniTones: ComponentType<ChladniTonesProps>;
  export default ChladniTones;

  export function canRunChladni(): boolean;
}
