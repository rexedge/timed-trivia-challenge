"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getGameStatus } from "@/app/actions/game-actions";

interface GameStatusDisplayProps {
  gameId: string;
  initialStatus: {
    totalQuestions: number;
    questionsAnswered: number;
    currentScore: number;
  };
}

export function GameStatusDisplay({
  gameId,
  initialStatus,
}: GameStatusDisplayProps) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const updateStatus = async () => {
      try {
        const result = await getGameStatus(gameId);
        if (result.success) {
          setStatus(result.data.currentStatus);
        }
      } catch (error) {
        console.error("Failed to update game status:", error);
      }
    };

    const interval = setInterval(updateStatus, 5000);
    return () => clearInterval(interval);
  }, [gameId]);

  const progressPercentage =
    (status.questionsAnswered / status.totalQuestions) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Questions Completed</span>
            <span>
              {status.questionsAnswered} / {status.totalQuestions}
            </span>
          </div>
          <Progress value={progressPercentage} />
        </div>
        <div className="text-sm">
          <span className="font-medium">Current Score: </span>
          {status.currentScore.toFixed(1)}
        </div>
      </CardContent>
    </Card>
  );
}
