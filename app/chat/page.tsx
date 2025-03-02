import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ChatContainer } from "@/components/chat/chat-container";

export default async function ChatPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Chat"
        text="Chat with other players and view game discussions"
      />
      <ChatContainer currentUserId={session.user.id} />
    </DashboardShell>
  );
}
