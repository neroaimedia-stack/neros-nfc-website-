import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import PromosManager from "@/components/admin/PromosManager";

export default async function AdminPromosPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link href="/admin" className="text-sm text-black/40 transition-colors hover:text-black">
        ‹ Dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-black">Promo codes</h1>
      <div className="mt-6">
        <PromosManager />
      </div>
    </main>
  );
}
