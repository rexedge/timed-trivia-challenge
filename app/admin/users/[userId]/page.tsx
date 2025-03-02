import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserDetails } from "@/app/actions/user-actions";
import { UserDetails } from "@/components/admin/user/user-details";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminHeader } from "@/components/admin/admin-header";

interface UserPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserPage(props: UserPageProps) {
  const session = await auth();
  const params = await props.params;

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const result = await getUserDetails(params.userId);

  if (!result.success) {
    return <div>Failed to load user details</div>;
  }

  return (
    <AdminShell>
      <AdminHeader
        heading={result.data.user.name || "User Details"}
        text="Manage user details and view activity"
      />
      <UserDetails
        user={result.data.user}
        gameHistory={result.data.gameHistory}
        currentUserId={session.user.id}
      />
    </AdminShell>
  );
}
