"use client";

import { Game } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/utils";

interface GamesListProps {
  currentGame: Game | null;
  upcomingGames: Game[];
  pastGames: (Game & {
    responses: { score: number }[];
    _count: {
      gameQuestions: number;
      responses: number;
    };
  })[];
  userId: string;
}

export function GamesList({
  currentGame,
  upcomingGames,
  pastGames,
  userId,
}: GamesListProps) {
  return (
    <Tabs defaultValue="current" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="current">Current</TabsTrigger>
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="past">Past</TabsTrigger>
      </TabsList>

      <TabsContent value="current">
        <Card>
          <CardHeader>
            <CardTitle>Current Game</CardTitle>
            <CardDescription>Active game session</CardDescription>
          </CardHeader>
          <CardContent>
            {currentGame ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Game Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(currentGame.startTime)} -{" "}
                      {formatDateTime(currentGame.endTime)}
                    </p>
                  </div>
                  <Link href={`/dashboard/game/${currentGame.id}`}>
                    <Button>Join Game</Button>
                  </Link>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <Badge>{currentGame.status}</Badge>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">
                No active game at the moment
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="upcoming">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Games</CardTitle>
            <CardDescription>Scheduled game sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingGames.length > 0 ? (
              <div className="space-y-4">
                {upcomingGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex justify-between items-center border-b last:border-0 pb-4"
                  >
                    <div>
                      <p className="font-medium">
                        {formatDateTime(game.startTime)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {/* @ts-expect-error: expected this error */}
                        {game._count.gameQuestions} questions
                      </p>
                    </div>
                    <Badge>{game.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">
                No upcoming games scheduled
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="past">
        <Card>
          <CardHeader>
            <CardTitle>Past Games</CardTitle>
            <CardDescription>Your game history</CardDescription>
          </CardHeader>
          <CardContent>
            {pastGames.length > 0 ? (
              <div className="space-y-4">
                {pastGames.map((game) => {
                  const userResponses = game.responses || [];
                  const totalScore = userResponses.reduce(
                    (sum, r) => sum + r.score,
                    0
                  );
                  const questionsAnswered = userResponses.length;

                  return (
                    <div
                      key={game.id}
                      className="flex justify-between items-center border-b last:border-0 pb-4"
                    >
                      <div>
                        <p className="font-medium">
                          {formatDateTime(game.startTime)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Answered {questionsAnswered} of{" "}
                          {game._count.gameQuestions} questions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          Score: {totalScore.toFixed(1)}
                        </p>
                        <Badge
                          variant={
                            game.status === "ENDED" ? "secondary" : "default"
                          }
                        >
                          {game.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">
                No game history available
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
