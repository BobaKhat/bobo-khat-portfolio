import CaseStudyLayout from "@/components/CaseStudyLayout";

export const metadata = {
  title: "Drift — Bobo Khat",
  description: "Spatial music discovery map",
};

export default function DriftPage() {
  return (
    <CaseStudyLayout
      title="Drift"
      subtitle="Spatial music discovery map"
      role="Product Design · Interaction"
      tools="Figma, Framer"
      timeline="2025"
      next={{ label: "MyShake", href: "/work/myshake" }}
    />
  );
}
