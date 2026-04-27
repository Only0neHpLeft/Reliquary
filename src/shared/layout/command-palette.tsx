import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  Aperture as ApertureIcon,
  Activity,
  BookMarked,
  HelpCircle,
  Hexagon,
  History,
  Home,
  Mic,
  Moon,
  Network,
  Search,
  Settings,
  Sparkles,
  Sun,
  Wand2,
  Zap,
} from "lucide-react";
import { useTheme } from "@/shared/lib/theme";

// ─── Fuzzy cascade search ─────────────────────────────────────────────────────

function levenshtein(a: string, b: string, bound: number = 2): number {
  if (a.length > b.length) [a, b] = [b, a];
  if (!a.length) return b.length;
  if (b.length - a.length > bound) return bound + 1;

  let prev = Array.from({ length: a.length + 1 }, (_, i) => i);
  for (let j = 1; j <= b.length; j++) {
    const curr = [j, ...Array(a.length).fill(0)];
    let rowMin = j;
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[i] = Math.min(curr[i - 1] + 1, prev[i] + 1, prev[i - 1] + cost);
      if (curr[i] < rowMin) rowMin = curr[i];
    }
    if (rowMin > bound) return bound + 1;
    prev = curr;
  }
  return prev[a.length];
}

function fuzzyForwardMatch(query: string, target: string): boolean {
  let qi = 0;
  for (let ti = 0; ti < target.length && qi < query.length; ti++) {
    if (query[qi] === target[ti]) qi++;
  }
  return qi === query.length;
}

interface ScoredItem<T> {
  readonly item: T;
  readonly score: number;
}

function cascadeSearch<T extends { label: string; desc: string; group: string }>(
  items: readonly T[],
  rawQuery: string,
): readonly T[] {
  const q = rawQuery.toLowerCase().trim();
  if (!q) return items;

  const scored: ScoredItem<T>[] = [];

  for (const item of items) {
    const label = item.label.toLowerCase();
    const desc = item.desc.toLowerCase();
    const group = item.group.toLowerCase();
    const haystack = `${label} ${desc} ${group}`;

    if (label.startsWith(q)) {
      scored.push({ item, score: 100 });
      continue;
    }
    if (label.includes(q)) {
      scored.push({ item, score: 80 });
      continue;
    }
    if (haystack.includes(q)) {
      scored.push({ item, score: 60 });
      continue;
    }
    if (fuzzyForwardMatch(q, label) || fuzzyForwardMatch(q, haystack)) {
      scored.push({ item, score: 40 });
      continue;
    }
    if (q.length >= 3) {
      const dist = levenshtein(q, label);
      if (dist <= 2) {
        scored.push({ item, score: 20 - dist });
        continue;
      }
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .map((s) => s.item);
}

// ─── Commands ────────────────────────────────────────────────────────────────

const BADGE_SOON = "text-foreground/40 bg-foreground/[0.06]";
const BADGE_CLOSED = "text-rose-400 bg-rose-400/10";
const BADGE_TRAINING = "text-amber-400 bg-amber-400/10";
const BADGE_PLANNED = "text-sky-400 bg-sky-400/10";
const BADGE_MUTED = "text-foreground/40 bg-foreground/[0.06]";

interface CommandItem {
  readonly id: string;
  readonly label: string;
  readonly desc: string;
  readonly group: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly href?: string;
  readonly action?: () => void;
  readonly badge?: string;
  readonly badgeColor?: string;
}

function useCommands(): readonly CommandItem[] {
  const { setTheme } = useTheme();

  return useMemo(
    () => [
      // Workspace
      { id: "home", label: "Home", desc: "Dashboard", group: "Workspace", icon: Home, href: "/" },
      { id: "playground", label: "Playground", desc: "Generate with all vessels", group: "Workspace", icon: Zap, href: "/playground", badge: "Soon", badgeColor: BADGE_SOON },
      { id: "library", label: "Library", desc: "Saved prompts and outputs", group: "Workspace", icon: BookMarked, href: "/library", badge: "Soon", badgeColor: BADGE_SOON },
      { id: "history", label: "History", desc: "Recent runs", group: "Workspace", icon: History, href: "/history", badge: "Soon", badgeColor: BADGE_SOON },

      // Vessels
      { id: "aperture", label: "Aperture", desc: "Text and vision foundation", group: "Vessels", icon: ApertureIcon, href: "/", badge: "Closed", badgeColor: BADGE_CLOSED },
      { id: "dantian", label: "Dantian", desc: "Image generation (CFM)", group: "Vessels", icon: Wand2, href: "/", badge: "Training", badgeColor: BADGE_TRAINING },
      { id: "meridian", label: "Meridian", desc: "Inference orchestration", group: "Vessels", icon: Network, href: "/", badge: "Planned", badgeColor: BADGE_PLANNED },
      { id: "qi", label: "Qi", desc: "Speech-to-text (Qi-Ear)", group: "Vessels", icon: Mic, href: "/", badge: "Deferred", badgeColor: BADGE_MUTED },
      { id: "gu", label: "Gu", desc: "Minecraft texture model", group: "Vessels", icon: Hexagon, href: "/", badge: "Proposed", badgeColor: BADGE_MUTED },

      // System
      { id: "settings", label: "Settings", desc: "Preferences and config", group: "System", icon: Settings, href: "/settings", badge: "Soon", badgeColor: BADGE_SOON },
      { id: "activity", label: "Activity", desc: "Logs and run history", group: "System", icon: Activity, href: "/activity", badge: "Soon", badgeColor: BADGE_SOON },
      { id: "help", label: "Help", desc: "Documentation and support", group: "System", icon: HelpCircle, href: "/help", badge: "Soon", badgeColor: BADGE_SOON },

      // Theme
      { id: "theme-dark", label: "Dark theme", desc: "Pure black", group: "Theme", icon: Moon, action: () => setTheme("dark") },
      { id: "theme-light", label: "Light theme", desc: "Clean white", group: "Theme", icon: Sun, action: () => setTheme("light") },
      { id: "theme-cinnabar", label: "Cinnabar", desc: "Alchemical crimson", group: "Theme", icon: Sparkles, action: () => setTheme("cinnabar") },
      { id: "theme-jade", label: "Jade", desc: "Cultivation emerald", group: "Theme", icon: Sparkles, action: () => setTheme("jade") },
      { id: "theme-obsidian", label: "Obsidian", desc: "Deep indigo void", group: "Theme", icon: Sparkles, action: () => setTheme("obsidian") },
      { id: "theme-amber", label: "Amber", desc: "Warm golden furnace", group: "Theme", icon: Sparkles, action: () => setTheme("amber") },
      { id: "theme-lotus", label: "Lotus", desc: "Spiritual violet", group: "Theme", icon: Sparkles, action: () => setTheme("lotus") },
    ],
    [setTheme],
  );
}

// ─── Palette ─────────────────────────────────────────────────────────────────

interface CommandPaletteProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const commands = useCommands();

  const filtered = useMemo(() => cascadeSearch(commands, query), [query, commands]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const item of filtered) {
      const g = groups[item.group] ?? [];
      g.push(item);
      groups[item.group] = g;
    }
    return groups;
  }, [filtered]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const execute = useCallback(
    (item: CommandItem) => {
      onClose();
      if (item.action) {
        item.action();
        return;
      }
      if (!item.href) return;
      router.navigate({ to: item.href as "/" });
    },
    [router, onClose],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filtered.length || 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length || 0);
      } else if (e.key === "Enter" && filtered[activeIndex]) {
        e.preventDefault();
        execute(filtered[activeIndex]);
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [filtered, activeIndex, execute, onClose],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  let itemIndex = -1;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] animate-[fade-in_150ms_ease] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-x-0 top-[15vh] z-[61] mx-auto w-full max-w-lg animate-[fade-up_200ms_cubic-bezier(0.16,1,0.3,1)] px-4">
        <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-background/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-foreground/[0.06] px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-foreground/30" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/25"
            />
            <kbd className="flex items-center rounded border border-foreground/10 bg-foreground/5 px-1.5 py-0.5 text-[10px] font-medium text-foreground/25">
              ESC
            </kbd>
          </div>

          <div ref={listRef} className="max-h-[50vh] overflow-y-auto overscroll-contain p-2">
            {filtered.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-foreground/25">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}

            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/20">
                  {group}
                </p>
                {items.map((item) => {
                  itemIndex++;
                  const idx = itemIndex;
                  const Icon = item.icon;
                  const isActive = idx === activeIndex;

                  return (
                    <button
                      key={item.id}
                      data-index={idx}
                      onClick={() => execute(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        isActive ? "bg-foreground/[0.06]" : "hover:bg-foreground/[0.03]"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-foreground/30" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground/70">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${item.badgeColor}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-foreground/25">{item.desc}</p>
                      </div>
                      {isActive && <span className="text-[10px] text-foreground/20">Enter</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Hook: global Cmd+K / Ctrl+K listener ─────────────────────────────────────

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { open, setOpen, onClose: () => setOpen(false) } as const;
}
