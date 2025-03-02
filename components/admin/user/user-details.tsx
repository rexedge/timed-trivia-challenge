"use client";

import { useState } from "react";
import { User, UserRole } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { updateUserRole } from "@/app/actions/user-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserDetailsProps {
  user: User & {
    _count: {
      responses: number;
    };
  };
  gameHistory: Array<{
    gameId: string;
    gameName: string;
    playedAt: Date;
    score: number;
    rank: number;
    totalPlayers: number;
  }>;
  currentUserId: string;
}

export function UserDetails({
  user,
  gameHistory,
  currentUserId,
}: UserDetailsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleUpdate = async (newRole: UserRole) => {
    if (user.id === currentUserId) {
      toast.error("You cannot change your own role");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateUserRole(user.id, newRole);

      if (!result.success) {
        toast.error(result.message || "Failed to update user role");
        return;
      }

      toast.success("User role updated successfully");
    } catch (error) {
      toast.error("Failed to update user role");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback>
                {user.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Role:</span>
                <span className="font-medium">{user.role}</span>
                {user.id !== currentUserId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleRoleUpdate(
                        user.role === UserRole.ADMIN
                          ? UserRole.PLAYER
                          : UserRole.ADMIN
                      )
                    }
                    disabled={isLoading}
                  >
                    {user.role === UserRole.ADMIN
                      ? "Remove Admin"
                      : "Make Admin"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Game History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Game</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Rank</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gameHistory.map((game, k) => (
                <TableRow key={k}>
                  <TableCell>{game.gameName}</TableCell>
                  <TableCell>
                    {new Date(game.playedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{game.score.toFixed(1)}</TableCell>
                  <TableCell>
                    #{game.rank} of {game.totalPlayers}
                  </TableCell>
                </TableRow>
              ))}
              {gameHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No games played yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
