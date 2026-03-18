// features/chat/types/index.ts

export interface ResultCard {
  label: string;
  value: string;
  isNumeric: boolean;
}

export interface ResultRow {
  cells: ResultCard[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  resultCards?: ResultCard[];  // single row result
  resultRows?: ResultRow[];    // multi row result
  explanation?: string;
}

export interface ChatRequest {
  question: string;
}

export interface ChatResponseData {
  question: string;
  sql: string;
  results: Record<string, string>[];
  explanation: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data: ChatResponseData;
}