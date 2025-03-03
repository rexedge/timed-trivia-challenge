"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { pusherClient } from "@/lib/pusher";

interface QuestionTimerProps {
  duration: number;
  questionId: string;
  gameId: string;
}

export function QuestionTimer({
  duration,
  questionId,
  gameId,
}: QuestionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);

  useEffect(() => {
    setTimeRemaining(duration);

    const channel = pusherClient.subscribe(`game-${gameId}`);
    channel.bind("timer-update", (data: { timeRemaining: number }) => {
      setTimeRemaining(data.timeRemaining);
    });

    return () => {
      pusherClient.unsubscribe(`game-${gameId}`);
    };
  }, [duration, gameId, questionId]);

  return (
    <div className="w-24 space-y-1">
      <Progress value={(timeRemaining / duration) * 100} />
      <p className="text-xs text-center text-muted-foreground">
        {Math.ceil(timeRemaining)}s
      </p>
    </div>
  );
}
