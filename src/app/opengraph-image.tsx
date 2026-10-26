import { homeImage, size, contentType } from "@/lib/og";

export { size, contentType };
export const alt = "Bobo Khat · Product Designer and Builder";

export default async function Image() {
  return homeImage();
}
