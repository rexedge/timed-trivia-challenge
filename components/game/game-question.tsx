"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { ExtendedGameQuestion } from "@/lib/types/game";
import { QuestionTimer } from "./question-timer";

interface GameQuestionProps {
  question: ExtendedGameQuestion;
  gameId: string;
  userId: string;
  answerTime: number;
  hasAnswered: boolean;
  isParticipant: boolean;
}

export function GameQuestion({
  question,
  gameId,
  userId,
  answerTime,
  hasAnswered,
  isParticipant,
}: GameQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(new Date()); // Track when question was first shown

  useEffect(() => {
    // Reset state when question changes
    setSelectedAnswer(null);
    setIsSubmitting(false);
  }, [question.id]);

  const handleSubmit = async () => {
    if (!selectedAnswer || isSubmitting || !isParticipant) return;

    setIsSubmitting(true);
    try {
      const timeToAnswer = (new Date().getTime() - startTime.getTime()) / 1000;

      const response = await fetch(`/api/games/${gameId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          answer: selectedAnswer,
          timeToAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }

      const data = await response.json();
      if (data.isCorrect) {
        toast.success("Correct answer!");
      } else {
        toast.error("Incorrect answer");
      }
    } catch (error) {
      toast.error("Failed to submit answer");
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Question</CardTitle>
        <QuestionTimer
          duration={answerTime}
          questionId={question.id}
          gameId={gameId}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg">{question.question.text}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {JSON.parse(question.question.options).map((option: string) => (
            <Button
              key={option}
              variant={selectedAnswer === option ? "default" : "outline"}
              className="p-4 h-auto text-left"
              onClick={() => !hasAnswered && setSelectedAnswer(option)}
              disabled={hasAnswered || isSubmitting || !isParticipant}
            >
              {option}
            </Button>
          ))}
        </div>

        {isParticipant && (
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!selectedAnswer || hasAnswered || isSubmitting}
          >
            {isSubmitting
              ? "Submitting..."
              : hasAnswered
              ? "Answered"
              : "Submit Answer"}
          </Button>
        )}

        {!isParticipant && (
          <p className="text-center text-muted-foreground">
            You must join the game to participate
          </p>
        )}
      </CardContent>
    </Card>
  );
}
