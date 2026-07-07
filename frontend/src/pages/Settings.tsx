import { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const THEMES = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "system", label: "System", icon: Monitor },
] as const;

export default function Settings() {
  const [theme, setTheme] = useState<(typeof THEMES)[number]["key"]>("light");
  const [notifications, setNotifications] = useState({ analysisComplete: true, productUpdates: false });

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardContent className="pt-6">
          <p className="font-display text-xl italic text-[--color-ink]">Appearance</p>
          <p className="mt-1 text-sm text-[--color-ink-soft]">
            Theme switching is wired up here for you to extend — this scaffold ships with the light,
            editorial palette applied throughout.
          </p>
          <div className="mt-4 flex gap-3">
            {THEMES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm transition-colors",
                  theme === key ? "border-[--color-ink] bg-[--color-ink]/5" : "border-[--color-hairline] text-[--color-ink-soft]"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="font-display text-xl italic text-[--color-ink]">Notifications</p>
          <div className="mt-4 space-y-4">
            <label className="flex items-center justify-between text-sm">
              <span className="text-[--color-ink]">Email me when an analysis completes</span>
              <input
                type="checkbox"
                checked={notifications.analysisComplete}
                onChange={(e) => setNotifications((n) => ({ ...n, analysisComplete: e.target.checked }))}
                className="h-4 w-4"
              />
            </label>
            <label className="flex items-center justify-between text-sm">
              <span className="text-[--color-ink]">Product updates</span>
              <input
                type="checkbox"
                checked={notifications.productUpdates}
                onChange={(e) => setNotifications((n) => ({ ...n, productUpdates: e.target.checked }))}
                className="h-4 w-4"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="font-display text-xl italic text-[--color-ink]">Account</p>
          <p className="mt-1 text-sm text-[--color-ink-soft]">
            Manage your name, email, and password from the Profile page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
