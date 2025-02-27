import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfileForm } from "@/components/profile/profile-form";
import { db } from "@/lib/db";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Profile" text="Manage your account settings" />
      <div className="grid gap-10">
        <ProfileForm user={user} />
      </div>
    </DashboardShell>
  );
}
