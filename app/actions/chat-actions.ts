"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ChatMessage } from "@prisma/client";
import { revalidatePath } from "next/cache";

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

    await db.chatMessage.create({
      data: {
        content: data.content,
        senderId: session.user.id,
        senderName: session.user.name || "Unknown",
        senderImage: session.user.image || undefined,
        recipientId: data.recipientId,
        gameId: data.gameId,
      },
    });

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
        createdAt: "desc",
      },
      take: options.limit || 50,
    });

    return {
      success: true,
      messages: messages.reverse(),
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, message: "Failed to fetch messages" };
  }
}

export async function getChatRooms(): Promise<{
  success: boolean;
  rooms?: any[];
  message?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: "Not authenticated" };
    }

    // Get private chats
    const privateChats = await db.chatMessage.findMany({
      where: {
        OR: [{ senderId: session.user.id }, { recipientId: session.user.id }],
        NOT: {
          gameId: { not: null },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      distinct: ["senderId", "recipientId"],
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Get game chats
    const gameChats = await db.chatMessage.findMany({
      where: {
        OR: [{ senderId: session.user.id }, { gameId: { not: null } }],
      },
      orderBy: {
        createdAt: "desc",
      },
      distinct: ["gameId"],
      include: {
        game: true,
      },
    });

    // Process and combine the chats
    const rooms = [
      ...privateChats.map((chat) => ({
        id: `private-${
          chat.senderId === session.user.id ? chat.recipientId : chat.senderId
        }`,
        name:
          chat.senderId === session.user.id
            ? chat.recipient?.name
            : chat.sender?.name,
        image:
          chat.senderId === session.user.id
            ? chat.recipient?.image
            : chat.sender?.image,
        isPrivate: true,
        lastMessage: chat,
      })),
      ...gameChats.map((chat) => ({
        id: `game-${chat.gameId}`,
        name: `Game Chat - ${new Date(
          chat.game?.startTime || ""
        ).toLocaleDateString()}`,
        isPrivate: false,
        lastMessage: chat,
      })),
    ];

    return { success: true, rooms };
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return { success: false, message: "Failed to fetch chat rooms" };
  }
}
