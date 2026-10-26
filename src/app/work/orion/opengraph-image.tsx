import { projectImage, size, contentType } from "@/lib/og";

export { size, contentType };
export const alt = "Orion · Bobo Khat";

export default async function Image() {
  return projectImage({
    title: "Orion",
    subtitle: "Spatial music discovery map",
    heroPath: "og/orion.png",
  });
}
