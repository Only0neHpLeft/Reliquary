import { Check } from "lucide-react";
import { Modal } from "@/shared/components/modal";
import { useUIStore } from "@/shared/lib/ui-store";
import { useTheme, type Theme } from "@/shared/lib/theme";
import { APP_TITLE, GIT_HASH } from "@/shared/lib/version";

interface ThemeSwatch {
  readonly id: Theme;
  readonly label: string;
  readonly note: string;
  readonly bg: string;
  readonly accent: string;
}

const THEMES: readonly ThemeSwatch[] = [
  { id: "dark", label: "Dark", note: "Pure black", bg: "#000000", accent: "#ffffff" },
  { id: "light", label: "Light", note: "Clean white", bg: "#ffffff", accent: "#000000" },
  { id: "cinnabar", label: "Cinnabar", note: "Alchemical crimson", bg: "#180e15", accent: "#fe6a96" },
  { id: "jade", label: "Jade", note: "Cultivation emerald", bg: "#0a1510", accent: "#4ade80" },
  { id: "obsidian", label: "Obsidian", note: "Deep indigo void", bg: "#0a0e1a", accent: "#818cf8" },
  { id: "amber", label: "Amber", note: "Warm golden furnace", bg: "#141008", accent: "#fbbf24" },
  { id: "lotus", label: "Lotus", note: "Spiritual violet", bg: "#100a18", accent: "#c084fc" },
];

interface Shortcut {
  readonly keys: readonly string[];
  readonly action: string;
}

const SHORTCUTS: readonly Shortcut[] = [
  { keys: ["⌘", "K"], action: "Open command palette" },
  { keys: ["⌘", "B"], action: "Toggle sidebar" },
  { keys: ["Esc"], action: "Close palette / overlay" },
  { keys: ["↑", "↓"], action: "Navigate palette results" },
  { keys: ["⏎"], action: "Send message / run command" },
];

export function SettingsModal() {
  const open = useUIStore((s) => s.settingsOpen);
  const setOpen = useUIStore((s) => s.setSettingsOpen);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Settings"
      subtitle="Local preferences. Nothing leaves the machine."
    >
      <div className="flex flex-col gap-7">
        <Section title="Appearance" subtitle="Pick a theme. Applies instantly.">
          <ThemePicker />
        </Section>
        <Section title="Shortcuts" subtitle="Global keyboard bindings.">
          <ShortcutTable />
        </Section>
        <Section title="About" subtitle="Build metadata for this session.">
          <AboutPanel />
        </Section>
      </div>
    </Modal>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3">
        <h3 className="text-sm font-semibold tracking-tight text-foreground/85">{title}</h3>
        <p className="text-xs text-foreground/45">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function ThemePicker() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {THEMES.map((t) => {
        const active = t.id === theme;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
              active
                ? "border-foreground/30 bg-foreground/[0.05]"
                : "border-foreground/[0.08] bg-foreground/[0.02] hover:bg-foreground/[0.04]"
            }`}
            aria-pressed={active}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-foreground/10"
              style={{ background: t.bg }}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: t.accent }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground/85">{t.label}</span>
                {active && <Check className="h-3 w-3 text-foreground/60" />}
              </div>
              <p className="truncate text-[11px] text-foreground/45">{t.note}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ShortcutTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-foreground/[0.08]">
      {SHORTCUTS.map((s, i) => (
        <div
          key={s.action}
          className={`flex items-center justify-between px-4 py-2.5 ${
            i > 0 ? "border-t border-foreground/[0.06]" : ""
          }`}
        >
          <span className="text-sm text-foreground/75">{s.action}</span>
          <div className="flex items-center gap-1">
            {s.keys.map((k) => (
              <kbd
                key={k}
                className="rounded border border-foreground/15 bg-foreground/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-foreground/70"
              >
                {k}
              </kbd>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AboutPanel() {
  return (
    <div className="rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] px-4 py-3">
      <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1.5 text-xs">
        <dt className="text-foreground/45">Version</dt>
        <dd className="font-mono text-foreground/80">{APP_TITLE}</dd>
        <dt className="text-foreground/45">Commit</dt>
        <dd className="font-mono text-foreground/80">{GIT_HASH}</dd>
        <dt className="text-foreground/45">License</dt>
        <dd className="text-foreground/80">Public · github.com/Only0neHpLeft/Reliquary</dd>
        <dt className="text-foreground/45">Telemetry</dt>
        <dd className="text-emerald-400">Off · zero exfiltration</dd>
      </dl>
    </div>
  );
}
