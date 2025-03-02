import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

interface ResultDisplayProps {
  isCorrect: boolean;
  answer: string;
  correctAnswer: string;
  score: number;
  speedBonus: number;
}

export function ResultDisplay({
  isCorrect,
  answer,
  correctAnswer,
  score,
  speedBonus,
}: ResultDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isCorrect ? (
            <>
              <CheckCircle2 className="text-green-500" />
              <span>Correct!</span>
            </>
          ) : (
            <>
              <XCircle className="text-red-500" />
              <span>Incorrect</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Your answer:</p>
          <p className="font-medium">{answer}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Correct answer:</p>
          <p className="font-medium">{correctAnswer}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Score breakdown:</p>
          <div className="space-y-1">
            <p>Base score: {isCorrect ? 10 : 0}</p>
            <p>Speed bonus: +{speedBonus.toFixed(1)}</p>
            <p className="font-bold">Total: {score.toFixed(1)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
