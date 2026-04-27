import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly createdAt: number;
}

export interface Conversation {
  readonly id: string;
  readonly title: string;
  readonly createdAt: number;
  readonly messages: Message[];
}

interface ChatState {
  readonly conversations: Conversation[];
  readonly activeId: string | null;
}

interface ChatActions {
  readonly setActive: (id: string | null) => void;
  readonly startConversation: (firstMessage: string) => string;
  readonly appendMessage: (conversationId: string, message: Message) => void;
  readonly removeConversation: (id: string) => void;
  readonly renameConversation: (id: string, title: string) => void;
  readonly clearAll: () => void;
}

type ChatStore = ChatState & ChatActions;

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function deriveTitle(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length <= 60 ? trimmed : trimmed.slice(0, 60).trimEnd() + "…";
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      conversations: [],
      activeId: null,
      setActive: (id) => set({ activeId: id }),
      startConversation: (firstMessage) => {
        const id = uid();
        const now = Date.now();
        const conv: Conversation = {
          id,
          title: deriveTitle(firstMessage),
          createdAt: now,
          messages: [
            { id: uid(), role: "user", content: firstMessage, createdAt: now },
          ],
        };
        set((s) => ({
          conversations: [conv, ...s.conversations],
          activeId: id,
        }));
        return id;
      },
      appendMessage: (conversationId, message) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c,
          ),
        }));
      },
      removeConversation: (id) => {
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        }));
      },
      renameConversation: (id, title) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title } : c,
          ),
        }));
      },
      clearAll: () => set({ conversations: [], activeId: null }),
    }),
    { name: "reliquary-chat" },
  ),
);

export function newId(): string {
  return uid();
}
