import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-data text-xs text-signal">$ fathir sthore --status</p>
      <h1 className="font-mono text-3xl text-text">
        Script Download Center
      </h1>
      <p className="max-w-md text-sm text-muted">
        Auth + user dashboard slice is live. Public browsing, search, and
        script pages ship in a later build.
      </p>
      <div className="flex gap-3">
        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
        <Link href="/register">
          <Button>Register</Button>
        </Link>
      </div>
    </main>
  );
}
