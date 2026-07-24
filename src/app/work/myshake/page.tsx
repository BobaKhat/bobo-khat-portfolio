import CaseStudyLayout from "@/components/CaseStudyLayout";

export const metadata = {
  title: "MyShake — Bobo Khat",
  description: "Earthquake awareness platform",
};

export default function MyShakePage() {
  return (
    <CaseStudyLayout
      title="MyShake"
      subtitle="Earthquake awareness platform"
      role="Information Architecture · Usability Testing"
      tools="Figma"
      timeline="Shipping 2026"
      next={{ label: "Group Canvas", href: "/work/group-canvas" }}
    >
      {/* Copy migrated from the live site (bobokhat.com). */}
      <p>
        Redesigned MyShake&apos;s core experience by introducing a
        dashboard-centered architecture that simplifies navigation and builds
        user trust for millions of users in a critical safety app.
      </p>
      <p className="text-text-secondary">
        In-depth concept exploration · Interaction design · Research driven.
      </p>
    </CaseStudyLayout>
  );
}
