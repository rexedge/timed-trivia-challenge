import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAllUsers } from "@/app/actions/user-actions";
import { UsersList } from "@/components/admin/user/user-list";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminHeader } from "@/components/admin/admin-header";

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function UsersPage(props: UsersPageProps) {
  const session = await auth();
  const searchParams = await props.searchParams;

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const page = Number(searchParams.page) || 1;
  const result = await getAllUsers(page);

  if (!result.success) {
    return <div>Failed to load users</div>;
  }

  return (
    <AdminShell>
      <AdminHeader
        heading="Users"
        text="Manage user accounts and permissions"
      />
      <UsersList
        users={result.data.users}
        pagination={result.data.pagination}
        currentUserId={session.user.id}
      />
    </AdminShell>
  );
}
