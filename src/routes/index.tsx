import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Aperture as ApertureIcon,
  Cpu,
  Hash,
  Home as HomeIcon,
  Maximize2,
  Palette,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GIT_HASH } from "@/shared/lib/version";
import { useTheme } from "@/shared/lib/theme";

interface SystemInfo {
  readonly appName: string;
  readonly appVersion: string;
  readonly tauriVersion: string;
  readonly windowSize: string;
  readonly platform: "tauri" | "browser";
}

function useSystemInfo(): SystemInfo {
  const [info, setInfo] = useState<SystemInfo>({
    appName: "Reliquary",
    appVersion: "—",
    tauriVersion: "—",
    windowSize: "—",
    platform: "browser",
  });

  useEffect(() => {
    let mounted = true;
    let unlisten: (() => void) | null = null;

    (async () => {
      try {
        const [{ getName, getVersion, getTauriVersion }, { getCurrentWindow }] =
          await Promise.all([
            import("@tauri-apps/api/app"),
            import("@tauri-apps/api/window"),
          ]);

        const [appName, appVersion, tauriVersion, size] = await Promise.all([
          getName(),
          getVersion(),
          getTauriVersion(),
          getCurrentWindow().innerSize(),
        ]);

        if (!mounted) return;

        setInfo({
          appName,
          appVersion,
          tauriVersion,
          windowSize: `${size.width} × ${size.height}`,
          platform: "tauri",
        });

        const handle = await getCurrentWindow().onResized(({ payload }) => {
          setInfo((prev) => ({
            ...prev,
            windowSize: `${payload.width} × ${payload.height}`,
          }));
        });

        if (!mounted) {
          handle();
        } else {
          unlisten = handle;
        }
      } catch {
        if (mounted) {
          setInfo((prev) => ({ ...prev, platform: "browser" }));
        }
      }
    })();

    return () => {
      mounted = false;
      unlisten?.();
    };
  }, []);

  return info;
}

const VESSEL_TALLY = [
  { label: "Closed", count: 1, color: "text-rose-400" },
  { label: "Training", count: 1, color: "text-amber-400" },
  { label: "Planned", count: 1, color: "text-sky-400" },
  { label: "Deferred", count: 1, color: "text-foreground/45" },
  { label: "Proposed", count: 1, color: "text-foreground/45" },
];

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { theme } = useTheme();
  const info = useSystemInfo();

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-8 py-10">
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-foreground/[0.08] bg-foreground/[0.02] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground/45">
          <span className={`h-1.5 w-1.5 rounded-full ${info.platform === "tauri" ? "bg-emerald-400" : "bg-amber-400"}`} />
          {info.platform === "tauri" ? "Native shell" : "Browser preview"}
        </div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Welcome to Reliquary</h1>
        <p className="text-sm leading-relaxed text-foreground/55">
          Vessel for the cultivation stack. No telemetry, no cloud, no API keys — every model
          runs local. Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> for commands or{" "}
          <Kbd>⌘</Kbd> <Kbd>B</Kbd> to toggle the sidebar.
        </p>
      </header>

      <div className="mb-8">
        <SectionHeader>System</SectionHeader>
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            icon={HomeIcon}
            label="App"
            value={info.appName}
            note={`v${info.appVersion}`}
          />
          <StatCard
            icon={Cpu}
            label="Tauri"
            value={info.tauriVersion}
            note="runtime"
          />
          <StatCard
            icon={Maximize2}
            label="Window"
            value={info.windowSize}
            note="live"
          />
          <StatCard
            icon={Hash}
            label="Build"
            value={GIT_HASH}
            note="commit"
            mono
          />
          <StatCard
            icon={Palette}
            label="Theme"
            value={theme}
            note="capitalize"
            capitalize
          />
          <StatCard
            icon={ApertureIcon}
            label="Vessels"
            value={String(VESSEL_TALLY.reduce((s, v) => s + v.count, 0))}
            note="registered"
          />
        </div>
      </div>

      <div className="mb-8">
        <SectionHeader>Vessel status</SectionHeader>
        <div className="rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            {VESSEL_TALLY.map((v) => (
              <div key={v.label} className="flex items-center gap-1.5">
                <span className={`text-base font-semibold ${v.color}`}>{v.count}</span>
                <span className="text-foreground/55">{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-auto pt-6 text-center text-[11px] text-foreground/30">
        <Sparkles className="mx-auto mb-1.5 h-3 w-3" />
        Local-first · zero telemetry · weights stay on disk
      </footer>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/35">
      {children}
    </h2>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
  mono,
  capitalize,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] px-4 py-3 transition-colors hover:bg-foreground/[0.03]">
      <div className="mb-1.5 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-foreground/40">
        <Icon className="h-3 w-3" aria-hidden />
        {label}
      </div>
      <div
        className={`text-base font-semibold tracking-tight text-foreground/90 ${mono ? "font-mono" : ""} ${capitalize ? "capitalize" : ""}`}
      >
        {value}
      </div>
      <div className="text-[10px] text-foreground/35">{note}</div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-foreground/15 bg-foreground/[0.04] px-1 py-0.5 font-mono text-[10px] text-foreground/70">
      {children}
    </kbd>
  );
}
