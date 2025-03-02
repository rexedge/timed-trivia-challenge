"use client";

import { useState } from "react";
import { signOut } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { ButtonProps } from "react-day-picker";

export function SignOutButton({ className }: ButtonProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleSignOut}
        disabled={isLoading}
        variant="ghost"
        className="md:flex hidden"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign Out"}
      </Button>
      <Button
        onClick={handleSignOut}
        disabled={isLoading}
        variant="ghost"
        size="icon"
        className="md:hidden"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
      </Button>
    </>
  );
}
