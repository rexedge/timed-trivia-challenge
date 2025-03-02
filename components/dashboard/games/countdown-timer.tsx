"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CountdownTimerProps {
  endTime: Date;
  onComplete: () => void;
  className?: string;
}

export function CountdownTimer({
  endTime,
  onComplete,
  className,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(endTime);
      const remaining = Math.max(0, end.getTime() - now.getTime());
      return remaining;
    };

    const updateTimer = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      // Calculate progress based on initial duration
      const initial = endTime.getTime() - new Date().getTime();
      setProgress((remaining / initial) * 100);

      if (remaining <= 0) {
        clearInterval(interval);
        onComplete();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, onComplete]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor(ms / 1000 / 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Time Remaining</span>
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
          <Progress value={progress} />
        </div>
      </CardContent>
    </Card>
  );
}
