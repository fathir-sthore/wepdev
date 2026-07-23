import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Register — Fathir Sthore" };

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <RegisterForm />
    </main>
  );
}
