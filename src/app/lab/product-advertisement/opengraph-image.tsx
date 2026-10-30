import { projectImage, size, contentType } from "@/lib/og";

export { size, contentType };
export const alt = "Product Advertisement · Bobo Khat";

export default async function Image() {
  return projectImage({
    title: "Product Advertisement",
    subtitle: "Concept product ad campaign",
    heroPath: "images/lab/product-ad/phone-1.png",
    fit: "contain",
    panelAspect: 2480 / 1859, // the full ad slide (landscape)
  });
}
