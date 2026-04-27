import { useEffect, useRef, useState } from "react";
import {
  Code2,
  GraduationCap,
  ImageIcon,
  PenLine,
  Send,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useChatStore, newId, type Conversation, type Message } from "./store";

const ASSISTANT_PLACEHOLDER =
  "No vessel is loaded yet. Aperture neuromorphic baseline ships first — once a vessel is online, your messages route through it. This is a UI preview.";

const USER_NAME = "Filip";

// ─── Top-level view ───────────────────────────────────────────────────────────

export function ChatView() {
  const activeId = useChatStore((s) => s.activeId);
  const conversation = useChatStore((s) =>
    activeId ? s.conversations.find((c) => c.id === activeId) ?? null : null,
  );
  const startConversation = useChatStore((s) => s.startConversation);
  const appendMessage = useChatStore((s) => s.appendMessage);

  const [draft, setDraft] = useState("");

  useEffect(() => {
    setDraft("");
  }, [activeId]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (activeId) {
      appendMessage(activeId, {
        id: newId(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      });
    } else {
      startConversation(trimmed);
    }
    setDraft("");

    setTimeout(() => {
      const targetId = useChatStore.getState().activeId;
      if (!targetId) return;
      appendMessage(targetId, {
        id: newId(),
        role: "assistant",
        content: ASSISTANT_PLACEHOLDER,
        createdAt: Date.now(),
      });
    }, 350);
  };

  if (!conversation) {
    return (
      <EmptyState
        draft={draft}
        onDraftChange={setDraft}
        onSend={() => send(draft)}
        onPickPrompt={(prompt) => setDraft(prompt)}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ConversationStream conversation={conversation} />
      <div className="border-t border-foreground/[0.06] px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <ChatInput
            value={draft}
            onChange={setDraft}
            onSend={() => send(draft)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({
  draft,
  onDraftChange,
  onSend,
  onPickPrompt,
}: {
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: () => void;
  onPickPrompt: (prompt: string) => void;
}) {
  return (
    <div className="flex h-full items-center justify-center px-6 pb-16">
      <div className="w-full max-w-2xl">
        <Greeting />
        <div className="mt-8">
          <ChatInput
            value={draft}
            onChange={onDraftChange}
            onSend={onSend}
            autoFocus
            placeholder="How can I help?"
          />
        </div>
        <div className="mt-5">
          <QuickActions onPick={onPickPrompt} />
        </div>
      </div>
    </div>
  );
}

function Greeting() {
  const hour = new Date().getHours();
  const period =
    hour < 5
      ? "Late night"
      : hour < 12
        ? "Morning"
        : hour < 17
          ? "Afternoon"
          : hour < 22
            ? "Evening"
            : "Late night";

  return (
    <div className="flex items-center justify-center gap-3">
      <Sparkles className="h-7 w-7 text-foreground/40" />
      <h1 className="text-3xl font-medium tracking-tight text-foreground/90">
        {period},{" "}
        <span className="text-foreground">{USER_NAME}</span>
      </h1>
    </div>
  );
}

interface QuickAction {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly prompt: string;
}

const QUICK_ACTIONS: readonly QuickAction[] = [
  { icon: PenLine, label: "Write", prompt: "Help me write " },
  { icon: GraduationCap, label: "Learn", prompt: "Explain " },
  { icon: Code2, label: "Code", prompt: "Help me with this code:\n\n" },
  { icon: ImageIcon, label: "Image", prompt: "Generate an image of " },
  { icon: Sparkles, label: "Surprise me", prompt: "Tell me something interesting about " },
];

function QuickActions({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {QUICK_ACTIONS.map((a) => (
        <button
          key={a.label}
          type="button"
          onClick={() => onPick(a.prompt)}
          className="flex items-center gap-2 rounded-full border border-foreground/[0.08] bg-foreground/[0.02] px-3.5 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:border-foreground/15 hover:bg-foreground/[0.05] hover:text-foreground"
        >
          <a.icon className="h-3 w-3" aria-hidden />
          {a.label}
        </button>
      ))}
    </div>
  );
}

// ─── Conversation stream ─────────────────────────────────────────────────────

function ConversationStream({ conversation }: { conversation: Conversation }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation.messages.length]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-8">
        <header className="mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/35">
            Conversation
          </p>
          <h2 className="mt-1 truncate text-sm font-medium text-foreground/80">
            {conversation.title}
          </h2>
        </header>
        {conversation.messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-foreground text-background"
            : "border border-foreground/[0.08] bg-foreground/[0.03] text-foreground/85"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────

interface ChatInputProps {
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly onSend: () => void;
  readonly autoFocus?: boolean;
  readonly placeholder?: string;
}

function ChatInput({
  value,
  onChange,
  onSend,
  autoFocus = false,
  placeholder = "Send a message...",
}: ChatInputProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Autosize
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 240)}px`;
  }, [value]);

  // Focus when value changes externally (e.g. quick action picked)
  useEffect(() => {
    if (autoFocus && taRef.current && value.length > 0) {
      taRef.current.focus();
      taRef.current.setSelectionRange(value.length, value.length);
    }
  }, [value, autoFocus]);

  // Initial autofocus
  useEffect(() => {
    if (autoFocus) taRef.current?.focus();
  }, [autoFocus]);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div>
      <div className="flex items-end gap-2 rounded-2xl border border-foreground/[0.08] bg-foreground/[0.02] px-3 py-2 transition-colors focus-within:border-foreground/20">
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKey}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none bg-transparent py-1 text-sm leading-relaxed text-foreground/90 outline-none placeholder:text-foreground/30"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!value.trim()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-25"
          aria-label="Send"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-2 text-center text-[10px] text-foreground/30">
        Enter to send · Shift+Enter for newline · ⌘K to search
      </p>
    </div>
  );
}
