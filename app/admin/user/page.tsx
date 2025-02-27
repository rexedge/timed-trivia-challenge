import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminShell } from "@/components/admin/admin-shell";
// import { UsersList } from "@/components/admin/users/users-list";
import { db } from "@/lib/db";

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const users = await db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  console.log(users);

  return (
    <AdminShell>
      <AdminHeader heading="Users" text="Manage user accounts" />
      {/* <UsersList users={users} /> */}
    </AdminShell>
  );
}
