import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// v1.0.1 "Futuristic Developer Marketplace" design system — two-font
// system. Plus Jakarta Sans is the primary site-wide UI font (also used
// for --font-display, see globals.css). JetBrains Mono covers code blocks
// and stat/data displays (also aliased to --font-data in globals.css).
// Inter and IBM Plex Mono are no longer self-hosted; "Inter"/"Fira Code"
// remain only as text fallbacks in the CSS font-family stacks.
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const SITE_URL = "https://fathirsthore.my.id";

// Target keywords from the original site brief — used here (metadata) and
// echoed in the WebSite JSON-LD below. Google mostly ignores the <meta
// keywords> tag itself these days, but Bing and some other crawlers still
// read it, and it costs nothing to include.
const KEYWORDS = [
  "download free script fathir",
  "download script free",
  "download script",
  "download whatsapp bot",
  "download nodejs script",
  "download php script",
  "download html template",
  "download flutter project",
  "download telegram bot",
  "download javascript project",
  "download source code gratis",
  "download script indonesia",
  "download script premium",
  "script open source",
  "script github",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fathir Sthore — Script Download Center",
    template: "%s — Fathir Sthore",
  },
  description:
    "Download script gratis dan premium: bot Telegram, bot WhatsApp, aplikasi Flutter, panel hosting, dan source code lainnya. Diupload langsung oleh developer.",
  keywords: KEYWORDS,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Fathir Sthore",
    title: "Fathir Sthore — Script Download Center",
    description:
      "Download script gratis dan premium: bot Telegram, bot WhatsApp, aplikasi Flutter, panel hosting, dan source code lainnya.",
    url: SITE_URL,
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fathir Sthore — Script Download Center",
    description: "Download script gratis dan premium: bot, panel, dan aplikasi siap pakai.",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Fathir Sthore",
      url: SITE_URL,
      logo: `${SITE_URL}/icon`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Fathir Sthore",
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
