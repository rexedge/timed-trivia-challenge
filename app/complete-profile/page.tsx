import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CompleteProfileForm } from "@/components/auth/complete-profile-form";

export const metadata: Metadata = {
  title: "Complete Profile",
  description: "Complete your profile to continue",
};

export default async function CompleteProfilePage(props: {
  searchParams: Promise<{ email?: string }>;
}) {
  const session = await auth();
  const searchParams = await props.searchParams;

  // Redirect to dashboard if already logged in with complete profile
  if (session?.user?.phoneNumber) {
    redirect("/dashboard");
  }

  const email = searchParams.email;

  if (!email) {
    redirect("/login");
  }

  return (
    <div className="mx-auto container px-4 flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            We need a few more details before you can continue
          </p>
        </div>
        <CompleteProfileForm email={email} />
      </div>
    </div>
  );
}
