import { MessageSquare, Trash2, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { Modal } from "@/shared/components/modal";
import { useUIStore } from "@/shared/lib/ui-store";
import { useChatStore } from "@/features/chat/store";

const RELATIVE = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const ABSOLUTE = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

function relativeTime(ts: number): string {
  const diff = ts - Date.now();
  const abs = Math.abs(diff);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (abs < minute) return "just now";
  if (abs < hour) return RELATIVE.format(Math.round(diff / minute), "minute");
  if (abs < day) return RELATIVE.format(Math.round(diff / hour), "hour");
  if (abs < 7 * day) return RELATIVE.format(Math.round(diff / day), "day");
  return ABSOLUTE.format(ts);
}

export function HistoryModal() {
  const open = useUIStore((s) => s.historyOpen);
  const setOpen = useUIStore((s) => s.setHistoryOpen);
  const conversations = useChatStore((s) => s.conversations);
  const setActive = useChatStore((s) => s.setActive);
  const removeConversation = useChatStore((s) => s.removeConversation);
  const clearAll = useChatStore((s) => s.clearAll);

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      if (c.title.toLowerCase().includes(q)) return true;
      return c.messages.some((m) => m.content.toLowerCase().includes(q));
    });
  }, [conversations, query]);

  const onSelect = (id: string) => {
    setActive(id);
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="History"
      subtitle={`${conversations.length} conversation${conversations.length === 1 ? "" : "s"} stored locally`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] px-3 py-2">
          <Search className="h-3.5 w-3.5 text-foreground/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by title or message..."
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/25"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-foreground/10 px-4 py-10 text-center text-sm text-foreground/35">
            {conversations.length === 0
              ? "No conversations yet. Start one from the sidebar."
              : `No matches for "${query}".`}
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-foreground/[0.04]"
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-foreground/35" aria-hidden />
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm text-foreground/85">{c.title}</p>
                  <p className="truncate text-[11px] text-foreground/35">
                    {c.messages.length} message{c.messages.length === 1 ? "" : "s"} ·{" "}
                    {relativeTime(c.createdAt)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => removeConversation(c.id)}
                  className="rounded-md p-1.5 text-foreground/30 opacity-0 transition-all hover:bg-rose-400/10 hover:text-rose-400 group-hover:opacity-100"
                  aria-label={`Delete ${c.title}`}
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {conversations.length > 0 && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                if (confirm("Delete all conversations? This cannot be undone.")) clearAll();
              }}
              className="text-[11px] text-foreground/40 transition-colors hover:text-rose-400"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
