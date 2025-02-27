"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

export function DashboardNav() {
  const pathname = usePathname();

  const items: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Game",
      href: "/dashboard/game",
    },
    {
      title: "Leaderboard",
      href: "/dashboard/leaderboard",
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
    },
  ];

  return (
    <nav className="grid items-start gap-2">
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
      <SignOutButton className="w-full justify-start" />
    </nav>
  );
}
