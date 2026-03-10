"use client";

import { useVAT } from "@/context/vat-context";

const LU_VAT_RATE = 17;

function calcTTC(ht: number, vatRate: number = LU_VAT_RATE): number {
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
  const ttcPrice = calcTTC(htPrice, vatInfo.applicableVATRate || LU_VAT_RATE);

  const compareHT = compareAtPriceHT
    ? typeof compareAtPriceHT === "string"
      ? parseFloat(compareAtPriceHT)
      : compareAtPriceHT
    : null;
  const compareTTC = compareHT
    ? calcTTC(compareHT, vatInfo.applicableVATRate || LU_VAT_RATE)
    : null;

  const hasDiscount = compareHT && compareHT > htPrice;

  const sizeClasses = {
    sm: {
      main: "text-[14px] lg:text-[15px] font-bold",
      secondary: "text-[11px]",
      strikethrough: "text-[12px]",
    },
    md: {
      main: "text-[18px] lg:text-[20px] font-bold",
      secondary: "text-[12px]",
      strikethrough: "text-[13px]",
    },
    lg: {
      main: "text-[22px] lg:text-[28px] font-bold tracking-tight leading-none",
      secondary: "text-[12px]",
      strikethrough: "text-[14px]",
    },
    xl: {
      main: "text-[28px] lg:text-[36px] font-bold tracking-tight leading-none",
      secondary: "text-[13px]",
      strikethrough: "text-[16px]",
    },
  };

  const classes = sizeClasses[size || "lg"];

  const mainPrice = isPro ? htPrice : ttcPrice;
  const mainLabel = isPro ? 'HT' : 'TTC';
  const compareMain = isPro ? compareHT : compareTTC;

  return (
    <div>
      {hasDiscount && compareMain && (
        <div className="flex items-center gap-2 mb-1">
          <span className={`${classes.strikethrough} text-[#9CA3AF] line-through`}>
            {fmtPrice(compareMain)} €
          </span>
          <span className="text-[10px] font-medium text-[#9CA3AF] uppercase">
            Prix public {mainLabel}
          </span>
        </div>
      )}
      <div className="flex flex-wrap items-baseline gap-2">
        <span className={`${classes.main} ${hasDiscount ? 'text-[#DB021D]' : 'text-[#1A1A1A]'}`}>
          {fmtPrice(mainPrice)} €
        </span>
        {showLabel && (
          <span className={`${classes.secondary} font-bold text-zinc-400 uppercase`}>
            {mainLabel}
          </span>
        )}
        {hasDiscount && compareMain && showSavings && (
          <span className="text-[12px] font-bold text-[#DB021D] bg-[#DB021D]/10 px-2 py-0.5 rounded-md">
            -{Math.round((1 - mainPrice / compareMain) * 100)}%
          </span>
        )}
      </div>
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
  const ttcPrice = calcTTC(htPrice, vatInfo.applicableVATRate || LU_VAT_RATE);

  const compareHT = compareAtPriceHT
    ? typeof compareAtPriceHT === "string"
      ? parseFloat(compareAtPriceHT)
      : compareAtPriceHT
    : null;
  const compareTTC = compareHT
    ? calcTTC(compareHT, vatInfo.applicableVATRate || LU_VAT_RATE)
    : null;

  const hasDiscount = compareHT && compareHT > htPrice;

  const mainPrice = isPro ? htPrice : ttcPrice;
  const mainLabel = isPro ? 'HT' : 'TTC';
  const compareMain = isPro ? compareHT : compareTTC;

  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`text-sm font-black ${isPro ? 'text-[#1A1A1A]' : 'text-[#DB021D]'}`}>
        {fmtPrice(mainPrice)} €
      </span>
      <span className="text-[10px] text-zinc-500">{mainLabel}</span>
      {hasDiscount && compareMain && (
        <span className="text-xs text-zinc-400 line-through">
          {fmtPrice(compareMain)} €
        </span>
      )}
    </div>
  );
}
