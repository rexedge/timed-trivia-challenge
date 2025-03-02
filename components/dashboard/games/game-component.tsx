"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Game, GameQuestion, Question, Response } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { submitAnswer } from "@/app/actions/game-actions";
import { toast } from "sonner";

interface GameComponentProps {
  game: Game;
  gameQuestions: (GameQuestion & {
    question: Question;
  })[];
  existingResponses: Response[];
  userId: string;
}

export function GameComponent({
  game,
  gameQuestions,
  existingResponses,
  userId,
}: GameComponentProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [phase, setPhase] = useState<"question" | "result" | "leaderboard">(
    "question"
  );
  const [answeredTime, setAnsweredTime] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedStartTime =
        Number(localStorage.getItem("startTime")) || Date.now();
      setStartTime(storedStartTime);
    }
  }, []);

  const currentGameQuestion = gameQuestions[currentQuestionIndex];
  const currentQuestion = currentGameQuestion?.question;
  const options = currentQuestion
    ? JSON.parse(currentQuestion.options as string)
    : [];

  useEffect(() => {
    if (!currentGameQuestion || startTime === null) return;

    const phaseDurations = {
      question: 5 * 60 * 1000, // 5 minutes
      result: 5 * 60 * 1000, // 5 minutes
      leaderboard: 5 * 60 * 1000, // 5 minutes
    };

    const switchPhase = (nextPhase: "question" | "result" | "leaderboard") => {
      setPhase(nextPhase);
      const newStartTime = Date.now();
      setStartTime(newStartTime);
      if (typeof window !== "undefined") {
        localStorage.setItem("startTime", String(newStartTime));
      }
    };

    const timer = setInterval(() => {
      const storedStartTime = startTime ?? Date.now();
      const elapsed = Date.now() - storedStartTime;
      setTimeRemaining(Math.max(0, phaseDurations[phase] - elapsed));

      if (elapsed >= phaseDurations[phase]) {
        if (phase === "question") {
          switchPhase("result");
        } else if (phase === "result") {
          switchPhase("leaderboard");
        } else if (phase === "leaderboard") {
          if (currentQuestionIndex < gameQuestions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedAnswer("");
            setAnsweredTime(null);
            switchPhase("question");
          } else {
            clearInterval(timer);
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, currentQuestionIndex, gameQuestions.length, startTime]);

  const handleSubmit = async () => {
    if (!currentQuestion || !selectedAnswer || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const timeTaken = Date.now() - (startTime ?? Date.now());
      setAnsweredTime(timeTaken);

      const result = await submitAnswer({
        gameId: game.id,
        questionId: currentQuestion.id,
        answer: selectedAnswer,
      });

      if (!result.success) {
        toast.error("Error", {
          description: result.message || "Failed to submit answer",
        });
        return;
      }

      toast.success("Success", {
        description: "Answer submitted successfully",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to submit answer",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Ended</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The game has ended. Check your results on the leaderboard.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Phase: {phase.toUpperCase()}</span>
          <span className="text-muted-foreground">
            Time Remaining: {Math.floor(timeRemaining / 1000)}s
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {phase === "question" && !answeredTime && (
          <>
            <div className="text-lg font-medium">{currentQuestion.text}</div>
            <RadioGroup
              value={selectedAnswer}
              onValueChange={setSelectedAnswer}
              className="space-y-3"
            >
              {options.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </>
        )}
        {phase === "result" && answeredTime !== null && (
          <p>
            Your answer: {selectedAnswer} (Time taken:{" "}
            {Math.floor(answeredTime / 1000)}s)
          </p>
        )}
        {phase === "leaderboard" && <p>Displaying leaderboard...</p>}
      </CardContent>
      {phase === "question" && !answeredTime && (
        <CardFooter>
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Answer"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
