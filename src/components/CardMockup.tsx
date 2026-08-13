import FlippableCard from "@/components/FlippableCard";
import { DEFAULT_CARD_COLOR } from "@/lib/card-colors";

export default function CardMockup() {
  return (
    <div className="flex w-full min-w-0 max-w-xl items-center justify-center">
      <FlippableCard color={DEFAULT_CARD_COLOR} className="w-[400px] max-w-full" />
    </div>
  );
}
