"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ChevronLeft,
  Check,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { Product } from "@/lib/shopify/types";
import { useCart } from "@/context/cart-context";
import { PriceDisplay } from "@/components/price-display";
import { StickyAddToCart } from "@/components/mobile/StickyAddToCart";

// Extracted components
import { ImageGallery } from "./components/image-gallery";
import { Accordion } from "./components/accordion";
import { QuantitySelector } from "./components/quantity-selector";
import { CrossSellSection } from "./components/cross-sell-section";
import { ReassuranceSection } from "./components/reassurance-section";

// Extracted pure functions
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

import { parseDescriptionHtml, parseProductTitle } from "./lib/parse-product";

interface ProductDetailsProps {
  product: Product;
  relatedProducts?: Product[];
  specsMap?: Record<string, { label: string; value: string }[]>;
}

export function ProductDetails({
  product,
  relatedProducts = [],
  specsMap = {},
}: ProductDetailsProps) {
  const { addToCart, isLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { margin: "0px" });

  // ── Variant logic ──
  const variants = product.variants?.edges?.map((e) => e.node) || [];
  const hasOneKeyVariants = variants.some(
    (v) =>
      v.title?.toUpperCase().includes("ONE") ||
      v.selectedOptions?.some((opt) => opt.value.toUpperCase().includes("ONE")),
  );
  const hasStandardVariants = variants.some(
    (v) =>
      !v.title?.toUpperCase().includes("ONE") &&
      !v.selectedOptions?.some((opt) =>
        opt.value.toUpperCase().includes("ONE"),
      ),
  );

  const [variantFilter, setVariantFilter] = useState<"standard" | "onekey">(
    "standard",
  );

  const getFilteredOptionValues = (optionName: string, values: string[]) => {
    if (!hasOneKeyVariants || !hasStandardVariants) return values;
    return values.filter((value) => {
      const isOneKey = value.toUpperCase().includes("ONE");
      return variantFilter === "onekey" ? isOneKey : !isOneKey;
    });
  };

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const initial: Record<string, string> = {};
    product.options?.forEach((option) => {
      const filteredValues = getFilteredOptionValues(
        option.name,
        option.values,
      );
      initial[option.name] = filteredValues[0] || option.values[0];
    });
    return initial;
  });

  useEffect(() => {
    if (hasOneKeyVariants && hasStandardVariants) {
      setSelectedOptions((prev) => {
        const updated: Record<string, string> = {};
        product.options?.forEach((option) => {
          const filteredValues = getFilteredOptionValues(
            option.name,
            option.values,
          );
          if (!filteredValues.includes(prev[option.name])) {
            updated[option.name] = filteredValues[0] || option.values[0];
          } else {
            updated[option.name] = prev[option.name];
          }
        });
        return updated;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantFilter]);

  const images = useMemo(
    () => product.images?.edges?.map((e) => e.node) || [],
    [product.images?.edges],
  );

  const selectedVariant =
    variants.find((variant) =>
      variant.selectedOptions?.every(
        (opt) => selectedOptions[opt.name] === opt.value,
      ),
    ) || variants[0];

  const variantImageUrl = selectedVariant?.image?.url;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (variantImageUrl) {
      const idx = images.findIndex((img) => img.url === variantImageUrl);
      setSelectedImageIndex(idx !== -1 ? idx : 0);
    }
  }, [variantImageUrl, images]);

  // ── Derived data ──
  const price = selectedVariant?.price || product.priceRange?.minVariantPrice;
  const compareAtPrice = selectedVariant?.compareAtPrice;

  // FOMO Logic: Generate seeded random stats below threshold to encourage urgency
  const seed = hashString(product.handle);
  const stockLeft = (seed % 9) + 2;

  const { mainTitle, modelRef } = parseProductTitle(
    product.title,
    selectedVariant?.title,
  );
  const isAvailable = selectedVariant?.availableForSale ?? true;
  const isNew =
    product.tags?.some((t) =>
      ["nouveau", "new", "nouveauté"].includes(t.toLowerCase()),
    ) ?? false;

  const technicalSpecs = selectedVariant?.id
    ? specsMap[selectedVariant.id] || []
    : [];

  // Get 4 highlighted specs for badging
  const highlightSpecs = technicalSpecs.slice(0, 4);

  const html = product.descriptionHtml || "";
  const { intro, features, specsRows } = useMemo(
    () => parseDescriptionHtml(html),
    [html],
  );
  const hasStructuredContent = features.length > 0 || specsRows.length > 0;

  // ── Handlers ──
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
    try {
      await addToCart(selectedVariant.id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // ── Render description content (for accordion) ──
  const renderDescriptionContent = () => (
    <div>
      {hasStructuredContent && intro ? (
        <div
          className="text-sm leading-relaxed text-zinc-600 [&>p]:mb-0"
          dangerouslySetInnerHTML={{ __html: intro }}
        />
      ) : html ? (
        <div
          className="prose prose-sm max-w-none prose-p:text-zinc-600 prose-p:leading-relaxed prose-strong:text-[#1A1A1A] prose-strong:font-bold prose-ul:space-y-2 prose-li:text-zinc-600 prose-li:leading-relaxed prose-li:marker:text-[#DB021D] prose-h3:text-[#1A1A1A] prose-h3:font-black prose-h3:uppercase prose-h3:tracking-wide prose-h3:text-sm prose-h3:border-b prose-h3:border-gray-200 prose-h3:pb-2 prose-h3:mt-6 prose-h3:mb-3 prose-h2:text-[#1A1A1A] prose-h2:font-black prose-h2:uppercase prose-h2:tracking-wide prose-h2:text-base prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 prose-h2:mt-6 prose-h2:mb-3 prose-table:w-full prose-table:text-sm prose-table:border-collapse [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:border [&_table]:border-gray-200 [&_tr]:border-b [&_tr]:border-gray-100 [&_tr:last-child]:border-0 [&_tr:nth-child(even)]:bg-gray-50/50 [&_td]:px-4 [&_td]:py-2.5 [&_td:first-child]:font-semibold [&_td:first-child]:text-[#1A1A1A] [&_td:last-child]:text-zinc-600"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : product.description ? (
        <div className="space-y-3">
          {product.description
            .split(/\n\n|\.\s+/)
            .filter(Boolean)
            .map((paragraph, i) => (
              <p key={i} className="text-zinc-600 text-sm leading-relaxed">
                {paragraph.trim().endsWith(".")
                  ? paragraph.trim()
                  : `${paragraph.trim()}.`}
              </p>
            ))}
        </div>
      ) : (
        <p className="text-zinc-500 italic text-sm">
          Aucune description disponible pour ce produit.
        </p>
      )}
    </div>
  );

  return (
    <>
      <main
        data-product-page="true"
        className="bg-white lg:min-h-screen lg:pb-12"
      >
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto px-4 lg:px-8 xl:px-12 pt-4 lg:pt-8">
          {/* ── Breadcrumbs ── */}
          <div className="flex items-center gap-3 mb-2 lg:mb-8">
            <button
              onClick={() => window.history.back()}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
              aria-label="Retour"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <nav
              aria-label="Fil d'Ariane"
              className="flex items-center gap-2 text-xs text-gray-500 overflow-hidden"
            >
              <Link
                href="/"
                className="hover:text-[#DB021D] transition-colors flex-shrink-0 font-medium"
              >
                Accueil
              </Link>
              <span className="text-gray-300">/</span>
              {product.productType && (
                <>
                  <span className="text-gray-500 flex-shrink-0 font-medium">
                    {product.productType}
                  </span>
                  <span className="text-gray-300">/</span>
                </>
              )}
              <span className="text-[#1A1A1A] font-bold truncate">
                {mainTitle}
              </span>
            </nav>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              TWO-COLUMN LAYOUT: Gallery (sticky LEFT) + Info (scrollable RIGHT)
              ══════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 xl:gap-20 items-start pt-0 lg:pt-2">
            {/* ── LEFT: Sticky Gallery ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full lg:w-[55%] xl:w-[58%] lg:sticky lg:top-24 lg:self-start"
            >
              <ImageGallery
                images={images}
                title={product.title}
                selectedImageIndex={selectedImageIndex}
                onImageChange={setSelectedImageIndex}
                isNew={isNew}
              />
            </motion.div>

            {/* ── RIGHT: Scrollable Product Info ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full lg:w-[45%] xl:w-[42%] pb-8 z-10"
            >
              <div className="space-y-5 lg:space-y-6">
                {/* 1. Product Type Tag + SKU */}
                <div className="flex items-center gap-3">
                  {product.productType && (
                    <span className="inline-flex items-center px-3 py-1 bg-[#1A1A1A] text-white text-[11px] font-bold uppercase tracking-widest rounded-md shadow-sm">
                      {product.productType}
                    </span>
                  )}
                  {selectedVariant?.sku && (
                    <span className="text-[12px] text-zinc-400 font-semibold uppercase tracking-wider">
                      R&eacute;f. {selectedVariant.sku}
                    </span>
                  )}
                </div>

                {/* 2. Title */}
                <div>
                  <h1
                    className="text-lg lg:text-3xl font-black text-[#1A1A1A] uppercase leading-[1.15] tracking-tight"
                    style={{ fontFamily: "var(--font-oswald)" }}
                  >
                    {mainTitle}
                  </h1>
                  {modelRef && (
                    <p className="text-zinc-400 font-semibold text-[13px] lg:text-sm mt-1 uppercase tracking-wide">
                      {modelRef}
                    </p>
                  )}
                </div>

                {/* 3. Specs Badges — compact */}
                {highlightSpecs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {highlightSpecs.map((spec, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-1 bg-zinc-50 text-zinc-600 text-[11px] font-semibold rounded-md"
                      >
                        {spec.value}
                      </span>
                    ))}
                  </div>
                )}

                {/* 4. Price */}
                <div>
                  <PriceDisplay
                    priceHT={price?.amount || "0"}
                    compareAtPriceHT={compareAtPrice?.amount}
                    size="lg"
                    showSavings={true}
                  />
                </div>

                {/* 5. Availability */}
                <div className="flex items-center gap-2 flex-wrap">
                  {isAvailable ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[12px] font-bold rounded-md">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        En stock
                      </span>
                      <span className="text-[12px] text-zinc-400 font-medium">
                        &middot; Exp&eacute;di&eacute; sous 48h
                      </span>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-[12px] font-bold rounded-md">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Rupture de stock
                    </span>
                  )}
                </div>

                {/* 6. Version Filter: Standard / ONE-KEY */}
                {hasOneKeyVariants && hasStandardVariants && (
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                      Version
                    </label>
                    <div className="inline-flex p-1 bg-[#F5F5F5] rounded-xl border border-gray-200">
                      <button
                        onClick={() => setVariantFilter("standard")}
                        className={`px-5 py-2 text-[12px] lg:text-[13px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${variantFilter === "standard"
                          ? "bg-white text-[#1A1A1A] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                          : "text-zinc-500 hover:text-zinc-800"
                          }`}
                      >
                        Standard
                      </button>
                      <button
                        onClick={() => setVariantFilter("onekey")}
                        className={`px-5 py-2 text-[12px] lg:text-[13px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${variantFilter === "onekey"
                          ? "bg-white text-[#DB021D] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                          : "text-zinc-500 hover:text-zinc-800"
                          }`}
                      >
                        ONE-KEY&trade;
                      </button>
                    </div>
                  </div>
                )}

                {/* 7. Variant Options */}
                {product.options &&
                  product.options.length > 0 &&
                  product.options[0].values.length > 1 && (
                    <div className="space-y-4">
                      {product.options.map((option) => {
                        const filteredValues = getFilteredOptionValues(
                          option.name,
                          option.values,
                        );
                        if (filteredValues.length <= 1) return null;

                        return (
                          <div key={option.name}>
                            <label className="block text-[11px] font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                              {option.name === "Modèle"
                                ? "Configuration"
                                : option.name}{" "}
                              :
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {filteredValues.map((value) => {
                                const isSelected =
                                  selectedOptions[option.name] === value;
                                return (
                                  <button
                                    key={value}
                                    onClick={() =>
                                      setSelectedOptions((prev) => ({
                                        ...prev,
                                        [option.name]: value,
                                      }))
                                    }
                                    className={`px-4 py-3 text-[13px] font-bold rounded-xl border-2 transition-all active:scale-95 ${isSelected
                                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md"
                                      : "bg-white text-zinc-700 border-zinc-200 hover:border-[#1A1A1A] hover:bg-zinc-50"
                                      }`}
                                  >
                                    {value}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                {/* 8. Quantity + CTA Button */}
                <div ref={ctaRef} className="flex items-stretch gap-3 pt-2">
                  <QuantitySelector
                    quantity={quantity}
                    onChange={setQuantity}
                  />
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={!isAvailable || isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative flex-1 h-14 lg:h-16 font-black text-base uppercase tracking-wider rounded-xl flex items-center justify-center gap-2.5 overflow-hidden transition-all duration-500 ${addedToCart
                      ? "bg-emerald-500 text-white shadow-[0_6px_28px_rgba(16,185,129,0.4)]"
                      : "bg-[#DB021D] text-white hover:bg-[#B8011A] disabled:bg-zinc-300 disabled:shadow-none disabled:cursor-not-allowed shadow-[0_6px_28px_rgba(219,2,29,0.4)] hover:shadow-[0_8px_36px_rgba(219,2,29,0.5)]"
                      }`}
                  >
                    {/* Shine sweep */}
                    <motion.span className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
                      <motion.span
                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                        style={{ skewX: "-20deg" }}
                        initial={{ left: "-33%" }}
                        animate={{ left: "133%" }}
                        transition={{
                          duration: 1,
                          delay: 0.8,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    </motion.span>

                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Ajout...
                      </span>
                    ) : addedToCart ? (
                      <motion.span
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 15,
                        }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Ajout&eacute; !
                      </motion.span>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                        <span className="mt-0.5">Ajouter au panier</span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* 9. Reassurance — compact horizontal strip */}
                <div className="pt-4">
                  <ReassuranceSection />
                </div>

                {/* 10. Separator */}
                <div className="border-t border-zinc-100 mt-2" />

                {/* 10. Accordions: Description / Caractéristiques / Specs */}
                <div className="rounded-2xl border border-zinc-100 overflow-hidden">
                  <div className="divide-y divide-zinc-200 px-4">
                    {/* Description — open by default */}
                    <Accordion title="Description">
                      {renderDescriptionContent()}
                    </Accordion>

                    {/* Caractéristiques */}
                    {features.length > 0 && (
                      <Accordion title="Caractéristiques">
                        <div className="rounded-xl border border-zinc-200 overflow-hidden">
                          {features.map((feat, i) => {
                            const colonIdx = feat.indexOf(" : ");
                            const isKeyValue = colonIdx > 0 && colonIdx < 30;
                            return (
                              <div
                                key={i}
                                className={`flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-4 px-5 py-3.5 transition-colors ${i % 2 === 0 ? "bg-[#FAFAFA]" : "bg-white"
                                  } ${i < features.length - 1 ? "border-b border-zinc-100" : ""}`}
                              >
                                {isKeyValue ? (
                                  <>
                                    <span className="text-[#6B7280] font-medium text-[13px] leading-snug">
                                      {feat.substring(0, colonIdx)}
                                    </span>
                                    <span className="text-[#1A1A1A] font-bold text-[13px] text-right">
                                      {feat.substring(colonIdx + 3)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-zinc-700 font-medium text-xs flex items-center gap-2">
                                    <Check className="w-3.5 h-3.5 text-[#DB021D] flex-shrink-0" />
                                    {feat}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </Accordion>
                    )}

                    {/* Spécifications techniques */}
                    {(specsRows.length > 0 || technicalSpecs.length > 0) && (
                      <Accordion title="Spécifications techniques">
                        <div className="rounded-xl border border-zinc-200 overflow-hidden">
                          {(specsRows.length > 0
                            ? specsRows
                            : technicalSpecs
                          ).map((row, i) => (
                            <div
                              key={i}
                              className={`flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-4 px-5 py-3.5 transition-colors ${i % 2 === 0 ? "bg-[#FAFAFA]" : "bg-white"
                                } ${i <
                                  (specsRows.length > 0
                                    ? specsRows
                                    : technicalSpecs
                                  ).length -
                                  1
                                  ? "border-b border-zinc-100"
                                  : ""
                                }`}
                            >
                              <span className="text-[#6B7280] font-medium text-[13px] leading-snug">
                                {row.label}
                              </span>
                              <span className="text-[#1A1A1A] font-bold text-[13px] text-right">
                                {row.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Accordion>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Below-fold sections ── */}

        {/* Cross-Selling */}
        {relatedProducts.length > 0 && (
          <div className="bg-white">
            <CrossSellSection products={relatedProducts} />
          </div>
        )}
      </main>

      {/* Mobile Sticky Add to Cart Bar */}
      <StickyAddToCart
        productTitle={mainTitle}
        productImage={selectedVariant?.image?.url || images[0]?.url}
        variantId={selectedVariant?.id || ""}
        priceHT={parseFloat(price?.amount || "0")}
        compareAtPriceHT={
          compareAtPrice ? parseFloat(compareAtPrice.amount) : undefined
        }
        isAvailable={isAvailable}
        onAddToCart={handleAddToCart}
        mainButtonVisible={ctaInView}
      />
    </>
  );
}
