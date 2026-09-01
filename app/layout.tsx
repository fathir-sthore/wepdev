import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { SITE_URL } from "@/lib/site-url";

// v2.0 "Clean Modern Minimalist + Glassmorphism" design system — one
// typeface family throughout (Plus Jakarta Sans), weight carries the
// hierarchy instead of mixing serif/italic/mono roles. JetBrains Mono is
// kept strictly for actual code content in the code viewer.
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code" });

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
    default: "Fathir Code — Platform Script & Code",
    template: "%s — Fathir Code",
  },
  description:
    "FATHIR CODE adalah platform untuk mencari, berbagi, dan mengunduh script, source code, tools, dan resource developer — bot Telegram, bot WhatsApp, aplikasi Flutter, panel, dan lainnya.",
  keywords: KEYWORDS,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Fathir Code",
    title: "Fathir Code — Platform Script & Code",
    description:
      "Platform untuk mencari, berbagi, dan mengunduh script, source code, tools, dan resource developer.",
    url: SITE_URL,
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fathir Code — Platform Script & Code",
    description: "Platform untuk mencari, berbagi, dan mengunduh script, source code, dan resource developer.",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Fathir Code",
      url: SITE_URL,
      logo: `${SITE_URL}/icon`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Fathir Code",
      alternateName: ["FATHIR CODE", "Fathir Sthore"],
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
