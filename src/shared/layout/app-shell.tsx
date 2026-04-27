import { type ReactNode, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Sparkles,
  Home,
  Boxes,
  Activity,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { APP_TITLE } from "@/shared/lib/version";

interface NavItem {
  readonly label: string;
  readonly icon: LucideIcon;
  readonly to?: string;
  readonly soon?: boolean;
}

const NAV: readonly NavItem[] = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Vessels", icon: Boxes, soon: true },
  { label: "Activity", icon: Activity, soon: true },
  { label: "Settings", icon: Settings, soon: true },
];

const SIDEBAR_WIDTH = 224;
const SIDEBAR_KEY = "reliquary-sidebar";

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

interface AppShellProps {
  readonly children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [open, toggle] = useSidebarOpen();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      <Titlebar open={open} onToggle={toggle} />
      <div className="flex min-h-0 flex-1 gap-1.5 px-1.5 pb-1.5">
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

function Titlebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const Icon = open ? PanelLeftClose : PanelLeftOpen;
  return (
    <div
      data-tauri-drag-region
      className="flex h-9 shrink-0 items-center gap-2 pl-[78px] pr-3"
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

function Sidebar() {
  return (
    <div
      style={{ width: SIDEBAR_WIDTH }}
      className="flex h-full flex-col rounded-2xl border border-border/60 bg-card"
    >
      <header className="flex items-center gap-2 px-4 pt-4 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground/[0.06]">
          <Sparkles className="h-3.5 w-3.5 text-foreground/65" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Reliquary</span>
      </header>

      <div className="px-3 pb-2">
        <div className="h-px bg-border/60" />
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {NAV.map((item) => (
          <NavRow key={item.label} item={item} />
        ))}
      </nav>

      <footer className="mt-auto px-4 pb-4 pt-3">
        <div className="mb-2 h-px bg-border/60" />
        <p className="font-mono text-[10px] tracking-tight text-foreground/40">{APP_TITLE}</p>
      </footer>
    </div>
  );
}

function NavRow({ item }: { item: NavItem }) {
  const Icon = item.icon;
  const baseClass =
    "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors";

  if (item.to) {
    return (
      <Link
        to={item.to}
        className={`${baseClass} text-foreground/70 hover:bg-foreground/[0.05] hover:text-foreground`}
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
      className={`${baseClass} cursor-not-allowed text-foreground/40`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span>{item.label}</span>
      {item.soon && (
        <span className="ml-auto rounded-full border border-border/70 px-1.5 py-px text-[9px] font-medium uppercase tracking-wider text-foreground/45">
          Soon
        </span>
      )}
    </button>
  );
}
