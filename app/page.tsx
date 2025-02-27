import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="mx-auto container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Test Your Knowledge in Real-Time
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Join our Timed Trivia Challenge and compete with others. Answer
                questions every 15 minutes and climb the leaderboard!
              </p>
              <div className="space-x-4">
                {session ? (
                  <Link href="/dashboard">
                    <Button size="lg">Go to Dashboard</Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button size="lg">Get Started</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="mx-auto container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-bold">Real-Time Questions</h3>
                <p className="text-sm text-muted-foreground">
                  New questions every 15 minutes between 12:00 PM and 3:45 PM.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-bold">Speed Bonus</h3>
                <p className="text-sm text-muted-foreground">
                  Answer quickly to earn bonus points. The faster you answer,
                  the more points you get.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-bold">Live Leaderboard</h3>
                <p className="text-sm text-muted-foreground">
                  See your rank update in real-time as you and others answer
                  questions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="mx-auto container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            © {new Date().getFullYear()} Timed Trivia Challenge. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
