import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminLogoutButton from "@/components/AdminLogoutButton";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center justify-between gap-4 border-b border-black/10 px-6 py-4 md:flex lg:px-10">
          <p className="text-sm text-black/60">
            Signed in as <span className="font-medium text-black">{admin.email}</span>
          </p>
          <AdminLogoutButton />
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8 lg:px-10">{children}</main>
        <div className="border-t border-black/10 px-4 py-4 md:hidden">
          <AdminLogoutButton />
        </div>
      </div>
    </div>
  );
}
