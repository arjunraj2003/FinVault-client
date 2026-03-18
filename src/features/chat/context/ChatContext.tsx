// features/chat/context/ChatContext.tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { ChatApi } from "../api/chat-api";
import type { ChatMessage, ResultCard, ResultRow } from "../types";
import { useToast } from "@/hooks/use-toast";

const SKIP_KEYS = ["id", "userid", "accountid", "sql"];

function extractResultCards(row: Record<string, string>): ResultCard[] {
  return Object.entries(row)
    .filter(([key]) => !SKIP_KEYS.includes(key.toLowerCase()))
    .map(([label, value]) => ({
      label,
      value: value ?? "",
      isNumeric: !isNaN(Number(value)) && value.trim() !== "",
    }));
}

function extractResultRows(results: Record<string, string>[]): ResultRow[] {
  if (!results || results.length === 0) return [];
  const keys = Object.keys(results[0]).filter(
    (k) => !SKIP_KEYS.includes(k.toLowerCase())
  );
  return results.map((row) => ({
    cells: keys.map((key) => ({
      label: key,
      value: row[key] ?? "",
      isNumeric: !isNaN(Number(row[key])) && String(row[key]).trim() !== "",
    })),
  }));
}

interface ChatContextValue {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const { data: res } = await ChatApi.sendMessage({ question: content.trim() });
        const { explanation, results } = res.data;

        const isSingleRow = results && results.length === 1;
        const isMultiRow = results && results.length > 1;

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: explanation || "Here are your results.",
          timestamp: new Date(),
          resultCards: isSingleRow ? extractResultCards(results[0]) : undefined,
          resultRows: isMultiRow ? extractResultRows(results) : undefined,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error: any) {
        toast({
          title: error?.response?.data?.message || "Failed to send message",
          variant: "destructive",
        });
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, toast]
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return (
    <ChatContext.Provider value={{ messages, isLoading, sendMessage, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used inside <ChatProvider>");
  return ctx;
}