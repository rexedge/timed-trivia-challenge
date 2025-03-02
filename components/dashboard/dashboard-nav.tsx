"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
}

export function DashboardNav() {
  const pathname = usePathname();

  const items: NavItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Game", href: "/dashboard/game" },
    { title: "Leaderboard", href: "/dashboard/leaderboard" },
    { title: "Profile", href: "/dashboard/profile" },
    { title: "Chat", href: "/chat" },
  ];

  return (
    <nav className="hidden md:grid items-start gap-2 py-5">
      {items.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

export function DashboardNavMobile() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const items: NavItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Game", href: "/dashboard/game" },
    { title: "Leaderboard", href: "/dashboard/leaderboard" },
    { title: "Profile", href: "/dashboard/profile" },
    { title: "Chat", href: "/chat" },
  ];

  return (
    <>
      <Button
        variant={"ghost"}
        size={"icon"}
        className="md:hidden p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu />
      </Button>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}
      <nav
        className={cn(
          "fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-64 bg-background border shadow-lg transform transition-transform md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="grid items-start gap-2 p-4">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === item.href
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start"
              )}
              onClick={() => setIsOpen(false)}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
