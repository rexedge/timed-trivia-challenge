import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    profession: string | null;
  };
  totalScore: number;
  correctAnswers: number;
  totalAnswers: number;
}

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
}

export function LeaderboardTable({
  leaderboard,
  currentUserId,
}: LeaderboardTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Standings</CardTitle>
        <CardDescription>Players ranked by total score</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Correct</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry) => (
              <TableRow
                key={entry.user.id}
                className={
                  entry.user.id === currentUserId ? "bg-primary/10" : ""
                }
              >
                <TableCell className="font-medium">{entry.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={entry.user.image || ""}
                        alt={entry.user.name || ""}
                      />
                      <AvatarFallback>
                        {entry.user.name?.charAt(0) ||
                          entry.user.email?.charAt(0) ||
                          "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {entry.user.name || entry.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.user.profession || ""}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {entry.totalScore.toFixed(1)}
                </TableCell>
                <TableCell className="text-right">
                  {entry.correctAnswers}/{entry.totalAnswers}
                </TableCell>
              </TableRow>
            ))}
            {leaderboard.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  No data available yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
