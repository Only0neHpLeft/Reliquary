import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { useChatStore, newId, type Conversation, type Message } from "./store";

const ASSISTANT_PLACEHOLDER =
  "No vessel is loaded yet. Aperture neuromorphic baseline ships first — once a vessel is online, your messages route through it. This is a UI preview.";

export function ChatView() {
  const activeId = useChatStore((s) => s.activeId);
  const conversation = useChatStore((s) =>
    activeId ? s.conversations.find((c) => c.id === activeId) ?? null : null,
  );
  const startConversation = useChatStore((s) => s.startConversation);
  const appendMessage = useChatStore((s) => s.appendMessage);

  const handleSend = (text: string) => {
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {conversation ? (
          <ConversationView conversation={conversation} />
        ) : (
          <EmptyState />
        )}
      </div>
      <ChatInput onSend={handleSend} key={activeId ?? "empty"} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 pb-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/[0.05]">
        <Sparkles className="h-5 w-5 text-foreground/55" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">Start a conversation</h1>
      <p className="mt-2 max-w-sm text-center text-sm leading-relaxed text-foreground/45">
        Type a message below. A new conversation lands in your sidebar — local, private, yours.
      </p>
    </div>
  );
}

function ConversationView({ conversation }: { conversation: Conversation }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation.messages.length]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-8">
      <div className="mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/35">
          Conversation
        </p>
        <h2 className="mt-1 truncate text-sm font-medium text-foreground/80">
          {conversation.title}
        </h2>
      </div>
      {conversation.messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      <div ref={endRef} />
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
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

function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Autosize
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [value]);

  const submit = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-foreground/[0.06] px-6 py-4">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-end gap-2 rounded-2xl border border-foreground/[0.08] bg-foreground/[0.02] px-3 py-2 transition-colors focus-within:border-foreground/20">
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            placeholder="Send a message..."
            rows={1}
            className="flex-1 resize-none bg-transparent py-1 text-sm leading-relaxed text-foreground/90 outline-none placeholder:text-foreground/30"
          />
          <button
            type="button"
            onClick={submit}
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
    </div>
  );
}
