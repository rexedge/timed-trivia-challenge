"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { pusherClient } from "@/lib/pusher";
import { getMessages, sendMessage } from "@/app/actions/chat-actions";
import type { ChatMessage } from "@prisma/client";

interface PrivateChatProps {
  recipientId: string;
  recipientName: string;
  recipientImage?: string | null;
}

export function PrivateChat({
  recipientId,
  recipientName,
  recipientImage,
}: PrivateChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const result = await getMessages({
        recipientId,
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

    // Subscribe to private chat updates
    const channel = pusherClient.subscribe(`private-chat-${recipientId}`);

    channel.bind("new-message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });

    return () => {
      pusherClient.unsubscribe(`private-chat-${recipientId}`);
    };
  }, [recipientId]);

  const handleSend = async () => {
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await sendMessage({
        content: newMessage,
        recipientId,
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
    <div className="flex flex-col h-[500px]">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.recipientId === recipientId ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={String(
                    message?.recipientId === recipientId
                      ? message?.senderImage
                      : recipientImage || ""
                  )}
                />
                <AvatarFallback>
                  {(message.recipientId === recipientId
                    ? message.senderName
                    : recipientName
                  )
                    ?.slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col ${
                  message.recipientId === recipientId ? "items-end" : ""
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg ${
                    message.recipientId === recipientId
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
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${recipientName}...`}
            className="min-h-[40px] max-h-[120px]"
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
      </div>
    </div>
  );
}
