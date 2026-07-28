const methodLabel: Record<string, string> = {
  password: "Login dengan password",
  "password+2fa": "Login dengan password + 2FA",
  password_reset: "Login lewat reset password",
  register: "Registrasi akun",
  google: "Login dengan Google",
  github: "Login dengan GitHub",
  discord: "Login dengan Discord",
};

type Entry = { id: string; method: string; user_agent: string | null; created_at: string };

export function LoginHistoryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return <p className="font-data text-xs text-muted">belum ada riwayat login.</p>;
  }

  return (
    <div className="max-w-lg divide-y divide-line border-y border-line">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-data text-xs text-text">
              {methodLabel[entry.method] ?? entry.method}
            </p>
            <p className="font-data text-[11px] text-muted truncate max-w-xs">
              {entry.user_agent ?? "unknown device"}
            </p>
          </div>
          <span className="font-data text-[11px] text-muted shrink-0">
            {new Date(entry.created_at).toLocaleString("id-ID")}
          </span>
        </div>
      ))}
    </div>
  );
}
