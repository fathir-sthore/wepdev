import Link from "next/link";

const columns = [
  {
    title: "Produk",
    links: [
      { href: "/search", label: "Jelajahi script" },
      { href: "/code", label: "Source code" },
      { href: "/register", label: "Jadi developer" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy-policy", label: "Kebijakan privasi" },
      { href: "/terms-of-service", label: "Ketentuan layanan" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line mt-20">
      <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-2 gap-8">
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-text mb-3">{col.title}</p>
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
      <div className="border-t border-line px-4 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Fathir Code. Dibangun untuk developer, oleh developer.
      </div>
    </footer>
  );
}
