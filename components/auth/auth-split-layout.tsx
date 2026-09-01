import Image from "next/image";
import Link from "next/link";
import { Code2 } from "lucide-react";

export function AuthSplitLayout({
  imageSrc,
  imageAlt,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  imageSrc?: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 font-display">
      {/* Image panel — swap `imageSrc` in for the real photo once uploaded.
          Falls back to a generated gradient so the page still looks
          finished in the meantime. This panel is always dark regardless
          of light/dark theme, so its text uses fixed white — not the
          theme-following text color. */}
      <div className="relative hidden md:block bg-[#10131C] overflow-hidden">
        {imageSrc ? (
          <Image src={imageSrc} alt={imageAlt} fill priority className="object-cover" />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(53,82,216,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(124,92,250,0.3), transparent 45%), linear-gradient(160deg, #10131C 0%, #171B27 60%, #1D2230 100%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <Code2 size={22} className="text-accent" />
            <span className="font-display font-semibold text-white drop-shadow-md">Fathir Code</span>
          </Link>

          {/* Skip the redundant caption when a custom image is used — the
              artwork already carries its own title treatment. */}
          {!imageSrc && (
            <div className="max-w-sm">
              <p className="font-display text-sm font-semibold text-white/70 mb-3">{eyebrow}</p>
              <h2 className="text-title text-3xl font-bold text-white leading-tight">
                {title}
              </h2>
              <p className="mt-3 text-sm text-white/70">{subtitle}</p>
            </div>
          )}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-ink px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 md:hidden w-fit">
            <Code2 size={20} className="text-accent" />
            <span className="font-display font-semibold text-text">Fathir Code</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
