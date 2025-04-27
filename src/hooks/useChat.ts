// src/hooks/useChat.ts
import { useState } from "react";
import { streamAnswer } from "../services/ai";
import type { FileNode } from "../services/github";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading,  setLoading]  = useState(false);

  async function ask(repo: string, tree: FileNode[], question: string) {
    if (!question.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: question,
    };
    const assistantMsg: ChatMessage = {
      id: `${userMsg.id}-assistant`,
      role: "assistant",
      text: "",
    };

    setMessages(m => [...m, userMsg, assistantMsg]);
    setLoading(true);

    try {
      for await (const token of streamAnswer(repo, tree, question)) {
        setMessages(m =>
          m.map(msg =>
            msg.id === assistantMsg.id
              ? { ...msg, text: msg.text + token }
              : msg
          )
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return { messages, loading, ask };
}
