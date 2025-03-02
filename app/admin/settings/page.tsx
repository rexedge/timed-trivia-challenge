import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { GameSettingsForm } from "@/components/admin/settings/game-settings-form";
import { db } from "@/lib/db";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const settings = await db.gameSettings.findFirst();

  return (
    <AdminShell>
      <AdminHeader heading="Settings" text="Manage game settings" />
      <div className="grid gap-10">
        <GameSettingsForm settings={settings} />
      </div>
    </AdminShell>
  );
}
