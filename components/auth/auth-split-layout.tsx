import Image from "next/image";
import Link from "next/link";
import { Terminal } from "lucide-react";

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
          finished in the meantime. */}
      <div className="relative hidden md:block bg-ink overflow-hidden">
        {imageSrc ? (
          <Image src={imageSrc} alt={imageAlt} fill priority className="object-cover" />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(242,179,61,0.25), transparent 45%), radial-gradient(circle at 80% 70%, rgba(51,224,194,0.2), transparent 45%), linear-gradient(160deg, #0B0D12 0%, #12151C 60%, #1A1E27 100%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <Terminal size={22} className="text-accent" />
            <span className="font-display font-semibold text-text drop-shadow-md">Fathir Sthore</span>
          </Link>

          {/* Skip the redundant caption when a custom image is used — the
              artwork already carries its own title treatment. */}
          {!imageSrc && (
            <div className="max-w-sm">
              <p className="font-display text-xs font-semibold uppercase tracking-widest text-signal mb-3">
                {eyebrow}
              </p>
              <h2 className="font-display text-3xl font-bold text-text leading-tight">
                {title}
              </h2>
              <p className="mt-3 text-sm text-muted">{subtitle}</p>
            </div>
          )}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-ink px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 md:hidden w-fit">
            <Terminal size={20} className="text-accent" />
            <span className="font-display font-semibold text-text">Fathir Sthore</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
