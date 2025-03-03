"use client";

import { useState } from "react";
import Link from "next/link";
import { Game, GameStatus, Question } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { updateGameStatus, deleteGame } from "@/app/actions/admin-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Play, Pause, Trash } from "lucide-react";
import { toast } from "sonner";

interface GamesListProps {
  games: (Game & {
    _count: {
      gameQuestions: number;
      responses: number;
    };
  })[];
  availableQuestions: Pick<Question, "id" | "text">[];
}

export function GamesList({
  games: initialGames,
  availableQuestions,
}: GamesListProps) {
  const [games, setGames] = useState(initialGames);

  const handleStatusUpdate = async (gameId: string, status: GameStatus) => {
    try {
      const result = await updateGameStatus(gameId, status);
      if (!result.success) {
        toast.error("Error", {
          description: result.message,
        });
      } else {
        setGames(
          games.map((game) => (game.id === gameId ? { ...game, status } : game))
        );
        toast.success("Success", {
          description: "Game status updated successfully",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update game status",
      });
    }
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm("Are you sure you want to delete this game?")) return;

    try {
      const result = await deleteGame(gameId);
      if (!result.success) {
        toast.error("Error", {
          description: result.message,
        });
      } else {
        setGames(games.filter((game) => game.id !== gameId));
        toast.success("Success", {
          description: "Game deleted successfully",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Error", {
        description: "Failed to delete game",
      });
    }
  };

  const getStatusBadgeVariant = (status: GameStatus) => {
    switch (status) {
      case "IN_PROGRESS":
        return "outline";
      case "ENDED":
        return "secondary";
      case "CANCELLED":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Games</CardTitle>
        <CardDescription>Manage trivia game sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Responses</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => (
              <TableRow key={game.id}>
                <TableCell>{formatDateTime(game.startTime)}</TableCell>
                <TableCell>{formatDateTime(game.endTime)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(game.status)}>
                    {game.status}
                  </Badge>
                </TableCell>
                <TableCell>{game._count.gameQuestions}</TableCell>
                <TableCell>{game._count.responses}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/admin/games/${game.id}`}>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                      </Link>
                      {game.status === "SCHEDULED" && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(game.id, "IN_PROGRESS")
                            }
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Start Game
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem>
                            <EditGame
                              game={game}
                              availableQuestions={availableQuestions}
                            />
                          </DropdownMenuItem> */}
                        </>
                      )}
                      {game.status === "IN_PROGRESS" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(game.id, "ENDED")}
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          End Game
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(game.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Game
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {games.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No games found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
