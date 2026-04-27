import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Home, Boxes, Activity, Settings, type LucideIcon } from "lucide-react";
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

interface AppShellProps {
  readonly children: ReactNode;
  readonly title?: string;
}

export function AppShell({ children, title = "Home" }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen gap-1.5 overflow-hidden bg-background p-1.5">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Topbar title={title} />
        <main className="flex-1 overflow-auto rounded-2xl border border-border/60 bg-card">
          {children}
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col rounded-2xl border border-border/60 bg-card">
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
    </aside>
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

function Topbar({ title }: { title: string }) {
  return (
    <header className="flex h-11 items-center justify-between rounded-2xl border border-border/60 bg-card px-4">
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-medium text-foreground/85">{title}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-foreground/45">
        <span>local-first</span>
        <span className="h-1 w-1 rounded-full bg-foreground/25" />
        <span>no telemetry</span>
      </div>
    </header>
  );
}
