import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { auth } from "@/auth";
import { LayoutDashboard, LogIn, LogOut, Shield, Home } from "lucide-react";
import { DashboardNavMobile } from "./dashboard/dashboard-nav";
import { AdminNavMobile } from "./admin/admin-nav";

interface MainNavProps {
  isAdmin: boolean;
}

export async function MainNav({ isAdmin }: MainNavProps) {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto container px-4 flex h-14 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold hidden md:block">
              Timed Trivia Challenge
            </span>
            <Home size={20} className="md:hidden" />
          </Link>
          <DashboardNavMobile />
          {session?.user.role === "ADMIN" && <AdminNavMobile />}
        </div>
        <div className="flex items-center space-x-4">
          {session ? (
            <>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" className="md:flex hidden">
                    Admin Dashboard
                  </Button>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Shield size={20} />
                  </Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button variant="ghost" className="md:flex hidden">
                  Dashboard
                </Button>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <LayoutDashboard size={20} />
                </Button>
              </Link>
              <SignOutButton>
                <Button variant="ghost" className="md:flex hidden">
                  Sign Out
                </Button>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <LogOut size={20} />
                </Button>
              </SignOutButton>
            </>
          ) : (
            <Link href="/login">
              <Button size="icon" className="md:flex hidden">
                Sign In
              </Button>
              <Button size="icon" className="md:hidden">
                <LogIn size={20} />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
