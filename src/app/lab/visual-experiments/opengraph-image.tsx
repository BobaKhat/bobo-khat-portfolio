import { projectImage, size, contentType } from "@/lib/og";

export { size, contentType };
export const alt = "Visual Experiments · Bobo Khat";

export default async function Image() {
  return projectImage({
    title: "Visual Experiments",
    subtitle: "Graphic design and 3D renders",
    heroPath: "images/lab/visual-experiments.jpg",
  });
}
