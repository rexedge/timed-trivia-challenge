import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProfileForm } from "@/components/profile/profile-form";
import { db } from "@/lib/db";

export default async function AdminProfilePage() {
  const session = await auth();

  if (!session?.user.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <AdminShell>
      <AdminHeader heading="Profile" text="Manage your account settings" />
      <div className="grid gap-10">
        <ProfileForm user={user} />
      </div>
    </AdminShell>
  );
}
