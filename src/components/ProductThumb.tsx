import { FiPackage } from "react-icons/fi";
import FlippableCard from "@/components/FlippableCard";
import ReviewCardMock from "@/components/ReviewCardMock";
import WifiCardMock from "@/components/WifiCardMock";
import OrderCardMock from "@/components/OrderCardMock";

export default function ProductThumb({
  slug,
  variant,
  imageOverride,
  className = "w-20 shrink-0",
}: {
  slug: string;
  variant: string;
  imageOverride?: string | null;
  className?: string;
}) {
  switch (slug) {
    case "review-card":
      return (
        <ReviewCardMock
          platform={variant}
          shadow={false}
          className={className}
          imageOverride={imageOverride}
        />
      );
    case "wifi-card":
      return (
        <WifiCardMock
          format={variant}
          shadow={false}
          className={className}
          imageOverride={imageOverride}
        />
      );
    case "order-card":
      return (
        <OrderCardMock
          format={variant}
          shadow={false}
          className={className}
          imageOverride={imageOverride}
        />
      );
    case "business-card":
      return (
        <FlippableCard shadow={false} reflection={false} personalized={false} className={className} />
      );
    default:
      if (imageOverride) {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageOverride}
            alt={variant}
            className={`${className} aspect-square rounded-lg object-cover`}
          />
        );
      }
      return (
        <div className={`${className} flex aspect-square items-center justify-center rounded-lg border border-dashed border-black/15 text-black/25`}>
          <FiPackage className="h-6 w-6" />
        </div>
      );
  }
}
