import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminDashboardCards } from "@/components/admin/admin-dashboard-cards";
import { getAdminStats } from "@/lib/admin-utils";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Get admin stats
  const stats = await getAdminStats();

  return (
    <AdminShell>
      <AdminHeader heading="Admin Dashboard" text="Manage your trivia games" />
      <AdminDashboardCards stats={stats} />
    </AdminShell>
  );
}
