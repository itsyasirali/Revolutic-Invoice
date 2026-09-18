"use client";

import { useState } from "react";
import chatData from "@/data/landing/chatData";

const useHeroChatDemo = () => {
  const [activeChatId, setActiveChatId] = useState(chatData[0].id);
  const activeChat =
    chatData.find((c) => c.id === activeChatId) || chatData[0];

  return {
    chatData,
    activeChatId,
    activeChat,
    setActiveChatId,
  };
};

export default useHeroChatDemo;
