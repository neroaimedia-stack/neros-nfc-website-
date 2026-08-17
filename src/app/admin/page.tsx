import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import AdminLogoutButton from "@/components/AdminLogoutButton";

export default async function AdminHomePage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Admin dashboard</h1>
          <p className="mt-1 text-sm text-black/60">Signed in as {admin.email}</p>
        </div>
        <AdminLogoutButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/promos"
          className="rounded-2xl border border-black/10 p-6 transition-colors hover:border-black/30"
        >
          <h2 className="text-lg font-semibold text-black">Promo codes</h2>
          <p className="mt-1 text-sm text-black/60">
            Create, deactivate, or delete discount codes.
          </p>
        </Link>
        <Link
          href="/admin/cards"
          className="rounded-2xl border border-black/10 p-6 transition-colors hover:border-black/30"
        >
          <h2 className="text-lg font-semibold text-black">NFC cards</h2>
          <p className="mt-1 text-sm text-black/60">
            Generate new activation codes and see which cards are claimed.
          </p>
        </Link>
      </div>
    </main>
  );
}
