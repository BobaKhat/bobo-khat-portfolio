import Link from "next/link";

const external = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/bobo-khat" },
  { label: "Gmail", href: "mailto:willimbkhat@gmail.com" },
  { label: "Resume", href: "/resume.pdf" },
];

const linkClass =
  "rounded-full px-2 py-1.5 text-sm font-semibold text-text-secondary transition-colors hover:text-accent sm:px-3 sm:text-base";

export default function Navigation() {
  return (
    <nav className="flex items-center gap-0.5 sm:gap-1">
      {/* Home stays an internal route so it navigates back from subpages. */}
      <Link href="/" className={linkClass}>
        Home
      </Link>
      {external.map((item) => (
        <a
          key={item.href}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
