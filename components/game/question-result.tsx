import { Question } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { CountdownTimer } from "@/components/game/countdown-timer";

interface QuestionResultProps {
  question: Question;
  selectedAnswer: string;
  isCorrect: boolean;
  score: number;
  timeToAnswer: number;
  nextQuestionTime: Date | null | undefined;
}

export function QuestionResult({
  question,
  selectedAnswer,
  isCorrect,
  score,
  timeToAnswer,
  nextQuestionTime,
}: QuestionResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Result</CardTitle>
        <CardDescription>Your answer has been submitted</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-xl font-semibold">{question.text}</h3>
        </div>
        <div className="space-y-4">
          <div className="rounded-md border p-4 bg-muted/50">
            <p className="font-medium">Your answer: {selectedAnswer}</p>
          </div>
          <div className="rounded-md border p-4 bg-primary/10">
            <p className="font-medium">
              Correct answer: {question.correctAnswer}
            </p>
          </div>
          <div
            className={`rounded-md border p-4 ${
              isCorrect
                ? "bg-green-100 dark:bg-green-900/20"
                : "bg-red-100 dark:bg-red-900/20"
            }`}
          >
            <p className="font-medium">
              {isCorrect ? "Correct! 🎉" : "Incorrect"}
            </p>
          </div>
          <div className="rounded-md border p-4">
            <p className="font-medium">Score: {score.toFixed(1)} points</p>
            <p className="text-sm text-muted-foreground">
              Time to answer: {formatDuration(timeToAnswer)}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {nextQuestionTime ? (
          <div className="w-full">
            <p className="mb-2">
              Next question at: {formatDateTime(nextQuestionTime)}
            </p>
            <CountdownTimer targetDate={nextQuestionTime} />
          </div>
        ) : (
          <p>No more questions scheduled for this game</p>
        )}
      </CardFooter>
    </Card>
  );
}
