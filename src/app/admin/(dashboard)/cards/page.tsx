import CardsManager from "@/components/admin/CardsManager";

export default function AdminCardsPage() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-black">NFC cards</h1>
      <p className="mt-1 text-sm text-black/60">
        Generate activation codes, track claims, and manage who&apos;s tied to each card.
      </p>
      <div className="mt-6">
        <CardsManager />
      </div>
    </div>
  );
}
