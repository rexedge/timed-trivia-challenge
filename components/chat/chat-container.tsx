"use client";

import { useState } from "react";
import { ChatList } from "./chat-list";
import { ChatWindow } from "./chat-window";

interface ChatContainerProps {
  currentUserId: string;
}

export function ChatContainer({ currentUserId }: ChatContainerProps) {
  const [selectedChatId, setSelectedChatId] = useState<string>();

  return (
    <div className="grid gap-6 md:grid-cols-[350px,1fr]">
      <ChatList
        onSelectChat={setSelectedChatId}
        selectedChatId={selectedChatId}
      />
      {selectedChatId ? (
        <ChatWindow chatId={selectedChatId} currentUserId={currentUserId} />
      ) : (
        <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg">
          <p className="text-muted-foreground">
            Select a chat to start messaging
          </p>
        </div>
      )}
    </div>
  );
}
