import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = { title: "Set new password — Fathir Sthore" };

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <ResetPasswordForm />
    </main>
  );
}
