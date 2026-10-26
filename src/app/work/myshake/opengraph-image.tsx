import { projectImage, size, contentType } from "@/lib/og";

export { size, contentType };
export const alt = "MyShake · Bobo Khat";

export default async function Image() {
  return projectImage({
    title: "MyShake",
    subtitle: "Earthquake awareness platform",
    heroPath: "og/myshake.png",
  });
}
