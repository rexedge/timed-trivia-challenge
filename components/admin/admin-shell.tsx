import { AdminNav } from "./admin-nav";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 pr-2 border-r h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <AdminNav />
        </aside>
        <main className="flex gap-5 w-full flex-col overflow-hidden p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
