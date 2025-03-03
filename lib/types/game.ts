import type {
  Game,
  GameQuestion,
  Question,
  GameParticipant,
  Response,
  ChatMessage,
  User,
} from "@prisma/client";

export interface ExtendedGameQuestion extends GameQuestion {
  question: Question;
}

export interface ExtendedParticipant extends GameParticipant {
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface ExtendedGame extends Game {
  gameQuestions: ExtendedGameQuestion[];
  participants: ExtendedParticipant[];
  responses: (Response & {
    gameQuestion: GameQuestion;
  })[];
  messages: (ChatMessage & {
    sender: Pick<User, "id" | "name" | "image">;
  })[];
}

export interface GameEvents {
  "game-update": Partial<ExtendedGame>;
  "question-update": { question: ExtendedGameQuestion };
  "leaderboard-update": { participants: ExtendedParticipant[] };
  "new-message": ChatMessage & { sender: Pick<User, "id" | "name" | "image"> };
  "timer-update": { timeRemaining: number };
}
