import { Game } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, formatTime } from "@/lib/utils";

interface GameStatusProps {
  currentGame: Game | null;
}

export function GameStatus({ currentGame }: GameStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Status</CardTitle>
        <CardDescription>Current game information and schedule</CardDescription>
      </CardHeader>
      <CardContent>
        {currentGame ? (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Status:</span>
              <span className="text-sm">{currentGame.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Start Time:</span>
              <span className="text-sm">
                {formatTime(currentGame.startTime)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">End Time:</span>
              <span className="text-sm">{formatTime(currentGame.endTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Date:</span>
              <span className="text-sm">
                {formatDate(currentGame.startTime)}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            No active game at the moment
          </div>
        )}
      </CardContent>
    </Card>
  );
}
