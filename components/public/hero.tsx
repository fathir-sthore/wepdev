import { SearchBar } from "@/components/public/search-bar";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="font-data text-xs text-signal mb-3">
          $ fathir sthore --init
          <span className="inline-block w-2 h-3 bg-signal ml-1 align-middle animate-caret" />
        </p>
        <h1 className="text-title text-3xl md:text-5xl text-text mb-4 leading-tight">
          Download free &amp; premium
          <br />
          <span className="text-accent">scripts</span> for your next build
        </h1>
        <p className="text-sm md:text-base text-muted mb-8 max-w-xl mx-auto">
          Telegram bots, WhatsApp bots, Flutter apps, panels, and more —
          uploaded by developers, ready to deploy.
        </p>
        <SearchBar className="max-w-lg mx-auto" />
      </div>
    </section>
  );
}
