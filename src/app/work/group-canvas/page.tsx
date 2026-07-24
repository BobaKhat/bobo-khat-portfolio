import CaseStudyLayout from "@/components/CaseStudyLayout";

export const metadata = {
  title: "Group Canvas — Bobo Khat",
  description: "Real-time collaboration for GoodNotes",
};

export default function GroupCanvasPage() {
  return (
    <CaseStudyLayout
      title="Group Canvas"
      subtitle="Real-time collaboration for GoodNotes"
      role="User Flows · Feature Design"
      tools="Figma"
      timeline="48-hour sprint"
      next={{ label: "Drift", href: "/work/drift" }}
    >
      {/* Copy migrated from the live site (bobokhat.com). */}
      <p>
        After placing 3rd at a UC Berkeley designathon sponsored by GoodNotes, I
        continued exploring how student-to-student collaboration could be
        improved through a live, shared note-taking experience designed for
        in-class group work.
      </p>
    </CaseStudyLayout>
  );
}
