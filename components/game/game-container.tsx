"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GameStatus } from "@prisma/client";
import { toast } from "sonner";
import { QuestionDisplay } from "./question-display";
import { ResultDisplay } from "./result-display";
import { Leaderboard } from "./leaderboard";
import { submitAnswer, getGameStatus } from "@/app/actions/game-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameStatusDisplay } from "../dashboard/games/game-status";
import { CountdownTimer } from "../dashboard/games/countdown-timer";
import { GameEndDisplay } from "./game-end-display";

enum GamePhase {
  QUESTION = "question",
  RESULT = "result",
  LEADERBOARD = "leaderboard",
}

interface GameContainerProps {
  gameId: string;
  userId: string;
  initialGameData: {
    game: any;
    currentStatus: {
      totalQuestions: number;
      questionsAnswered: number;
      currentScore: number;
    };
    leaderboard: Array<{
      rank: number;
      userId: string;
      userName: string;
      userImage: string;
      score: number;
    }>;
  };
}

export function GameContainer({
  gameId,
  userId,
  initialGameData,
}: GameContainerProps) {
  const router = useRouter();
  const [gameData, setGameData] = useState(initialGameData);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<
    number | null
  >(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.QUESTION);
  const [result, setResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phaseEndTime, setPhaseEndTime] = useState<Date | null>(null);
  const [showEndDisplay, setShowEndDisplay] = useState(false);

  // Calculate phase end times
  const calculatePhaseEndTime = (
    phase: GamePhase,
    questionDisplayTime: Date
  ) => {
    const now = new Date();
    const game = gameData.game;

    switch (phase) {
      case GamePhase.QUESTION:
        return new Date(questionDisplayTime.getTime() + game.answerTime * 1000);
      case GamePhase.RESULT:
        return new Date(now.getTime() + game.resultTime * 1000);
      case GamePhase.LEADERBOARD: {
        const currentQuestion =
          gameData.game.gameQuestions[currentQuestionIndex!];
        const nextQuestionIndex = currentQuestionIndex! + 1;

        if (nextQuestionIndex < gameData.game.gameQuestions.length) {
          return new Date(
            gameData.game.gameQuestions[nextQuestionIndex].displayTime
          );
        }
        return new Date(gameData.game.endTime);
      }
      default:
        return null;
    }
  };

  // Initialize game state
  const initializeGameState = (questions: any[]) => {
    const now = new Date();
    let currentIndex = -1;
    let currentPhase = GamePhase.QUESTION;
    let phaseEnd: Date | null = null;

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const displayTime = new Date(question.displayTime);
      const nextDisplayTime =
        i < questions.length - 1
          ? new Date(questions[i + 1].displayTime)
          : new Date(gameData.game.endTime);

      if (now >= displayTime && now < nextDisplayTime) {
        currentIndex = i;

        const isAnswered = question.responses?.some(
          (r: any) => r.userId === userId
        );
        const questionEndTime = new Date(
          displayTime.getTime() + gameData.game.answerTime * 1000
        );
        const timeSinceStart = now.getTime() - displayTime.getTime();
        const timeUntilNext = nextDisplayTime.getTime() - now.getTime();

        if (isAnswered) {
          const answerTime = new Date(
            question.responses.find((r: any) => r.userId === userId).answeredAt
          );
          const timeSinceAnswer = now.getTime() - answerTime.getTime();

          if (timeSinceAnswer < gameData.game.resultTime * 1000) {
            currentPhase = GamePhase.RESULT;
            phaseEnd = new Date(
              answerTime.getTime() + gameData.game.resultTime * 1000
            );
            // Set result...
          } else {
            currentPhase = GamePhase.LEADERBOARD;
            phaseEnd = nextDisplayTime;
          }
        } else if (now > questionEndTime) {
          currentPhase = GamePhase.RESULT;
          phaseEnd = new Date(
            now.getTime() +
              Math.min(gameData.game.resultTime * 1000, timeUntilNext)
          );
          // Set result...
        } else {
          currentPhase = GamePhase.QUESTION;
          phaseEnd = questionEndTime;
        }
        break;
      }
    }

    return { currentIndex, currentPhase, phaseEnd };
  };

  // Initialize on mount and handle updates
  useEffect(() => {
    const initializeAndUpdate = async () => {
      try {
        const result = await getGameStatus(gameId);
        if (result.success) {
          setGameData(result.data);
          if (result.data.game.status === GameStatus.COMPLETED) {
            setShowEndDisplay(true);
          }

          const { currentIndex, currentPhase, phaseEnd } = initializeGameState(
            result.data.game.gameQuestions
          );

          if (currentIndex !== -1) {
            setCurrentQuestionIndex(currentIndex);
            setGamePhase(currentPhase);
            setPhaseEndTime(phaseEnd);
          }

          // Check if game is completed
          if (result.data.game.status === GameStatus.COMPLETED) {
            router.push("/dashboard");
          }
        }
      } catch (error) {
        console.error("Failed to update game status:", error);
        toast.error("Failed to update game status");
      }
    };

    initializeAndUpdate();
    const interval = setInterval(initializeAndUpdate, 5000);
    return () => clearInterval(interval);
  }, [gameId, router]);

  const handleSubmit = async (answer: string) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const currentQuestion =
        gameData.game.gameQuestions[currentQuestionIndex!];

      const result = await submitAnswer({
        gameId,
        questionId: currentQuestion.question.id,
        answer,
      });

      if (!result.success) {
        toast.error(result.message || "Failed to submit answer");
        return;
      }

      const { isCorrect, score, speedBonus } = result.data;

      setResult({
        isCorrect,
        answer,
        correctAnswer: currentQuestion.question.correctAnswer,
        score,
        speedBonus,
      });
      setGamePhase(GamePhase.RESULT);
      setPhaseEndTime(calculatePhaseEndTime(GamePhase.RESULT, new Date()));

      toast.success("Answer submitted successfully");

      // Update game status immediately after submission
      const statusResult = await getGameStatus(gameId);
      if (statusResult.success) {
        setGameData(statusResult.data);
      }
    } catch (error) {
      toast.error("Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = async () => {
    const currentQuestion = gameData.game.gameQuestions[currentQuestionIndex!];
    setResult({
      isCorrect: false,
      answer: "No answer",
      correctAnswer: currentQuestion.question.correctAnswer,
      score: 0,
      speedBonus: 0,
    });
    setGamePhase(GamePhase.RESULT);
    setPhaseEndTime(calculatePhaseEndTime(GamePhase.RESULT, new Date()));

    // Update game status when time is up
    const result = await getGameStatus(gameId);
    if (result.success) {
      setGameData(result.data);
    }
  };

  const handlePhaseComplete = () => {
    if (!currentQuestionIndex) return;

    const currentQuestion = gameData.game.gameQuestions[currentQuestionIndex];

    switch (gamePhase) {
      case GamePhase.RESULT:
        setGamePhase(GamePhase.LEADERBOARD);
        setPhaseEndTime(
          calculatePhaseEndTime(
            GamePhase.LEADERBOARD,
            new Date(currentQuestion.displayTime)
          )
        );
        break;
      case GamePhase.LEADERBOARD:
        // The main useEffect will handle transitioning to the next question
        break;
    }
  };

  const isQuestionAnswered = (questionId: string) => {
    return gameData.game.responses.some(
      (response: any) =>
        response.questionId === questionId && response.userId === userId
    );
  };

  if (currentQuestionIndex === null) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Loading game...</h2>
      </div>
    );
  }

  const currentQuestion = gameData.game.gameQuestions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Game Completed</h2>
        <p className="text-muted-foreground mb-4">
          Thank you for participating! Check the leaderboard for final results.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (showEndDisplay) {
    return (
      <GameEndDisplay
        gameId={gameId}
        leaderboard={gameData.leaderboard}
        currentUserId={userId}
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
      <div className="space-y-6">
        <GameStatusDisplay
          gameId={gameId}
          initialStatus={gameData.currentStatus}
        />

        {phaseEndTime && (
          <CountdownTimer
            endTime={phaseEndTime}
            onComplete={handlePhaseComplete}
          />
        )}

        {gamePhase === GamePhase.QUESTION && (
          <QuestionDisplay
            question={currentQuestion.question}
            displayTime={new Date(currentQuestion.displayTime)}
            duration={currentQuestion.duration}
            onSubmit={handleSubmit}
            onTimeUp={handleTimeUp}
            disabled={isQuestionAnswered(currentQuestion.question.id)}
          />
        )}

        {gamePhase === GamePhase.RESULT && result && (
          <ResultDisplay {...result} />
        )}

        {gamePhase === GamePhase.LEADERBOARD && (
          <Card>
            <CardHeader>
              <CardTitle>Waiting for Next Question</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The next question will be available soon. Check the leaderboard
                to see your current ranking!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Leaderboard
          gameId={gameId}
          currentUserId={userId}
          initialEntries={gameData.leaderboard}
        />
      </div>
    </div>
  );
}
