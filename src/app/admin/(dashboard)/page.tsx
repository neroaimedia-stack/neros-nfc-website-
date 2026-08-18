import DashboardStats from "@/components/admin/DashboardStats";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-black">Dashboard</h1>
      <p className="mt-1 text-sm text-black/60">A quick look at how the store is doing.</p>
      <div className="mt-6">
        <DashboardStats />
      </div>
    </div>
  );
}
