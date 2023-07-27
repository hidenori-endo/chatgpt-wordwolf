// ApiContext.tsx
import { useState } from "react";
import { Message } from "../types/custom";

// API
export function useMessageHistory(systemValue: string) {
  const [messageHistory, setMessageHistory] = useState<Message[]>([
    { role: "system", content: systemValue },
  ]);

  async function appendHistory(role: "assistant" | "user", message: string) {
    setMessageHistory((prev) => [...prev, { role, content: message }]);
  }

  return { messageHistory, appendHistory };
}
