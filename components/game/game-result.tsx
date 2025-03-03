"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";
import { pusherClient } from "@/lib/pusher";

interface GameResultProps {
  gameId: string;
  userId: string;
  resultTime: number;
}

export function GameResult({ gameId, userId, resultTime }: GameResultProps) {
  const [timeRemaining, setTimeRemaining] = useState(resultTime);
  const [lastAnswer, setLastAnswer] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    yourAnswer: string;
    points: number;
  } | null>(null);

  useEffect(() => {
    const fetchLastAnswer = async () => {
      try {
        const response = await fetch(
          `/api/games/${gameId}/last-answer?userId=${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          setLastAnswer(data);
        }
      } catch (error) {
        console.error("Failed to fetch last answer:", error);
      }
    };

    fetchLastAnswer();

    const channel = pusherClient.subscribe(`game-${gameId}`);
    channel.bind("timer-update", (data: { timeRemaining: number }) => {
      setTimeRemaining(data.timeRemaining);
    });

    return () => {
      pusherClient.unsubscribe(`game-${gameId}`);
    };
  }, [gameId, userId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Result</CardTitle>
        <div className="w-24 space-y-1">
          <Progress value={(timeRemaining / resultTime) * 100} />
          <p className="text-xs text-center text-muted-foreground">
            {Math.ceil(timeRemaining)}s
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {lastAnswer ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              {lastAnswer.isCorrect ? (
                <div className="flex items-center gap-2 text-green-500">
                  <Check className="h-8 w-8" />
                  <span className="text-2xl font-bold">Correct!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-500">
                  <X className="h-8 w-8" />
                  <span className="text-2xl font-bold">Incorrect</span>
                </div>
              )}
            </div>

            <div className="grid gap-2 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Your Answer</p>
                <p className="font-medium">{lastAnswer.yourAnswer}</p>
              </div>
              {!lastAnswer.isCorrect && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Correct Answer
                  </p>
                  <p className="font-medium">{lastAnswer.correctAnswer}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Points Earned</p>
                <p className="text-2xl font-bold">{lastAnswer.points}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            No answer submitted
          </div>
        )}
      </CardContent>
    </Card>
  );
}
