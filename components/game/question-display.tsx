"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { pusherClient } from "@/lib/pusher";

interface QuestionDisplayProps {
  question: any; // Define proper type
  gameId: string;
  userId: string;
  answerTime: number;
}

export function QuestionDisplay({
  question,
  gameId,
  userId,
  answerTime,
}: QuestionDisplayProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(answerTime);

  useEffect(() => {
    // Reset state when question changes
    setSelectedAnswer(null);
    setIsSubmitting(false);
    setTimeRemaining(answerTime);

    // Subscribe to question timer updates
    const channel = pusherClient.subscribe(`game-${gameId}`);
    channel.bind("timer-update", (data: { timeRemaining: number }) => {
      setTimeRemaining(data.timeRemaining);
    });

    return () => {
      pusherClient.unsubscribe(`game-${gameId}`);
    };
  }, [question.id, gameId, answerTime]);

  const handleSubmit = async () => {
    if (!selectedAnswer || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/games/${gameId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          answer: selectedAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      {/* <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">{question.text}</h3>
        <QuestionTimer timeRemaining={timeRemaining} />
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {JSON.parse(question.options).map((option: string) => (
          <Button
            key={option}
            variant={selectedAnswer === option ? "default" : "outline"}
            className="p-4 h-auto text-left"
            onClick={() => setSelectedAnswer(option)}
            disabled={isSubmitting}
          >
            {option}
          </Button>
        ))}
      </div>

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={!selectedAnswer || isSubmitting}
      >
        Submit Answer
      </Button>
    </Card>
  );
}
