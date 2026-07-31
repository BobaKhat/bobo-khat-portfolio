const items = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/bobo-khat" },
  { label: "Gmail", href: "mailto:willimbkhat@gmail.com" },
  { label: "Resume", href: "/resume.pdf" },
];

export default function Navigation() {
  return (
    <nav className="flex items-center gap-0.5 sm:gap-1">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full px-2 py-1.5 text-sm font-semibold text-text-secondary transition-colors hover:text-accent sm:px-3 sm:text-base"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
