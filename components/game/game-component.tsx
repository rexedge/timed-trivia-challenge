"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GameQuestion, Question } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { submitAnswer } from "@/app/actions/game-actions";
import { formatDateTime } from "@/lib/utils";
import { CountdownTimer } from "@/components/game/countdown-timer";
import { QuestionResult } from "@/components/game/question-result";

interface GameComponentProps {
  gameId: string;
  currentQuestion: (GameQuestion & { question: Question }) | null;
  nextQuestionTime: Date | null | undefined;
  userId: string;
}

export function GameComponent({
  gameId,
  currentQuestion,
  nextQuestionTime,
  userId,
}: GameComponentProps) {
  const router = useRouter();
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    score: number;
    timeToAnswer: number;
  } | null>(null);
  const [startTime, setStartTime] = useState<Date>(new Date());

  // Reset state when question changes
  useEffect(() => {
    if (currentQuestion) {
      setSelectedAnswer("");
      setResult(null);
      setStartTime(new Date());
    }
  }, [currentQuestion]);

  // Auto-refresh the page when the next question is due
  useEffect(() => {
    if (nextQuestionTime) {
      const timeUntilNextQuestion =
        new Date(nextQuestionTime).getTime() - Date.now();

      if (timeUntilNextQuestion > 0) {
        const timerId = setTimeout(() => {
          router.refresh();
        }, timeUntilNextQuestion + 1000); // Add 1 second buffer

        return () => clearTimeout(timerId);
      }
    }
  }, [nextQuestionTime, router]);

  if (!currentQuestion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Waiting for Next Question</CardTitle>
          <CardDescription>The next question will appear soon</CardDescription>
        </CardHeader>
        <CardContent>
          {nextQuestionTime ? (
            <div className="py-6 text-center">
              <p className="mb-4 text-lg">Next question at:</p>
              <p className="text-2xl font-bold">
                {formatDateTime(nextQuestionTime)}
              </p>
              <div className="mt-4">
                <CountdownTimer
                  targetDate={nextQuestionTime}
                  onComplete={() => router.refresh()}
                />
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              No more questions scheduled for this game
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async () => {
    if (!selectedAnswer || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const endTime = new Date();
      const timeToAnswer = (endTime.getTime() - startTime.getTime()) / 1000; // in seconds

      const response = await submitAnswer({
        userId,
        gameId,
        questionId: currentQuestion.questionId,
        answer: selectedAnswer,
        timeToAnswer,
      });

      setResult(response);
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parse options from JSON string
  const options = JSON.parse(
    currentQuestion.question.options as string
  ) as string[];

  if (result) {
    return (
      <QuestionResult
        question={currentQuestion.question}
        selectedAnswer={selectedAnswer}
        isCorrect={result.isCorrect}
        score={result.score}
        timeToAnswer={result.timeToAnswer}
        nextQuestionTime={nextQuestionTime}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question</CardTitle>
        <CardDescription>Select the correct answer</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-xl font-semibold">
            {currentQuestion.question.text}
          </h3>
        </div>
        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          className="space-y-3"
        >
          {options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 rounded-md border p-4 ${
                selectedAnswer === option ? "border-primary bg-primary/10" : ""
              }`}
            >
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label
                htmlFor={`option-${index}`}
                className="flex-1 cursor-pointer"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <CountdownTimer
            targetDate={
              new Date(currentQuestion.displayTime.getTime() + 5 * 60 * 1000)
            }
            onComplete={() => router.refresh()}
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Answer"}
        </Button>
      </CardFooter>
    </Card>
  );
}
