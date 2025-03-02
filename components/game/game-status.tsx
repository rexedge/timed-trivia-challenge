"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GameStatusProps {
  startTime: Date;
  endTime: Date;
  totalQuestions: number;
  questionsAnswered: number;
}

export function GameStatus({
  startTime,
  endTime,
  totalQuestions,
  questionsAnswered,
}: GameStatusProps) {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const total = endTime.getTime() - startTime.getTime();
      const elapsed = now.getTime() - startTime.getTime();
      const remaining = endTime.getTime() - now.getTime();

      // Calculate progress
      setProgress((elapsed / total) * 100);

      // Calculate time remaining
      if (remaining > 0) {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor(
          (remaining % (1000 * 60 * 60)) / (1000 * 60)
        );
        setTimeLeft(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeLeft("Game ended");
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [startTime, endTime]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{timeLeft}</span>
          </div>
          <Progress value={progress} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Questions Completed</span>
            <span>
              {questionsAnswered} / {totalQuestions}
            </span>
          </div>
          <Progress
            value={(questionsAnswered / totalQuestions) * 100}
            className="bg-muted"
          />
        </div>
      </CardContent>
    </Card>
  );
}
