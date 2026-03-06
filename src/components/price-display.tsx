"use client";

import { useVAT } from "@/context/vat-context";

const BE_VAT_RATE = 21;

function calcTTC(ht: number, vatRate: number = BE_VAT_RATE): number {
  return ht * (1 + vatRate / 100);
}

function fmtPrice(v: number): string {
  return v.toFixed(2).replace(".", ",");
}

interface PriceDisplayProps {
  priceHT: number | string;
  compareAtPriceHT?: number | string | null;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  showSavings?: boolean;
}

export function PriceDisplay({
  priceHT,
  compareAtPriceHT,
  size = "lg",
  showLabel = true,
  showSavings = false,
}: PriceDisplayProps) {
  const { vatInfo } = useVAT();
  const isPro = vatInfo.displayMode === "HT";

  const htPrice = typeof priceHT === "string" ? parseFloat(priceHT) : priceHT;
  const ttcPrice = calcTTC(htPrice, vatInfo.applicableVATRate || BE_VAT_RATE);

  const compareHT = compareAtPriceHT
    ? typeof compareAtPriceHT === "string"
      ? parseFloat(compareAtPriceHT)
      : compareAtPriceHT
    : null;
  const compareTTC = compareHT
    ? calcTTC(compareHT, vatInfo.applicableVATRate || BE_VAT_RATE)
    : null;

  const hasDiscount = compareHT && compareHT > htPrice;

  const sizeClasses = {
    sm: {
      main: "text-[14px] lg:text-[15px] font-black",
      secondary: "text-[11px]",
      strikethrough: "text-[12px]",
    },
    md: {
      main: "text-[18px] lg:text-[20px] font-black",
      secondary: "text-[12px]",
      strikethrough: "text-[13px]",
    },
    lg: {
      main: "text-[24px] lg:text-[32px] font-black tracking-tight leading-none",
      secondary: "text-[13px]",
      strikethrough: "text-[15px]",
    },
    xl: {
      main: "text-[32px] lg:text-[44px] font-black tracking-tight leading-none",
      secondary: "text-[14px]",
      strikethrough: "text-[18px]",
    },
  };

  const classes = sizeClasses[size || "lg"];

  if (isPro) {
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex flex-wrap items-baseline gap-2">
          <span
            className={`${classes.main} text-[#1A1A1A]`}
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            {fmtPrice(htPrice)} €
          </span>
          {showLabel && (
            <span
              className={`${classes.secondary} font-bold text-zinc-400 uppercase`}
            >
              HT
            </span>
          )}
          {hasDiscount && compareHT && (
            <>
              <span
                className={`${classes.strikethrough} font-semibold text-zinc-400 line-through decoration-[#DB021D] decoration-2 ml-1`}
              >
                {fmtPrice(compareHT)} €
              </span>
              {showSavings && (
                <span className="ml-2 text-[12px] font-bold text-white bg-[#DB021D] px-2 py-0.5 rounded-full">
                  Économisez {fmtPrice(compareHT - htPrice)} €
                </span>
              )}
            </>
          )}
        </div>
        <span className={`${classes.secondary} font-semibold text-zinc-500`}>
          ({fmtPrice(ttcPrice)} € TTC)
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex flex-wrap items-baseline gap-2">
        <span
          className={`${classes.main} text-[#1A1A1A]`}
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          {fmtPrice(ttcPrice)} €
        </span>
        {showLabel && (
          <span
            className={`${classes.secondary} font-bold text-zinc-400 uppercase`}
          >
            TTC
          </span>
        )}
        {hasDiscount && compareTTC && (
          <>
            <span
              className={`${classes.strikethrough} font-semibold text-zinc-400 line-through decoration-[#DB021D] decoration-2 ml-1`}
            >
              {fmtPrice(compareTTC)} €
            </span>
            {showSavings && (
              <span className="ml-2 text-[12px] font-bold text-white bg-[#DB021D] px-2 py-0.5 rounded-full">
                Économisez {fmtPrice(compareTTC - ttcPrice)} €
              </span>
            )}
          </>
        )}
      </div>
      <span className={`${classes.secondary} font-semibold text-zinc-500`}>
        ({fmtPrice(htPrice)} € HT)
      </span>
    </div>
  );
}

export function PriceDisplayCompact({
  priceHT,
  compareAtPriceHT,
}: {
  priceHT: number | string;
  compareAtPriceHT?: number | string | null;
}) {
  const { vatInfo } = useVAT();
  const isPro = vatInfo.displayMode === "HT";

  const htPrice = typeof priceHT === "string" ? parseFloat(priceHT) : priceHT;
  const ttcPrice = calcTTC(htPrice, vatInfo.applicableVATRate || BE_VAT_RATE);

  const compareHT = compareAtPriceHT
    ? typeof compareAtPriceHT === "string"
      ? parseFloat(compareAtPriceHT)
      : compareAtPriceHT
    : null;
  const compareTTC = compareHT
    ? calcTTC(compareHT, vatInfo.applicableVATRate || BE_VAT_RATE)
    : null;

  const hasDiscount = compareHT && compareHT > htPrice;

  if (isPro) {
    return (
      <div className="space-y-0.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-black text-[#DB021D]">
            {fmtPrice(htPrice)} €
          </span>
          <span className="text-[10px] text-zinc-500">HT</span>
          {hasDiscount && compareHT && (
            <span className="text-xs text-zinc-400 line-through">
              {fmtPrice(compareHT)} €
            </span>
          )}
        </div>
        <p className="text-[10px] text-zinc-400">{fmtPrice(ttcPrice)} € TTC</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-black text-[#DB021D]">
          {fmtPrice(ttcPrice)} €
        </span>
        <span className="text-[10px] text-zinc-500">TTC</span>
        {hasDiscount && compareTTC && (
          <span className="text-xs text-zinc-400 line-through">
            {fmtPrice(compareTTC)} €
          </span>
        )}
      </div>
      <p className="text-[10px] text-zinc-400">{fmtPrice(htPrice)} € HT</p>
    </div>
  );
}
