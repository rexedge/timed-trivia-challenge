import { GameStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface GameHeaderProps {
  game: any;
  currentQuestion: any;
}

export function GameHeader({ game, currentQuestion }: GameHeaderProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Game #{game.id.slice(-6)}</h1>
            <p className="text-sm text-muted-foreground">
              Started {formatDistanceToNow(new Date(game.startTime))} ago
            </p>
          </div>
          <Badge
            variant={
              game.status === GameStatus.SCHEDULED
                ? "secondary"
                : game.status === GameStatus.IN_PROGRESS
                ? "default"
                : game.status === GameStatus.ENDED
                ? "outline"
                : "destructive"
            }
          >
            {game.status}
          </Badge>
        </div>
        {currentQuestion && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Question{" "}
              {game.gameQuestions.findIndex(
                (q) => q.id === currentQuestion.id
              ) + 1}{" "}
              of {game.gameQuestions.length}
            </p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: `${
                    ((game.gameQuestions.findIndex(
                      (q) => q.id === currentQuestion.id
                    ) +
                      1) /
                      game.gameQuestions.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
