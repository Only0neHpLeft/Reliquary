import { type ReactNode, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Sparkles,
  Search,
  Home,
  Zap,
  BookMarked,
  History,
  Aperture as ApertureIcon,
  Wand2,
  Network,
  Mic,
  Hexagon,
  Settings,
  Activity,
  HelpCircle,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { APP_TITLE } from "@/shared/lib/version";
import { useTheme } from "@/shared/lib/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  readonly label: string;
  readonly icon: LucideIcon;
  readonly to?: string;
  readonly soon?: boolean;
}

type VesselStatus = "closed" | "training" | "planned" | "deferred" | "proposed";

interface VesselItem {
  readonly name: string;
  readonly icon: LucideIcon;
  readonly note: string;
  readonly status: VesselStatus;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const WORKSPACE: readonly NavItem[] = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Playground", icon: Zap, soon: true },
  { label: "Library", icon: BookMarked, soon: true },
  { label: "History", icon: History, soon: true },
];

const VESSELS: readonly VesselItem[] = [
  { name: "Aperture", icon: ApertureIcon, note: "Text · Vision", status: "closed" },
  { name: "Dantian", icon: Wand2, note: "Image", status: "training" },
  { name: "Meridian", icon: Network, note: "Routing", status: "planned" },
  { name: "Qi", icon: Mic, note: "Speech", status: "deferred" },
  { name: "Gu", icon: Hexagon, note: "Textures", status: "proposed" },
];

const SYSTEM: readonly NavItem[] = [
  { label: "Settings", icon: Settings, soon: true },
  { label: "Activity", icon: Activity, soon: true },
  { label: "Help", icon: HelpCircle, soon: true },
];

const STATUS_LABEL: Record<VesselStatus, string> = {
  closed: "Closed",
  training: "Training",
  planned: "Planned",
  deferred: "Deferred",
  proposed: "Proposed",
};

const STATUS_DOT: Record<VesselStatus, string> = {
  closed: "bg-foreground/30",
  training: "bg-amber-400",
  planned: "bg-foreground/20",
  deferred: "bg-foreground/15",
  proposed: "bg-foreground/15",
};

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

  return [open, () => setOpen((v) => !v)] as const;
}

// ─── Shell ────────────────────────────────────────────────────────────────────

interface AppShellProps {
  readonly children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [open, toggle] = useSidebarOpen();

  return (
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
              <Sidebar />
            </motion.aside>
          )}
        </AnimatePresence>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
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

function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme !== "light";

  return (
    <div
      style={{ width: SIDEBAR_WIDTH }}
      className="flex h-full flex-col border-r border-foreground/[0.06] bg-background"
    >
      <header className="flex items-center gap-2 px-4 pt-4 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground/[0.06]">
          <Sparkles className="h-3.5 w-3.5 text-foreground/65" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Reliquary</span>
      </header>

      <div className="px-3 pb-2">
        <SearchBar />
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

function SearchBar() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-foreground/[0.06] bg-foreground/[0.02] px-2.5 py-1.5">
      <Search className="h-3 w-3 text-foreground/35" />
      <span className="flex-1 text-xs text-foreground/35">Search</span>
      <kbd className="rounded border border-foreground/10 px-1.5 py-px font-mono text-[9px] text-foreground/45">
        ⌘K
      </kbd>
    </div>
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

function NavRow({ item }: { item: NavItem }) {
  const Icon = item.icon;
  const baseClass = "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors";

  if (item.to) {
    return (
      <Link
        to={item.to}
        className={`${baseClass} text-foreground/70 hover:bg-foreground/[0.04] hover:text-foreground`}
        activeProps={{ className: "bg-foreground/[0.06] text-foreground" }}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden />
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled
      className={`${baseClass} cursor-not-allowed text-foreground/35`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span>{item.label}</span>
      {item.soon && (
        <span className="ml-auto text-[9px] font-medium uppercase tracking-wider text-foreground/30">
          Soon
        </span>
      )}
    </button>
  );
}

function VesselRow({ item }: { item: VesselItem }) {
  const Icon = item.icon;
  return (
    <div
      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-foreground/[0.03]"
      title={`${item.name} · ${STATUS_LABEL[item.status]}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-foreground/55" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-xs font-medium text-foreground/85">{item.name}</span>
        <span className="truncate text-[10px] text-foreground/40">{item.note}</span>
      </div>
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[item.status]}`}
        aria-label={STATUS_LABEL[item.status]}
      />
    </div>
  );
}
