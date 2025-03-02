interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  recipientId?: string; // for private messages
  createdAt: Date;
  gameId?: string; // for game-specific chats
}

interface ChatRoom {
  id: string;
  name?: string;
  isPrivate: boolean;
  participantIds: string[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
}
