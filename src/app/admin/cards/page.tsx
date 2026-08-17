import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import CardsManager from "@/components/admin/CardsManager";

export default async function AdminCardsPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link href="/admin" className="text-sm text-black/40 transition-colors hover:text-black">
        ‹ Dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-black">NFC cards</h1>
      <div className="mt-6">
        <CardsManager />
      </div>
    </main>
  );
}
