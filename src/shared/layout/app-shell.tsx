import { type ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Search,
  Plus,
  MessageSquare,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { APP_TITLE } from "@/shared/lib/version";
import { useTheme } from "@/shared/lib/theme";
import { useUIStore } from "@/shared/lib/ui-store";
import { useChatStore, type Conversation } from "@/features/chat/store";
import { DEMO_CONVERSATIONS } from "@/features/chat/demo";
import { CommandPalette, useCommandPalette } from "./command-palette";
import { SettingsModal } from "./settings-modal";
import { HistoryModal } from "./history-modal";

const SIDEBAR_WIDTH = 256;
const SIDEBAR_KEY = "reliquary-sidebar";
const DEMO_SEEDED_KEY = "reliquary-demo-seeded";

// ─── Sidebar state hook ───────────────────────────────────────────────────────

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DEMO_SEEDED_KEY)) return;
    const state = useChatStore.getState();
    if (state.conversations.length === 0) {
      state.seedDemo(DEMO_CONVERSATIONS);
    }
    localStorage.setItem(DEMO_SEEDED_KEY, "1");
  }, []);

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
          <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
      <CommandPalette open={cmdK.open} onClose={cmdK.onClose} />
      <SettingsModal />
      <HistoryModal />
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

  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeId);
  const setActive = useChatStore((s) => s.setActive);
  const removeConversation = useChatStore((s) => s.removeConversation);

  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const setHistoryOpen = useUIStore((s) => s.setHistoryOpen);

  return (
    <div
      style={{ width: SIDEBAR_WIDTH }}
      className="flex h-full flex-col border-r border-foreground/[0.06] bg-background"
    >
      <div className="px-3 pt-4 pb-2">
        <SearchTrigger onClick={onSearchClick} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <Section
          label="Conversations"
          action={
            <button
              type="button"
              onClick={() => setActive(null)}
              title="New conversation"
              aria-label="New conversation"
              className="flex h-5 w-5 items-center justify-center rounded text-foreground/40 transition-colors hover:bg-foreground/[0.06] hover:text-foreground/85"
            >
              <Plus className="h-3 w-3" />
            </button>
          }
        >
          {conversations.length === 0 ? (
            <p className="px-2 py-1.5 text-[11px] text-foreground/30">
              No conversations yet
            </p>
          ) : (
            conversations.map((c) => (
              <ConversationRow
                key={c.id}
                conversation={c}
                active={c.id === activeId}
                onClick={() => setActive(c.id)}
                onDelete={() => removeConversation(c.id)}
              />
            ))
          )}
        </Section>

        <Section label="Archive">
          <ButtonRow
            icon={HistoryIcon}
            label="History"
            onClick={() => setHistoryOpen(true)}
          />
          <ButtonRow
            icon={SettingsIcon}
            label="Settings"
            onClick={() => setSettingsOpen(true)}
          />
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
          <p className="font-mono text-[10px] tracking-tight text-foreground/35">
            {APP_TITLE}
          </p>
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

function Section({
  label,
  action,
  children,
}: {
  label: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mb-1 pt-2">
      <div className="mb-1 flex items-center justify-between px-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-foreground/35">
          {label}
        </h3>
        {action}
      </div>
      <div className="flex flex-col gap-px">{children}</div>
    </div>
  );
}

function ConversationRow({
  conversation,
  active,
  onClick,
  onDelete,
}: {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
        active
          ? "bg-foreground/[0.06] text-foreground"
          : "text-foreground/70 hover:bg-foreground/[0.04] hover:text-foreground"
      }`}
    >
      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-foreground/45" aria-hidden />
      <button
        type="button"
        onClick={onClick}
        className="min-w-0 flex-1 truncate text-left"
        title={conversation.title}
      >
        {conversation.title}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={`Delete ${conversation.title}`}
        title="Delete"
        className="rounded p-0.5 text-foreground/30 opacity-0 transition-all hover:bg-rose-400/10 hover:text-rose-400 group-hover:opacity-100"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

function ButtonRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span>{label}</span>
    </button>
  );
}
