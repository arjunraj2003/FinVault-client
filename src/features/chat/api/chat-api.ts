// features/chat/api/chat-api.ts
import axiosInstance from "@/lib/axios";
import type { ChatRequest, ChatResponse } from "../types";

export class ChatApi {
  static sendMessage(data: ChatRequest) {
    return axiosInstance.post<ChatResponse>("/chat", data);
  }
}