import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { auth } from "@/auth";

interface MainNavProps {
  isAdmin: boolean;
}

export async function MainNav({ isAdmin }: MainNavProps) {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Timed Trivia Challenge</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {session ? (
            <>
              {isAdmin ? (
                <Link href="/admin">
                  <Button variant="ghost">Admin Dashboard</Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
