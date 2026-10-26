import { projectImage, size, contentType } from "@/lib/og";

export { size, contentType };
export const alt = "Group Canvas · Bobo Khat";

export default async function Image() {
  return projectImage({
    title: "Group Canvas",
    subtitle: "Real-time collaboration for GoodNotes",
    heroPath: "og/group-canvas.png",
  });
}
