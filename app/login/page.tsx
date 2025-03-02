import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default async function LoginPage() {
  const session = await auth();

  // Redirect to dashboard if already logged in
  if (session?.user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto container px-4 flex min-h-[70svh] w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[300px]">
        <div className="flex flex-col space-y-2 text-center items-center">
          <Image
            src={"/logo.png"}
            height={100}
            width={100}
            alt="ttc-logo"
            className="mb-8"
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/"
            className="hover:text-brand underline underline-offset-4"
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
