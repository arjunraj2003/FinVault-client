// features/chat/pages/ChatPage.tsx
import { useRef, useEffect, useState, KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot, Send, Trash2, Sparkles, User, Loader2,
  TrendingUp, PiggyBank, BarChart3, IndianRupee, Tag, Calendar,
} from "lucide-react";
import { ChatMessage, ResultCard, ResultRow } from "./types";
import { useChat } from "./hooks/useChat";

const formatTime = (date: Date) =>
  new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const formatINR = (value: string) => {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR",
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(num);
};

const formatLabel = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatCellValue = (card: ResultCard): string => {
  if (card.isNumeric) return formatINR(card.value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(card.value)) {
    return new Date(card.value).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  }
  return card.value;
};

const SUGGESTED_PROMPTS = [
  { icon: TrendingUp, text: "What is my average expense this month?" },
  { icon: BarChart3,  text: "How much did I spend on food this month?" },
  { icon: PiggyBank,  text: "What is my total income this month?" },
  { icon: Sparkles,   text: "Which category did I spend the most on?" },
];

function ResultCards({ cards }: { cards: ResultCard[] }) {
  return (
    <div className={`mt-2 grid gap-2 ${cards.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted border border-border"
        >
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm flex-shrink-0">
            {card.isNumeric
              ? <IndianRupee className="h-3.5 w-3.5 text-primary-foreground" />
              : /date/i.test(card.label)
                ? <Calendar className="h-3.5 w-3.5 text-primary-foreground" />
                : <Tag className="h-3.5 w-3.5 text-primary-foreground" />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
              {formatLabel(card.label)}
            </p>
            <p className="text-sm font-bold text-foreground leading-tight capitalize truncate">
              {formatCellValue(card)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultTable({ rows }: { rows: ResultRow[] }) {
  if (!rows.length) return null;
  const headers = rows[0].cells.map((c) => c.label);

  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-border">
      {/* Table header */}
      <div
        className="grid gap-px bg-primary px-3 py-2"
        style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` }}
      >
        {headers.map((h) => (
          <span key={h} className="text-[10px] font-semibold text-primary-foreground uppercase tracking-wider truncate">
            {formatLabel(h)}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`grid gap-px px-3 py-2.5 ${
              i % 2 === 0
                ? "bg-card"
                : "bg-muted/50"
            }`}
            style={{ gridTemplateColumns: `repeat(${row.cells.length}, minmax(0, 1fr))` }}
          >
            {row.cells.map((cell) => (
              <span
                key={cell.label}
                className={`text-xs truncate capitalize ${
                  cell.isNumeric
                    ? "font-semibold text-primary"
                    : "text-foreground"
                }`}
              >
                {formatCellValue(cell)}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Row count footer */}
      <div className="px-3 py-1.5 bg-muted border-t border-border">
        <span className="text-[10px] text-muted-foreground">
          {rows.length} {rows.length === 1 ? "result" : "results"}
        </span>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} group`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
        isUser
          ? "bg-primary"
          : "bg-muted border border-border"
      }`}>
        {isUser ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-primary" />}
      </div>

      <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {isUser ? (
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm bg-primary text-primary-foreground"
            style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
          >
            {message.content}
          </div>
        ) : (
          <div className="w-full">
            {message.content && isReadableExplanation(message.content) && (
              <div
                className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-sm bg-card text-foreground border border-border"
                style={{ wordBreak: "break-word", whiteSpace: preWrapDisplay }}
              >
                {message.content}
              </div>
            )}

            {message.resultCards && message.resultCards.length > 0 && (
              <ResultCards cards={message.resultCards} />
            )}

            {message.resultRows && message.resultRows.length > 0 && (
              <ResultTable rows={message.resultRows} />
            )}

            {!isReadableExplanation(message.content) &&
              !message.resultCards?.length &&
              !message.resultRows?.length && (
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-sm bg-card text-muted-foreground border border-border italic">
                Results retrieved — no summary available.
              </div>
            )}
          </div>
        )}
        <span className="text-[10px] text-muted-foreground px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

const preWrapDisplay = "pre-wrap" as const;

function isReadableExplanation(text: string): boolean {
  if (!text || text.trim().length < 3) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const words = text.trim().split(/\s+/);
  return words.some(
    (w) => w.length > 3 && !uuidRegex.test(w) && isNaN(Number(w))
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted border border-border shadow-sm">
        <Bot className="h-4 w-4 text-primary" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-3xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">FinVault AI</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
              Your personal finance advisor
            </p>
          </div>
        </div>
        {!isEmpty && (
          <Button variant="ghost" size="sm" onClick={clearMessages}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-2xl">
                <Sparkles className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Hi! I'm your AI finance advisor
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Ask me anything about your finances — spending, budgets, income, and more.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {SUGGESTED_PROMPTS.map(({ icon: Icon, text }) => (
                <button key={text} onClick={() => sendMessage(text)}
                  className="flex items-center gap-2 px-3 py-3 text-left bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all duration-200 group">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-xs text-foreground leading-tight">{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isEmpty && (
          <div className="space-y-4 py-2">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
        {isEmpty && <div ref={bottomRef} />}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 mt-4">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-3 flex items-end gap-2 focus-within:border-primary transition-colors">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances..."
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 max-h-32 min-h-[36px] py-1.5 px-0 leading-relaxed"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="sm"
            className="h-9 w-9 p-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md disabled:opacity-50 flex-shrink-0 transition-all duration-200 hover:scale-105 active:scale-95">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}