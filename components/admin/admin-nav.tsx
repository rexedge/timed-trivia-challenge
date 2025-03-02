"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { MenuSquare } from "lucide-react";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
}

export function AdminNav() {
  const pathname = usePathname();

  const items: NavItem[] = [
    { title: "Dashboard", href: "/admin" },
    { title: "Questions", href: "/admin/questions" },
    { title: "Games", href: "/admin/games" },
    { title: "Settings", href: "/admin/settings" },
    { title: "Users", href: "/admin/users" },
    { title: "Profile", href: "/admin/profile" },
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

export function AdminNavMobile() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const items: NavItem[] = [
    { title: "Dashboard", href: "/admin" },
    { title: "Questions", href: "/admin/questions" },
    { title: "Games", href: "/admin/games" },
    { title: "Settings", href: "/admin/settings" },
    { title: "Users", href: "/admin/users" },
    { title: "Profile", href: "/admin/profile" },
  ];

  return (
    <>
      <Button
        variant={"ghost"}
        size={"icon"}
        className="md:hidden p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MenuSquare />
      </Button>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}
      <nav
        className={cn(
          "fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-64 bg-background border-r shadow-lg transform transition-transform md:hidden",
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
