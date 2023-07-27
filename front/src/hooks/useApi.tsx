// ApiContext.tsx
import { Message } from "../types/custom";

// API
export function useApi() {
  // system書き換え
  const updateSystemContent = (
    systemValue: string,
    messageHistory: Message[]
  ) => {
    const updatedData = messageHistory.map((item) => {
      if (item.role === "system") {
        return { ...item, content: systemValue };
      }
      return item;
    });

    return updatedData;
  };

  // API通信
  const fetchApiData = async (
    systemValue: string,
    messageHistory: Message[]
  ) => {
    let data = messageHistory;
    if (systemValue !== "") {
      data = updateSystemContent(systemValue, messageHistory);
    }
    console.log(data);
    let res = await fetch("/api", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify({
        messages: data,
      }),
    });
    return res.body!.getReader()!;
  };

  return { fetchApiData };
}
