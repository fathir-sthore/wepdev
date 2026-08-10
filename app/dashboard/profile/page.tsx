import Link from "next/link";
import { Terminal, Bug, Mail, FileText, ScrollText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { AvatarUploader } from "@/components/dashboard/avatar-uploader";
import { ChangelogModal } from "@/components/layout/changelog-modal";
import { ChangeEmailForm } from "@/components/dashboard/change-email-form";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { TwoFactorSettings } from "@/components/dashboard/two-factor-settings";
import { SignOutAllDevicesButton } from "@/components/dashboard/sign-out-all-button";
import { LoginHistoryList } from "@/components/dashboard/login-history-list";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { LanguageSelect, NotificationToggle, ClearCacheButton } from "@/components/dashboard/preferences";
import { ExportDataButton, DeleteAccountButton } from "@/components/dashboard/privacy-actions";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";
import { Card, CardContent } from "@/components/ui/card";
import { computeUserBadge } from "@/lib/badges";

export const metadata = { title: "Profile & Settings — Dashboard" };

export default async function DashboardProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profileRes, downloadsRes, favoritesRes, reviewsRes, loginHistoryRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("downloads").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase
      .from("login_history")
      .select("id, method, user_agent, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const profile = profileRes.data;

  if (!profile) {
    return (
      <p className="font-data text-sm text-danger">
        error: profile not found. try signing in again.
      </p>
    );
  }

  const downloadCount = downloadsRes.count ?? 0;
  const favoriteCount = favoritesRes.count ?? 0;
  const reviewCount = reviewsRes.count ?? 0;
  const badge = computeUserBadge(downloadCount);

  const sections = {
    profile: (
      <div className="space-y-8 max-w-2xl">
        <Card>
          <CardContent>
            <AvatarUploader userId={user!.id} username={profile.username} currentUrl={profile.avatar_url} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "downloads", value: downloadCount },
            { label: "favorites", value: favoriteCount },
            { label: "reviews", value: reviewCount },
            { label: "badge", value: badge },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="text-center">
                <p className="font-mono text-lg text-accent">{s.value}</p>
                <p className="font-data text-[11px] text-muted uppercase">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="font-data text-xs text-muted space-y-1">
          <p>role: <span className="text-text">{profile.role}</span></p>
          <p>bergabung: <span className="text-text">{new Date(profile.created_at).toLocaleDateString("id-ID")}</span></p>
        </div>

        <div>
          <h2 className="text-subtitle text-sm text-signal mb-3">edit profil</h2>
          <ProfileForm profile={profile} />
        </div>
      </div>
    ),

    account: (
      <div className="space-y-8 max-w-2xl">
        <div>
          <h2 className="text-subtitle text-sm text-signal mb-1">ganti email</h2>
          <p className="font-data text-xs text-muted mb-3">
            {user!.email_confirmed_at ? "email terverifikasi" : "email belum terverifikasi"}
          </p>
          <ChangeEmailForm currentEmail={user!.email!} />
        </div>
        <div>
          <h2 className="text-subtitle text-sm text-signal mb-3">ganti password</h2>
          <ChangePasswordForm />
        </div>
      </div>
    ),

    security: (
      <div className="space-y-8 max-w-2xl">
        <div>
          <h2 className="text-subtitle text-sm text-signal mb-3">autentikasi dua faktor (2FA)</h2>
          <TwoFactorSettings />
        </div>
        <div>
          <h2 className="text-subtitle text-sm text-signal mb-3">sesi</h2>
          <SignOutAllDevicesButton />
        </div>
        <div>
          <h2 className="text-subtitle text-sm text-signal mb-3">riwayat login</h2>
          <LoginHistoryList entries={loginHistoryRes.data ?? []} />
        </div>
      </div>
    ),

    preferences: (
      <div className="space-y-8 max-w-2xl">
        <div>
          <h2 className="text-subtitle text-sm text-signal mb-3">tema</h2>
          <ThemeToggle />
        </div>
        <div>
          <h2 className="text-subtitle text-sm text-signal mb-3">bahasa</h2>
          <LanguageSelect userId={user!.id} initial={profile.language_preference} />
        </div>
        <div>
          <h2 className="text-subtitle text-sm text-signal mb-3">notifikasi</h2>
          <NotificationToggle userId={user!.id} initial={profile.email_notifications} />
        </div>
        <div>
          <h2 className="text-subtitle text-sm text-signal mb-3">cache</h2>
          <ClearCacheButton />
        </div>
        <div className="pt-4 border-t border-line">
          <h2 className="text-title text-sm text-danger mb-3">privasi</h2>
          <div className="flex flex-wrap gap-2">
            <ExportDataButton />
            <DeleteAccountButton />
          </div>
        </div>
      </div>
    ),

    about: (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-accent" />
          <span className="font-mono text-text">Fathir Code</span>
          <ChangelogModal
            trigger={
              <span className="font-data text-xs text-accent hover:underline cursor-pointer">
                v1.0.1 — lihat perubahan
              </span>
            }
          />
        </div>
        <div className="grid gap-2">
          <Link href="/privacy-policy" className="flex items-center gap-2 font-data text-sm text-muted hover:text-accent">
            <FileText size={14} /> Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="flex items-center gap-2 font-data text-sm text-muted hover:text-accent">
            <ScrollText size={14} /> Terms of Service
          </Link>
          <a href="mailto:fathirsthore@gmail.com?subject=Bug Report" className="flex items-center gap-2 font-data text-sm text-muted hover:text-accent">
            <Bug size={14} /> Laporkan Bug
          </a>
          <a href="mailto:fathirsthore@gmail.com?subject=Support" className="flex items-center gap-2 font-data text-sm text-muted hover:text-accent">
            <Mail size={14} /> Hubungi Admin
          </a>
        </div>
      </div>
    ),
  };

  return (
    <div>
      <p className="font-data text-xs text-signal mb-2">$ fathir profile --settings</p>
      <h1 className="text-title text-2xl text-text mb-6">Profile &amp; Settings</h1>
      <SettingsTabs sections={sections} />
    </div>
  );
}
