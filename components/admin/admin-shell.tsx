import { AdminNav } from "@/components/admin/admin-nav";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <AdminNav />
        </aside>
        <main className="flex w-full flex-col overflow-hidden py-5">
          {children}
        </main>
      </div>
    </div>
  );
}
