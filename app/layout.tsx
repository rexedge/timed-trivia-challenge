import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { Footer } from "@/components/footer";
import { auth } from "@/auth";
import { MainNav } from "@/components/main-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Timed Trivia Challenge",
  description: "A real-time trivia game with timed questions and leaderboards",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <MainNav isAdmin={session?.user?.role === "ADMIN"} />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
