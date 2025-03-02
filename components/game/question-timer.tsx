"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface QuestionTimerProps {
  startTime: Date;
  duration: number;
  onTimeUp: () => void;
}

export function QuestionTimer({
  startTime,
  duration,
  onTimeUp,
}: QuestionTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const start = new Date(startTime);
      const elapsed = (now.getTime() - start.getTime()) / 1000;
      const remaining = Math.max(0, duration - elapsed);

      setTimeLeft(remaining);
      setProgress((remaining / duration) * 100);

      if (remaining <= 0) {
        onTimeUp();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [startTime, duration, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Time Remaining</span>
        <span>{formatTime(timeLeft)}</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
