"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExtendedGame } from "@/lib/types/game";

interface GameStatsProps {
  game: ExtendedGame;
  userId: string;
}

export function GameStats({ game, userId }: GameStatsProps) {
  const userResponses = game.responses.filter((r) => r.userId === userId);
  const correctAnswers = userResponses.filter((r) => r.score > 0).length;
  const averageTime =
    userResponses.length > 0
      ? userResponses.reduce((acc, r) => acc + r.timeToAnswer, 0) /
        userResponses.length
      : 0;

  const userRank = game.participants.findIndex((p) => p.userId === userId) + 1;
  const totalParticipants = game.participants.length;
  const userScore =
    game.participants.find((p) => p.userId === userId)?.score || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Performance</CardTitle>
        <CardDescription>Game statistics and rankings</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div className="grid grid-cols-2 gap-1">
            <dt className="text-sm text-muted-foreground">Rank</dt>
            <dd className="text-2xl font-bold text-right">
              {userRank}/{totalParticipants}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <dt className="text-sm text-muted-foreground">Score</dt>
            <dd className="text-2xl font-bold text-right">
              {userScore.toFixed(0)}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <dt className="text-sm text-muted-foreground">Correct Answers</dt>
            <dd className="text-2xl font-bold text-right">
              {correctAnswers}/{game.gameQuestions.length}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <dt className="text-sm text-muted-foreground">
              Avg. Response Time
            </dt>
            <dd className="text-2xl font-bold text-right">
              {averageTime.toFixed(1)}s
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <dt className="text-sm text-muted-foreground">
              Questions Answered
            </dt>
            <dd className="text-2xl font-bold text-right">
              {userResponses.length}/{game.gameQuestions.length}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
