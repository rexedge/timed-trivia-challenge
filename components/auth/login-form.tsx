"use client";

import { useState } from "react";
import { signIn } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signIn("google");
      if (result?.error) {
        toast.error("Error", {
          description: result.error,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={loginWithGoogle}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FaGoogle className="mr-2 h-4 w-4" />
        )}{" "}
        Sign in with Google
      </Button>
    </div>
  );
}
