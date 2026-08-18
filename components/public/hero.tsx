import { SearchBar } from "@/components/public/search-bar";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="font-data text-xs text-signal mb-3">
          $ fathir code --init
          <span className="inline-block w-2 h-3 bg-signal ml-1 align-middle animate-caret" />
        </p>
        <h1 className="text-title text-3xl md:text-5xl text-text mb-3 leading-tight">
          FATHIR CODE
        </h1>
        <p className="text-lg md:text-xl text-accent font-medium mb-4">
          Download free &amp; premium <span className="text-text">scripts</span> for your next build
        </p>
        <p className="text-sm md:text-base text-muted mb-8 max-w-xl mx-auto">
          Cari, bagikan, dan unduh script, source code, tools, dan resource developer — bot
          Telegram, bot WhatsApp, aplikasi Flutter, panel, dan lainnya. Diupload langsung oleh
          developer, siap pakai.
        </p>
        <SearchBar className="max-w-lg mx-auto" />
      </div>
    </section>
  );
}
