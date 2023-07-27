// DataContext.tsx
import React from "react";

export const DataContext = React.createContext({
  names: ["Me", "Taro", "Hanako", "Tsuyoshi"],
  topics: {} as { [key: string]: string },
  dataset: {} as { [key: string]: { topic: string } },
  setNames: (names: string[]) => {},
  setTopics: (topics: { [key: string]: string }) => {},
  setDataset: (dataset: { [key: string]: { topic: string } }) => {},
});
