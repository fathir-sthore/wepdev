"use client";

import { useState } from "react";
import { User, Shield, Sliders, Lock, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profil", icon: User },
  { id: "account", label: "Akun", icon: Shield },
  { id: "security", label: "Keamanan", icon: Lock },
  { id: "preferences", label: "Preferensi", icon: Sliders },
  { id: "about", label: "Tentang", icon: Info },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function SettingsTabs({ sections }: { sections: Record<TabId, React.ReactNode> }) {
  const [active, setActive] = useState<TabId>("profile");

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b border-line mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 font-mono text-sm transition-colors",
              active === id
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-text"
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {sections[active]}
    </div>
  );
}
