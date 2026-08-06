import type { Metadata } from "next";
import "./globals.css";
import WidgetBar from "@/components/WidgetBar";

export const metadata: Metadata = {
  title: "Bobo Khat is a Product Designer",
  description: "I design digital things people can feel.",
};

// Blocking script: apply the persisted / preferred theme before first paint
// so there is no flash of the wrong theme.
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <WidgetBar />
        {children}
      </body>
    </html>
  );
}
