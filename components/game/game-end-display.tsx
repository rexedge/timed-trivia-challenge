"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { CountdownTimer } from "../dashboard/games/countdown-timer";

interface GameEndDisplayProps {
  gameId: string;
  leaderboard: Array<{
    rank: number;
    userId: string;
    userName: string;
    userImage: string;
    score: number;
  }>;
  currentUserId: string;
}

export function GameEndDisplay({
  gameId,
  leaderboard,
  currentUserId,
}: GameEndDisplayProps) {
  const router = useRouter();
  const [showDisplay, setShowDisplay] = useState(true);

  const endTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  const handleClose = () => {
    setShowDisplay(false);
    router.push("/dashboard");
  };

  if (!showDisplay) return null;

  const winner = leaderboard[0];
  const currentUserRank = leaderboard.find(
    (entry) => entry.userId === currentUserId
  );

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Game Complete!
            </CardTitle>
            <div className="text-center text-muted-foreground">
              <CountdownTimer
                endTime={endTime}
                onComplete={handleClose}
                className="bg-transparent border-none shadow-none"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {winner && (
              <div className="text-center space-y-2">
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto" />
                <h3 className="text-xl font-semibold">Winner</h3>
                <p className="text-2xl font-bold">{winner.userName}</p>
                <p className="text-xl text-muted-foreground">
                  Score: {winner.score.toFixed(1)}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Final Leaderboard</h4>
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      entry.userId === currentUserId ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">
                        #{entry.rank}
                      </span>
                      <span className="font-medium">{entry.userName}</span>
                    </div>
                    <span className="font-semibold">
                      {entry.score.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {currentUserRank && (
              <div className="text-center space-y-2">
                <h4 className="text-lg font-semibold">Your Result</h4>
                <p>
                  Rank: #{currentUserRank.rank} with{" "}
                  {currentUserRank.score.toFixed(1)} points
                </p>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
