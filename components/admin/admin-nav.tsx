"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

export function AdminNav() {
  const pathname = usePathname();

  const items: NavItem[] = [
    {
      title: "Dashboard",
      href: "/admin",
    },
    {
      title: "Questions",
      href: "/admin/questions",
    },
    {
      title: "Games",
      href: "/admin/games",
    },
    {
      title: "Settings",
      href: "/admin/settings",
    },
    {
      title: "Users",
      href: "/admin/users",
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
    </nav>
  );
}
