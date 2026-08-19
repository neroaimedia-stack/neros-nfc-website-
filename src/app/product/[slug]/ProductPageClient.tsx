"use client";

import { useState } from "react";
import Link from "next/link";
import FlippableCard from "@/components/FlippableCard";
import ReviewCardMock from "@/components/ReviewCardMock";
import WifiCardMock from "@/components/WifiCardMock";
import OrderCardMock from "@/components/OrderCardMock";
import { isOutOfStock, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { CARD_COLORS, DEFAULT_CARD_COLOR } from "@/lib/card-colors";
import { REVIEW_PLATFORMS, QR_VARIANT_SUFFIX } from "@/lib/review-platforms";
import { useCurrency } from "@/lib/currency-context";
import { formatCurrency, fromUSD, toUSD } from "@/lib/currency";
import { useProductReviews } from "@/lib/use-product-reviews";
import RatingSummary from "@/components/RatingSummary";
import ReviewsSection from "@/components/ReviewsSection";

const NAME_MAX_LENGTH = 18;
const JOB_TITLE_MAX_LENGTH = 26;
const WEBSITE_ADDON_SUFFIX = " + Website";
const WEBSITE_MONTHLY_FEE_USD = 20;

type UnitDetails = {
  name: string;
  jobTitle: string;
  qrLink: string;
  nfcLink: string;
};

type UnitErrors = {
  qr?: string;
  nfc?: string;
};

const emptyUnit: UnitDetails = { name: "", jobTitle: "", qrLink: "", nfcLink: "" };

function makeUnitId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function CardPager({
  index,
  total,
  onSelect,
}: {
  index: number;
  total: number;
  onSelect: (i: number) => void;
}) {
  if (total <= 1) return null;
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => onSelect(index - 1)}
        disabled={index === 0}
        className="shrink-0 rounded-full border border-black/15 px-3 py-1.5 text-xs font-medium text-black transition-opacity hover:opacity-60 disabled:opacity-25"
      >
        ‹ Prev
      </button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`Go to card ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-5 bg-black" : "w-2 bg-black/20 hover:bg-black/40"
            }`}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => onSelect(index + 1)}
        disabled={index === total - 1}
        className="shrink-0 rounded-full border border-black/15 px-3 py-1.5 text-xs font-medium text-black transition-opacity hover:opacity-60 disabled:opacity-25"
      >
        Next ›
      </button>
    </div>
  );
}

export default function ProductPageClient({
  product,
  otherProducts,
}: {
  product: Product | null;
  otherProducts: Product[];
}) {
  const isReview = product?.slug === "review-card";
  const isWifi = product?.slug === "wifi-card";
  const isOrderCard = product?.slug === "order-card";
  const isBusinessCard = product?.slug === "business-card";
  const useToggleSelector = isWifi || isOrderCard || isBusinessCard;
  const outOfStock = product ? isOutOfStock(product) : false;
  const isPreorder = outOfStock && !!product?.allowPreorder;
  const isBlocked = outOfStock && !product?.allowPreorder;
  const { addItem } = useCart();
  const currency = useCurrency();
  const [color, setColor] = useState(product?.colors[0] ?? "");
  const isStandardBusinessCard = isBusinessCard && color === "Standard";
  const [hasQR, setHasQR] = useState(false);
  const [units, setUnits] = useState<UnitDetails[]>([{ ...emptyUnit }]);
  const [unitErrors, setUnitErrors] = useState<UnitErrors[]>([]);
  const [activeUnit, setActiveUnit] = useState(0);
  const [notes, setNotes] = useState("");
  const [addWebsite, setAddWebsite] = useState(false);
  const [added, setAdded] = useState(false);
  const variant =
    hasQR && isReview
      ? `${color}${QR_VARIANT_SUFFIX}`
      : isOrderCard && addWebsite
        ? `${color}${WEBSITE_ADDON_SUFFIX}`
        : color;

  const goToUnit = (index: number) =>
    setActiveUnit(Math.max(0, Math.min(units.length - 1, index)));
  const addUnit = () => {
    setUnits((prev) => [...prev, { ...emptyUnit }]);
    setActiveUnit(units.length);
  };
  const removeUnit = () => {
    if (units.length <= 1) return;
    setUnits((prev) => prev.slice(0, -1));
    setActiveUnit((prev) => Math.min(prev, units.length - 2));
  };
  const updateUnit = (index: number, patch: Partial<UnitDetails>) =>
    setUnits((prev) =>
      prev.map((u, i) => (i === index ? { ...u, ...patch } : u))
    );
  const clearUnitError = (index: number, field: keyof UnitErrors) =>
    setUnitErrors((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: undefined } : e))
    );
  const reviewsData = useProductReviews(product?.slug ?? "");

  if (!product) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-black">Product not found</h1>
        <Link
          href="/#buy"
          className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          Back to shop
        </Link>
      </main>
    );
  }

  const variantDetail = product.variantDetails[color];
  const priceUSD =
    variantDetail?.price != null
      ? toUSD(variantDetail.price, product.currency)
      : toUSD(product.price, product.currency);
  const compareAtPriceUSD = product.compareAtPrice
    ? toUSD(product.compareAtPrice, product.currency)
    : undefined;
  const displayPrice = formatCurrency(fromUSD(priceUSD, currency), currency);
  const displayCompareAtPrice = compareAtPriceUSD
    ? formatCurrency(fromUSD(compareAtPriceUSD, currency), currency)
    : undefined;
  const displayMonthlyFee = formatCurrency(
    fromUSD(WEBSITE_MONTHLY_FEE_USD, currency),
    currency
  );
  const activeUnitData = units[activeUnit] ?? units[0];

  const handleAddToCart = () => {
    const errors: UnitErrors[] = units.map((u) => {
      const needsQr =
        (isReview && hasQR && !u.qrLink.trim()) ||
        (isOrderCard && !u.qrLink.trim());
      const needsNfc = (isReview || isOrderCard) && !u.nfcLink.trim();
      return {
        qr: needsQr
          ? "Please provide a destination link for the QR code."
          : undefined,
        nfc: needsNfc
          ? "Please provide a destination link for the NFC tap."
          : undefined,
      };
    });
    setUnitErrors(errors);
    const firstErrorIndex = errors.findIndex((e) => e.qr || e.nfc);
    if (firstErrorIndex !== -1) {
      setActiveUnit(firstErrorIndex);
      return false;
    }

    units.forEach((u, i) => {
      addItem({
        id: `${product.slug}-${variant}-${makeUnitId()}`,
        productSlug: product.slug,
        title: product.title,
        color: variant,
        price: priceUSD,
        quantity: 1,
        notes: notes.trim() || undefined,
        name: u.name.trim() || undefined,
        jobTitle: u.jobTitle.trim() || undefined,
        qrDestinationLink:
          (isReview && hasQR) || isOrderCard
            ? u.qrLink.trim() || undefined
            : undefined,
        nfcDestinationLink:
          isReview || isOrderCard ? u.nfcLink.trim() || undefined : undefined,
        monthlyFee:
          isOrderCard && addWebsite && i === 0
            ? WEBSITE_MONTHLY_FEE_USD
            : undefined,
      });
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    return true;
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
        <div className="rounded-2xl border border-black/10 bg-neutral-50 p-8 lg:sticky lg:top-24">
          {isReview ? (
            <ReviewCardMock
              className="mx-auto w-[400px] max-w-full"
              platform={variant}
              imageOverride={hasQR ? undefined : variantDetail?.imageUrl}
            />
          ) : isWifi ? (
            <WifiCardMock
              className="mx-auto w-[400px] max-w-full"
              format={color}
              imageOverride={variantDetail?.imageUrl}
            />
          ) : isOrderCard ? (
            <OrderCardMock
              className="mx-auto w-[400px] max-w-full"
              format={color}
              imageOverride={variantDetail?.imageUrl}
            />
          ) : (
            <FlippableCard
              className="mx-auto w-[400px] max-w-full"
              color={color}
              reflection={false}
              name={activeUnitData.name.trim() || undefined}
              jobTitle={activeUnitData.jobTitle.trim() || undefined}
              personalized={!isStandardBusinessCard}
            />
          )}
          {isBusinessCard && !isStandardBusinessCard && units.length > 1 && (
            <p className="mt-4 text-center text-xs text-black/40">
              Previewing card {activeUnit + 1} of {units.length}
            </p>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            {product.title}
          </h1>

          <RatingSummary
            averageRating={reviewsData.averageRating}
            reviewCount={reviewsData.reviewCount}
            orderCount={reviewsData.orderCount}
          />

          <div className="mt-4 flex items-center gap-3">
            {displayCompareAtPrice && (
              <span className="text-lg text-black/40 line-through">
                {displayCompareAtPrice}
              </span>
            )}
            <span className="text-2xl font-bold text-black">
              {displayPrice}
            </span>
            {product.compareAtPrice && (
              <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                Sale
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-black/60 underline decoration-black/30 underline-offset-2">
            Shipping calculated at checkout.
          </p>

          <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-black/70">
            {product.description}
          </p>

          {product.colors.length > 1 && (
            <div className="mt-8 rounded-2xl border border-black/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  {isReview
                    ? "Select Platform"
                    : isBusinessCard
                      ? "Select Type"
                      : useToggleSelector
                        ? "Select Format"
                        : "Select Finish"}
                </span>
                <span className="text-sm font-semibold text-black">
                  {color}
                </span>
              </div>
              {variantDetail?.description && (
                <p className="mt-2 text-xs leading-relaxed text-black/60">
                  {variantDetail.description}
                </p>
              )}
              {useToggleSelector ? (
                <div className="mt-3 flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-pressed={color === c}
                      className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium transition-all ${
                        color === c
                          ? "border-black bg-black text-white"
                          : "border-black/15 text-black hover:border-black/40"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {product.colors.map((c) => {
                    const swatch = isReview
                      ? REVIEW_PLATFORMS[c]?.background
                      : (CARD_COLORS[c] ?? CARD_COLORS[DEFAULT_CARD_COLOR])
                          .swatch;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        aria-label={c}
                        aria-pressed={color === c}
                        className={`h-8 w-8 rounded-full transition-all ${
                          color === c
                            ? "ring-2 ring-black ring-offset-2"
                            : "ring-1 ring-black/10 hover:ring-black/40"
                        }`}
                        style={{ background: swatch }}
                      />
                    );
                  })}
                </div>
              )}

              {isOrderCard && (
                <>
                  <label
                    htmlFor="add-website"
                    className="mt-5 flex cursor-pointer items-center gap-2 border-t border-black/10 pt-4"
                  >
                    <input
                      id="add-website"
                      type="checkbox"
                      checked={addWebsite}
                      onChange={(e) => setAddWebsite(e.target.checked)}
                      className="h-4 w-4 rounded border-black/30 accent-black"
                    />
                    <span className="text-xs font-semibold uppercase tracking-wide text-black/60">
                      Add Website{" "}
                      <span className="font-normal normal-case text-black/40">
                        ({displayMonthlyFee}/month)
                      </span>
                    </span>
                  </label>

                  {addWebsite && (
                    <div className="mt-3 rounded-xl bg-black/5 p-3 text-xs leading-relaxed text-black/70">
                      Includes an ordering webpage — customers scan your
                      card, browse your menu with photos, and place their
                      order online. You manage the menu and incoming orders
                      from your own dashboard. Billed separately at{" "}
                      {displayMonthlyFee}/month, starting once your website
                      is set up.
                    </div>
                  )}
                </>
              )}

              {isReview && (
                <>
                  <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-black/60">
                      Format
                    </span>
                    <span className="text-sm font-semibold text-black">
                      {hasQR ? "NFC + QR Code" : "NFC Only"}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {[
                      { label: "NFC Only", value: false },
                      { label: "NFC + QR Code", value: true },
                    ].map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setHasQR(option.value)}
                        aria-pressed={hasQR === option.value}
                        className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium transition-all ${
                          hasQR === option.value
                            ? "border-black bg-black text-white"
                            : "border-black/15 text-black hover:border-black/40"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {(isReview || isOrderCard) &&
                (() => {
                  const showQrField = isOrderCard || (isReview && hasQR);
                  const unit = activeUnitData;
                  const i = activeUnit;
                  return (
                    <div className="mt-5 border-t border-black/10 pt-4">
                      <span className="text-xs font-semibold uppercase tracking-wide text-black/60">
                        Destination links
                        {units.length > 1 ? ` (${units.length} cards)` : ""}
                      </span>
                      <div className="mt-3">
                        <CardPager
                          index={activeUnit}
                          total={units.length}
                          onSelect={goToUnit}
                        />
                        {units.length > 1 && (
                          <p className="mb-2 text-xs font-semibold text-black/50">
                            Card {activeUnit + 1} of {units.length}
                          </p>
                        )}
                        <div className="flex flex-col gap-3">
                          {showQrField && (
                            <div>
                              <label
                                htmlFor={`qr-link-${i}`}
                                className="text-xs font-semibold uppercase tracking-wide text-black/60"
                              >
                                QR code destination link{" "}
                                <span className="font-normal normal-case text-black/40">
                                  (required)
                                </span>
                              </label>
                              <input
                                id={`qr-link-${i}`}
                                type="url"
                                value={unit.qrLink}
                                onChange={(e) => {
                                  updateUnit(i, { qrLink: e.target.value });
                                  clearUnitError(i, "qr");
                                }}
                                placeholder="https://..."
                                className={`mt-2 w-full rounded-full border px-4 py-2.5 text-sm outline-none ${
                                  unitErrors[i]?.qr
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-black/15 focus:border-black"
                                }`}
                              />
                              {unitErrors[i]?.qr && (
                                <p className="mt-2 text-xs text-red-600">
                                  {unitErrors[i]?.qr}
                                </p>
                              )}
                            </div>
                          )}

                          <div>
                            <label
                              htmlFor={`nfc-link-${i}`}
                              className="text-xs font-semibold uppercase tracking-wide text-black/60"
                            >
                              NFC destination link{" "}
                              <span className="font-normal normal-case text-black/40">
                                (required)
                              </span>
                            </label>
                            <input
                              id={`nfc-link-${i}`}
                              type="url"
                              value={unit.nfcLink}
                              onChange={(e) => {
                                updateUnit(i, { nfcLink: e.target.value });
                                clearUnitError(i, "nfc");
                              }}
                              placeholder="https://..."
                              className={`mt-2 w-full rounded-full border px-4 py-2.5 text-sm outline-none ${
                                unitErrors[i]?.nfc
                                  ? "border-red-500 focus:border-red-500"
                                  : "border-black/15 focus:border-black"
                              }`}
                            />
                            {unitErrors[i]?.nfc && (
                              <p className="mt-2 text-xs text-red-600">
                                {unitErrors[i]?.nfc}
                              </p>
                            )}
                          </div>
                        </div>

                        {activeUnit < units.length - 1 && (
                          <button
                            type="button"
                            onClick={() => goToUnit(activeUnit + 1)}
                            className="mt-4 w-full rounded-full border border-black px-4 py-2 text-xs font-semibold text-black transition-opacity hover:opacity-60"
                          >
                            Save &amp; next card ›
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
            </div>
          )}

          {isBusinessCard && !isStandardBusinessCard && (
            <div className="mt-8 rounded-2xl border border-black/10 p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-black/60">
                Personalize your card{units.length > 1 ? "s" : ""}
              </span>
              <div className="mt-3">
                <CardPager
                  index={activeUnit}
                  total={units.length}
                  onSelect={goToUnit}
                />
                {units.length > 1 && (
                  <p className="mb-2 text-xs font-semibold text-black/50">
                    Card {activeUnit + 1} of {units.length}
                  </p>
                )}
                <div className="flex flex-col gap-3">
                  <div>
                    <label
                      htmlFor="card-name"
                      className="text-xs text-black/50"
                    >
                      Name{" "}
                      <span className="text-black/30">
                        ({activeUnitData.name.length}/{NAME_MAX_LENGTH})
                      </span>
                    </label>
                    <input
                      id="card-name"
                      type="text"
                      value={activeUnitData.name}
                      onChange={(e) =>
                        updateUnit(activeUnit, {
                          name: e.target.value.slice(0, NAME_MAX_LENGTH),
                        })
                      }
                      maxLength={NAME_MAX_LENGTH}
                      placeholder="e.g. Hernero Cruz"
                      className="mt-1 w-full rounded-full border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="card-title"
                      className="text-xs text-black/50"
                    >
                      Title{" "}
                      <span className="text-black/30">
                        ({activeUnitData.jobTitle.length}/
                        {JOB_TITLE_MAX_LENGTH})
                      </span>
                    </label>
                    <input
                      id="card-title"
                      type="text"
                      value={activeUnitData.jobTitle}
                      onChange={(e) =>
                        updateUnit(activeUnit, {
                          jobTitle: e.target.value.slice(
                            0,
                            JOB_TITLE_MAX_LENGTH
                          ),
                        })
                      }
                      maxLength={JOB_TITLE_MAX_LENGTH}
                      placeholder="e.g. CEO & Founder"
                      className="mt-1 w-full rounded-full border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-black"
                    />
                  </div>
                </div>

                {activeUnit < units.length - 1 && (
                  <button
                    type="button"
                    onClick={() => goToUnit(activeUnit + 1)}
                    className="mt-4 w-full rounded-full border border-black px-4 py-2 text-xs font-semibold text-black transition-opacity hover:opacity-60"
                  >
                    Save &amp; next card ›
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mt-8">
            <p className="text-sm font-semibold text-black">Quantity</p>
            <div className="mt-3 inline-flex items-center rounded-full border border-black/20">
              <button
                type="button"
                onClick={removeUnit}
                className="px-4 py-2 text-lg text-black"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold text-black">
                {units.length}
              </span>
              <button
                type="button"
                onClick={addUnit}
                className="px-4 py-2 text-lg text-black"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            {units.length > 1 &&
              ((isBusinessCard && !isStandardBusinessCard) ||
                isReview ||
                isOrderCard) && (
                <p className="mt-2 text-xs text-black/40">
                  Each card can have its own details above.
                </p>
              )}
          </div>

          <div className="mt-8">
            <label
              htmlFor="purchase-notes"
              className="text-sm font-semibold text-black"
            >
              Purchase notes{" "}
              <span className="font-normal text-black/40">(optional)</span>
            </label>
            <textarea
              id="purchase-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests? e.g. custom text, rush order, specific link to use..."
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-black/15 p-4 text-sm outline-none focus:border-black"
            />
          </div>

          {outOfStock && (
            <p
              className={`mt-6 rounded-xl px-4 py-2.5 text-sm font-medium ${
                isPreorder ? "bg-amber-50 text-amber-800" : "bg-black/5 text-black/60"
              }`}
            >
              {isPreorder
                ? "Currently out of stock — pre-order now and we'll ship as soon as it's back."
                : "Currently out of stock."}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isBlocked}
              className="rounded-full border border-black px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {isBlocked
                ? "Out of stock"
                : added
                  ? "Added ✓"
                  : isPreorder
                    ? "Pre-order"
                    : "Add to cart"}
            </button>
            <Link
              href={isBlocked ? "#" : "/cart"}
              aria-disabled={isBlocked}
              onClick={(e) => {
                if (isBlocked || !handleAddToCart()) e.preventDefault();
              }}
              className={`rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-80 ${
                isBlocked ? "pointer-events-none opacity-30" : ""
              }`}
            >
              {isPreorder ? "Pre-order now" : "Buy it now"}
            </Link>
          </div>
        </div>
      </div>

      <ReviewsSection
        reviews={reviewsData.reviews}
        loading={reviewsData.loading}
        user={reviewsData.user}
        myRating={reviewsData.myRating}
        myMessage={reviewsData.myMessage}
        hasMyReview={reviewsData.hasMyReview}
        submitReview={reviewsData.submitReview}
      />

      {otherProducts.length > 0 && (
        <div className="mt-16 border-t border-black/10 pt-12">
          <h2 className="text-xl font-bold text-black">
            Check out other products
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {otherProducts.map((p) => {
              const otherPriceUSD = toUSD(p.price, p.currency);
              const otherDisplayPrice = formatCurrency(
                fromUSD(otherPriceUSD, currency),
                currency
              );
              return (
                <Link
                  key={p.slug}
                  href={`/product/${p.slug}`}
                  className="flex items-center gap-4 rounded-2xl border border-black/10 p-4 transition-opacity hover:opacity-70"
                >
                  <div className="w-20 shrink-0">
                    {p.slug === "review-card" ? (
                      <ReviewCardMock shadow={false} />
                    ) : p.slug === "wifi-card" ? (
                      <WifiCardMock shadow={false} />
                    ) : p.slug === "order-card" ? (
                      <OrderCardMock shadow={false} />
                    ) : (
                      <FlippableCard shadow={false} reflection={false} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-black">{p.title}</p>
                    <p className="mt-1 text-sm text-black/60">
                      {otherDisplayPrice}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
