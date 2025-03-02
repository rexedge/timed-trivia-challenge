"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medal } from "lucide-react";

interface LeaderboardEntry {
  userId: string;
  userName: string;
  userImage: string;
  score: number;
  rank: number;
}

interface LeaderboardProps {
  gameId: string;
  currentUserId: string;
  initialEntries: LeaderboardEntry[];
}

export function Leaderboard({
  gameId,
  currentUserId,
  initialEntries,
}: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialEntries);

  // Real-time updates
  useEffect(() => {
    const updateLeaderboard = async () => {
      try {
        const response = await fetch(`/api/games/${gameId}/leaderboard`);
        const data = await response.json();
        setEntries(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      }
    };

    const interval = setInterval(updateLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [gameId]);

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-amber-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center justify-between p-2 rounded-lg ${
                entry.userId === currentUserId ? "bg-muted" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 text-center">
                  {entry.rank <= 3 ? (
                    <Medal className={getMedalColor(entry.rank)} />
                  ) : (
                    <span className="text-muted-foreground">{entry.rank}</span>
                  )}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.userImage} alt={entry.userName} />
                  <AvatarFallback>
                    {entry.userName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{entry.userName}</span>
              </div>
              <span className="font-bold">{entry.score.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
