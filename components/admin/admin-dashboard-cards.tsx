import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  activeGames: number;
  completedGames: number;
}

interface AdminDashboardCardsProps {
  stats: AdminStats;
}

export function AdminDashboardCards({ stats }: AdminDashboardCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
        <CardFooter>
          <Link href="/admin/users" className="w-full">
            <Button variant="outline" className="w-full">
              View Users
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalQuestions}</div>
        </CardContent>
        <CardFooter>
          <Link href="/admin/questions" className="w-full">
            <Button variant="outline" className="w-full">
              Manage Questions
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Games</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeGames}</div>
        </CardContent>
        <CardFooter>
          <Link href="/admin/games" className="w-full">
            <Button variant="outline" className="w-full">
              View Games
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Games</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedGames}</div>
        </CardContent>
        <CardFooter>
          <Link href="/admin/games" className="w-full">
            <Button variant="outline" className="w-full">
              View History
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
