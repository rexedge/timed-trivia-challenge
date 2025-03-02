"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getMessages, sendMessage } from "@/app/actions/chat-actions";
import { ChatMessage } from "@prisma/client";

interface ChatWindowProps {
  chatId: string;
  currentUserId: string;
}

export function ChatWindow({ chatId, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [recipientId, gameId] = chatId.split("-");

  useEffect(() => {
    const fetchMessages = async () => {
      const result = await getMessages({
        recipientId: recipientId === "private" ? gameId : undefined,
        gameId: recipientId === "game" ? gameId : undefined,
      });

      if (result.success && result.messages) {
        setMessages(result.messages);
        // Scroll to bottom on new messages
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, [chatId, recipientId, gameId]);

  const handleSend = async () => {
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await sendMessage({
        content: newMessage,
        recipientId: recipientId === "private" ? gameId : undefined,
        gameId: recipientId === "game" ? gameId : undefined,
      });

      if (!result.success) {
        toast.error(result.message || "Failed to send message");
        return;
      }

      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>
          {recipientId === "game" ? "Game Chat" : "Private Chat"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea ref={scrollRef} className="h-[440px] p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.senderId === currentUserId ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.senderImage!} />
                  <AvatarFallback>
                    {message.senderName?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex flex-col ${
                    message.senderId === currentUserId ? "items-end" : ""
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      message.senderId === currentUserId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex w-full gap-2"
        >
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 min-h-[40px] max-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !newMessage.trim()}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
