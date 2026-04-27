import { type ReactNode, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Search,
  Home,
  Zap,
  BookMarked,
  History as HistoryIcon,
  Aperture as ApertureIcon,
  Wand2,
  Network,
  Mic,
  Hexagon,
  Settings as SettingsIcon,
  Activity as ActivityIcon,
  HelpCircle,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { APP_TITLE } from "@/shared/lib/version";
import { useTheme } from "@/shared/lib/theme";
import { CommandPalette, useCommandPalette } from "./command-palette";

// ─── Badge tones (matched to Aperture's pattern) ──────────────────────────────

const BADGE = {
  soon: "text-foreground/40 bg-foreground/[0.06]",
  closed: "text-rose-400 bg-rose-400/10",
  training: "text-amber-400 bg-amber-400/10",
  planned: "text-sky-400 bg-sky-400/10",
  muted: "text-foreground/40 bg-foreground/[0.06]",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  readonly label: string;
  readonly to: string;
  readonly icon: LucideIcon;
  readonly badge?: string;
  readonly badgeColor?: string;
}

interface VesselItem {
  readonly name: string;
  readonly icon: LucideIcon;
  readonly note: string;
  readonly badge: string;
  readonly badgeColor: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const WORKSPACE: readonly NavItem[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Playground", to: "/playground", icon: Zap, badge: "Soon", badgeColor: BADGE.soon },
  { label: "Library", to: "/library", icon: BookMarked, badge: "Soon", badgeColor: BADGE.soon },
  { label: "History", to: "/history", icon: HistoryIcon, badge: "Soon", badgeColor: BADGE.soon },
];

const VESSELS: readonly VesselItem[] = [
  { name: "Aperture", icon: ApertureIcon, note: "Text · Vision", badge: "Closed", badgeColor: BADGE.closed },
  { name: "Dantian", icon: Wand2, note: "Image", badge: "Training", badgeColor: BADGE.training },
  { name: "Meridian", icon: Network, note: "Routing", badge: "Planned", badgeColor: BADGE.planned },
  { name: "Qi", icon: Mic, note: "Speech", badge: "Deferred", badgeColor: BADGE.muted },
  { name: "Gu", icon: Hexagon, note: "Textures", badge: "Proposed", badgeColor: BADGE.muted },
];

const SYSTEM: readonly NavItem[] = [
  { label: "Settings", to: "/settings", icon: SettingsIcon, badge: "Soon", badgeColor: BADGE.soon },
  { label: "Activity", to: "/activity", icon: ActivityIcon, badge: "Soon", badgeColor: BADGE.soon },
  { label: "Help", to: "/help", icon: HelpCircle, badge: "Soon", badgeColor: BADGE.soon },
];

const SIDEBAR_WIDTH = 256;
const SIDEBAR_KEY = "reliquary-sidebar";

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useSidebarOpen(): readonly [boolean, () => void] {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(SIDEBAR_KEY) !== "closed";
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, open ? "open" : "closed");
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return [open, () => setOpen((v) => !v)] as const;
}

// ─── Shell ────────────────────────────────────────────────────────────────────

interface AppShellProps {
  readonly children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [open, toggle] = useSidebarOpen();
  const cmdK = useCommandPalette();

  return (
    <>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
        <Titlebar open={open} onToggle={toggle} />
        <div className="flex min-h-0 flex-1">
          <AnimatePresence initial={false}>
            {open && (
              <motion.aside
                key="sidebar"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: SIDEBAR_WIDTH, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                className="h-full shrink-0 overflow-hidden"
              >
                <Sidebar onSearchClick={() => cmdK.setOpen(true)} />
              </motion.aside>
            )}
          </AnimatePresence>
          <div className="min-w-0 flex-1 overflow-auto">{children}</div>
        </div>
      </div>
      <CommandPalette open={cmdK.open} onClose={cmdK.onClose} />
    </>
  );
}

// ─── Titlebar ─────────────────────────────────────────────────────────────────

function Titlebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const Icon = open ? PanelLeftClose : PanelLeftOpen;

  const handleMouseDown = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      if (e.detail === 2) {
        const isMax = await win.isMaximized();
        if (isMax) await win.unmaximize();
        else await win.maximize();
      } else {
        await win.startDragging();
      }
    } catch {
      // Browser dev — no native window.
    }
  };

  return (
    <div
      data-tauri-drag-region
      onMouseDown={handleMouseDown}
      className="flex h-9 shrink-0 items-center gap-2 border-b border-foreground/[0.06] pl-[78px] pr-3"
    >
      <button
        type="button"
        data-tauri-drag-region="false"
        onClick={onToggle}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        title={open ? "Collapse sidebar" : "Expand sidebar"}
        className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/55 transition-colors hover:bg-foreground/[0.06] hover:text-foreground/85"
      >
        <Icon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ onSearchClick }: { onSearchClick: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme !== "light";

  return (
    <div
      style={{ width: SIDEBAR_WIDTH }}
      className="flex h-full flex-col border-r border-foreground/[0.06] bg-background"
    >
      <div className="px-3 pt-4 pb-2">
        <SearchTrigger onClick={onSearchClick} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <Section label="Workspace">
          {WORKSPACE.map((item) => (
            <NavRow key={item.label} item={item} />
          ))}
        </Section>

        <Section label="Vessels">
          {VESSELS.map((v) => (
            <VesselRow key={v.name} item={v} />
          ))}
        </Section>

        <Section label="System">
          {SYSTEM.map((item) => (
            <NavRow key={item.label} item={item} />
          ))}
        </Section>
      </div>

      <footer className="border-t border-foreground/[0.06] px-3 pb-3 pt-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-foreground/55 transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
            title={isDark ? "Switch to light" : "Switch to dark"}
          >
            {isDark ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
            <span>{isDark ? "Light" : "Dark"}</span>
          </button>
          <p className="font-mono text-[10px] tracking-tight text-foreground/35">{APP_TITLE}</p>
        </div>
      </footer>
    </div>
  );
}

function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md border border-foreground/[0.06] bg-foreground/[0.02] px-2.5 py-1.5 text-left transition-colors hover:bg-foreground/[0.04]"
    >
      <Search className="h-3 w-3 text-foreground/35" />
      <span className="flex-1 text-xs text-foreground/35">Search</span>
      <kbd className="rounded border border-foreground/10 px-1.5 py-px font-mono text-[9px] text-foreground/45">
        ⌘K
      </kbd>
    </button>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-1 pt-2">
      <h3 className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/35">
        {label}
      </h3>
      <div className="flex flex-col gap-px">{children}</div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${color}`}>
      {label}
    </span>
  );
}

function NavRow({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      activeOptions={{ exact: true }}
      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
      activeProps={{ className: "bg-foreground/[0.06] text-foreground" }}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span className="flex-1">{item.label}</span>
      {item.badge && item.badgeColor && <Badge label={item.badge} color={item.badgeColor} />}
    </Link>
  );
}

function VesselRow({ item }: { item: VesselItem }) {
  const Icon = item.icon;
  return (
    <div
      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-foreground/[0.03]"
      title={`${item.name} · ${item.badge}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-foreground/55" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-xs font-medium text-foreground/85">{item.name}</span>
        <span className="truncate text-[10px] text-foreground/40">{item.note}</span>
      </div>
      <Badge label={item.badge} color={item.badgeColor} />
    </div>
  );
}
