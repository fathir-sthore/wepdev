import Link from "next/link";

const columns = [
  {
    title: "product",
    links: [
      { href: "/search", label: "browse scripts" },
      { href: "/code", label: "source code" },
      { href: "/register", label: "become a developer" },
    ],
  },
  {
    title: "legal",
    links: [
      { href: "/privacy-policy", label: "privacy policy" },
      { href: "/terms-of-service", label: "terms of service" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line mt-20">
      <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-2 gap-8">
        {columns.map((col) => (
          <div key={col.title}>
            <p className="font-data text-xs uppercase tracking-wider text-signal mb-3">
              {col.title}
            </p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted hover:text-text transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line px-4 py-4 text-center font-data text-xs text-muted">
        © {new Date().getFullYear()} Fathir Code. Built for developers, by a developer.
      </div>
    </footer>
  );
}
