"use client";

import { useEffect, useState } from "react";
import { getChatRooms } from "@/app/actions/chat-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string;
}

export function ChatList({ onSelectChat, selectedChatId }: ChatListProps) {
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const result = await getChatRooms();
      if (result.success && result.rooms) {
        setRooms(result.rooms);
      }
    };

    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle>Chats</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[520px]">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={cn(
                "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted transition-colors",
                selectedChatId === room.id && "bg-muted"
              )}
              onClick={() => onSelectChat(room.id)}
            >
              {room.isPrivate ? (
                <Avatar>
                  <AvatarImage src={room.image} />
                  <AvatarFallback>
                    {room.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-lg">G</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{room.name}</p>
                {room.lastMessage && (
                  <p className="text-sm text-muted-foreground truncate">
                    {room.lastMessage.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
