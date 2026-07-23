import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Login — Fathir Sthore" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <LoginForm next={next} />
    </main>
  );
}
