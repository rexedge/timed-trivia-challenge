"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ChatMessage } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { pusherServer } from "@/lib/pusher";

export async function sendMessage(data: {
  content: string;
  recipientId?: string;
  gameId?: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: "Not authenticated" };
    }

    const message = await db.chatMessage.create({
      data: {
        content: data.content,
        senderId: session.user.id,
        senderName: session.user.name || "Unknown",
        senderImage: session.user.image || undefined,
        recipientId: data.recipientId,
        gameId: data.gameId,
      },
    });

    // Trigger real-time update
    if (data.gameId) {
      await pusherServer.trigger(`game-${data.gameId}`, "new-message", message);
    } else if (data.recipientId) {
      await pusherServer.trigger(
        `private-chat-${data.recipientId}`,
        "new-message",
        message
      );
      await pusherServer.trigger(
        `private-chat-${session.user.id}`,
        "new-message",
        message
      );
    }

    revalidatePath("/chat");
    if (data.gameId) revalidatePath(`/game/${data.gameId}`);

    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, message: "Failed to send message" };
  }
}

export async function getMessages(options: {
  recipientId?: string;
  gameId?: string;
  limit?: number;
  before?: Date;
}): Promise<{
  success: boolean;
  messages?: ChatMessage[];
  message?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: "Not authenticated" };
    }

    const messages = await db.chatMessage.findMany({
      where: {
        AND: [
          options.gameId
            ? { gameId: options.gameId }
            : {
                OR: [
                  {
                    senderId: session.user.id,
                    recipientId: options.recipientId,
                  },
                  {
                    senderId: options.recipientId,
                    recipientId: session.user.id,
                  },
                ],
              },
          options.before ? { createdAt: { lt: options.before } } : {},
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
      take: options.limit || 50,
    });

    return {
      success: true,
      messages,
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, message: "Failed to fetch messages" };
  }
}