"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Check,
  ShoppingCart,
  AlertTriangle,
  Phone,
} from "lucide-react";
import { Product } from "@/lib/shopify/types";
import { useCart } from "@/context/cart-context";
import { PriceDisplay } from "@/components/price-display";
import { StickyAddToCart } from "@/components/mobile/StickyAddToCart";

import { ImageGallery } from "./components/image-gallery";
import { Accordion } from "./components/accordion";
import { QuantitySelector } from "./components/quantity-selector";
import { CrossSellSection } from "./components/cross-sell-section";

import { parseDescriptionHtml, parseProductTitle } from "./lib/parse-product";
import { Zap, Battery, Crosshair } from "lucide-react";

function getShippingMessage(): string {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0=Sun, 6=Sat
  if (day >= 1 && day <= 5 && hour < 14) {
    return "Commandé avant 14h → expédié aujourd'hui";
  }
  return "Expédié sous 24-48h ouvrées";
}

function getBatteryPlatform(title: string, tags: string[]): string | null {
  const t = title.toUpperCase();
  const tagStr = tags.join(" ").toUpperCase();
  if (t.includes("MX FUEL") || tagStr.includes("MX FUEL") || tagStr.includes("MXFUEL")) return "MX FUEL";
  if (t.startsWith("M18") || t.includes(" M18") || tagStr.includes("M18")) return "M18";
  if (t.startsWith("M12") || t.includes(" M12") || tagStr.includes("M12")) return "M12";
  return null;
}

const USE_CASE_KEYWORDS: [string, string[]][] = [
  ["boulonneuse", ["Mécanique auto", "Maintenance industrielle", "Assemblage"]],
  ["visseuse à chocs", ["Construction", "Charpente", "Assemblage bois"]],
  ["perceuse", ["Aménagement intérieur", "Menuiserie", "Montage"]],
  ["meuleuse", ["Métallurgie", "Découpe", "Rénovation"]],
  ["scie circulaire", ["Menuiserie", "Charpente", "Second œuvre"]],
  ["scie sabre", ["Démolition", "Élagage", "Plomberie"]],
  ["scie", ["Menuiserie", "Charpente", "Second œuvre"]],
  ["perforateur", ["Maçonnerie", "Électricité", "Plomberie"]],
  ["aspirateur", ["Chantier", "Atelier", "Nettoyage industriel"]],
  ["éclairage", ["Chantier", "Intervention nocturne", "Atelier"]],
  ["lampe", ["Chantier", "Intervention nocturne", "Atelier"]],
  ["projecteur", ["Chantier", "Intervention nocturne", "Atelier"]],
  ["mesure", ["Chantier", "Topographie", "Aménagement"]],
  ["laser", ["Chantier", "Topographie", "Aménagement"]],
  ["batterie", ["Toutes vos machines Milwaukee", "Chantier", "Atelier"]],
  ["chargeur", ["Toutes vos machines Milwaukee", "Chantier", "Atelier"]],
  ["défonceuse", ["Menuiserie", "Ébénisterie", "Agencement"]],
  ["affleureuse", ["Menuiserie", "Ébénisterie", "Agencement"]],
  ["cliquet", ["Mécanique auto", "Plomberie", "Maintenance"]],
  ["riveteuse", ["Tôlerie", "CVC", "Assemblage métal"]],
  ["cloueuse", ["Charpente", "Menuiserie", "Agencement"]],
  ["décapeur", ["Rénovation", "Peinture", "Finitions"]],
  ["ponceuse", ["Menuiserie", "Rénovation", "Finitions"]],
  ["souffleur", ["Espaces verts", "Chantier", "Nettoyage"]],
  ["tronçonneuse", ["Élagage", "Espaces verts", "Bûcheronnage"]],
  ["taille-haie", ["Espaces verts", "Paysagisme", "Entretien"]],
  ["pompe", ["Plomberie", "Chantier", "Assainissement"]],
  ["presse", ["Plomberie", "CVC", "Électricité"]],
];

function getUseCases(title: string, productType: string): string[] | null {
  const searchStr = `${title} ${productType}`.toLowerCase();
  for (const [keyword, cases] of USE_CASE_KEYWORDS) {
    if (searchStr.includes(keyword)) return cases;
  }
  return null;
}

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
  const [ctaInView, setCtaInView] = useState(true);

  useEffect(() => {
    if (!ctaRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCtaInView(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, []);

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
  const variantOptionValue = selectedVariant?.selectedOptions?.[0]?.value || "";
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const baseUrl = (url: string) => url.split("?")[0];

    // 1. Try exact match on variant image URL
    if (variantImageUrl) {
      const idx = images.findIndex(
        (img) => baseUrl(img.url) === baseUrl(variantImageUrl),
      );
      if (idx !== -1) {
        setSelectedImageIndex(idx);
        return;
      }
    }

    // 2. Fallback: match variant option value in image filename
    if (variantOptionValue) {
      const normalized = variantOptionValue.replace(/\s+/g, "_");
      const idx = images.findIndex((img) =>
        baseUrl(img.url).includes(normalized),
      );
      if (idx !== -1) {
        setSelectedImageIndex(idx);
        return;
      }
    }

    setSelectedImageIndex(0);
  }, [variantImageUrl, variantOptionValue, images]);

  // ── Derived data ──
  const price = selectedVariant?.price || product.priceRange?.minVariantPrice;
  const compareAtPrice = selectedVariant?.compareAtPrice;

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

  const highlightSpecs = technicalSpecs.slice(0, 4);

  const contenuDeBoite = selectedVariant?.metafields?.find(
    (m) => m?.namespace === "custom" && m?.key === "contenu_de_boite",
  )?.value;

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

  // ── Render description content ──
  const renderDescriptionContent = () => (
    <div>
      {hasStructuredContent && intro ? (
        <div
          className="text-[13px] leading-relaxed text-[#6B7280] [&>p]:mb-0"
          dangerouslySetInnerHTML={{ __html: intro }}
        />
      ) : html ? (
        <div
          className="prose prose-sm max-w-none prose-p:text-[#6B7280] prose-p:leading-relaxed prose-strong:text-[#1A1A1A] prose-strong:font-semibold prose-ul:space-y-1.5 prose-li:text-[#6B7280] prose-li:leading-relaxed prose-li:marker:text-[#9CA3AF] prose-h3:text-[#1A1A1A] prose-h3:font-semibold prose-h3:text-sm prose-h3:border-b prose-h3:border-gray-100 prose-h3:pb-2 prose-h3:mt-5 prose-h3:mb-3 prose-h2:text-[#1A1A1A] prose-h2:font-semibold prose-h2:text-[15px] prose-h2:border-b prose-h2:border-gray-100 prose-h2:pb-2 prose-h2:mt-5 prose-h2:mb-3 prose-table:w-full prose-table:text-sm prose-table:border-collapse [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:border [&_table]:border-gray-100 [&_tr]:border-b [&_tr]:border-gray-50 [&_tr:last-child]:border-0 [&_tr:nth-child(even)]:bg-gray-50/50 [&_td]:px-4 [&_td]:py-2.5 [&_td:first-child]:font-medium [&_td:first-child]:text-[#1A1A1A] [&_td:last-child]:text-[#6B7280]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : product.description ? (
        <div className="space-y-3">
          {product.description
            .split(/\n\n|\.\s+/)
            .filter(Boolean)
            .map((paragraph, i) => (
              <p key={i} className="text-[#6B7280] text-[13px] leading-relaxed">
                {paragraph.trim().endsWith(".")
                  ? paragraph.trim()
                  : `${paragraph.trim()}.`}
              </p>
            ))}
        </div>
      ) : (
        <p className="text-[#9CA3AF] italic text-[13px]">
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
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 pt-3 lg:pt-6">
          {/* Breadcrumb (hidden, kept for SEO structured data) */}

          {/* ── Two-column layout ── */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-start">
            {/* LEFT: Sticky Gallery */}
            <div className="w-full lg:w-[55%] lg:sticky lg:top-20 lg:self-start">
              <ImageGallery
                images={images}
                title={product.title}
                selectedImageIndex={selectedImageIndex}
                onImageChange={setSelectedImageIndex}
                isNew={isNew}
              />
            </div>

            {/* RIGHT: Product Info */}
            <div className="w-full lg:w-[45%] pb-8">
              <div className="space-y-4 lg:space-y-5">
                {/* Product Type + SKU */}
                <div className="flex items-center gap-3">
                  {product.productType && (
                    <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
                      {product.productType}
                    </span>
                  )}
                  {selectedVariant?.sku && (
                    <span className="text-[11px] text-[#9CA3AF]">
                      Réf. {selectedVariant.sku}
                    </span>
                  )}
                </div>

                {/* Title */}
                <div>
                  <h1 className="text-[20px] lg:text-[26px] font-bold text-[#1A1A1A] leading-tight">
                    {mainTitle}
                  </h1>
                  {modelRef && (
                    <p className="text-[#9CA3AF] text-[13px] mt-1">
                      {modelRef}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <PriceDisplay
                    priceHT={price?.amount || "0"}
                    compareAtPriceHT={compareAtPrice?.amount}
                    size="lg"
                    showSavings={true}
                  />
                </div>

                {/* Availability */}
                <div className="flex items-center gap-2">
                  {isAvailable ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        En stock
                      </span>
                      <span className="text-[12px] text-[#6B7280]">
                        · {getShippingMessage()}
                      </span>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-red-500">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Rupture de stock
                    </span>
                  )}
                </div>

                {/* Version Filter: Standard / ONE-KEY */}
                {hasOneKeyVariants && hasStandardVariants && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-2 uppercase tracking-wider">
                      Version
                    </label>
                    <div className="inline-flex p-0.5 bg-[#F5F5F5] rounded-lg">
                      <button
                        onClick={() => setVariantFilter("standard")}
                        className={`px-4 py-2 text-[12px] font-semibold rounded-md transition-all ${variantFilter === "standard"
                          ? "bg-white text-[#1A1A1A] shadow-sm"
                          : "text-[#6B7280]"
                          }`}
                      >
                        Standard
                      </button>
                      <button
                        onClick={() => setVariantFilter("onekey")}
                        className={`px-4 py-2 text-[12px] font-semibold rounded-md transition-all ${variantFilter === "onekey"
                          ? "bg-white text-[#1A1A1A] shadow-sm"
                          : "text-[#6B7280]"
                          }`}
                      >
                        ONE-KEY&trade;
                      </button>
                    </div>
                  </div>
                )}

                {/* Variant Options */}
                {product.options &&
                  product.options.length > 0 &&
                  product.options[0].values.length > 1 && (
                    <div className="space-y-3">
                      {product.options.map((option) => {
                        const filteredValues = getFilteredOptionValues(
                          option.name,
                          option.values,
                        );
                        if (filteredValues.length <= 1) return null;

                        return (
                          <div key={option.name}>
                            <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-2 uppercase tracking-wider">
                              {option.name === "Modèle"
                                ? "Configuration"
                                : option.name}
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
                                    className={`px-3.5 py-2.5 text-[13px] font-medium rounded-lg border transition-all ${isSelected
                                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                                      : "bg-white text-[#4B5563] border-gray-200 hover:border-[#1A1A1A]"
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

                {/* Quantity + CTA */}
                <div ref={ctaRef} className="flex items-stretch gap-3 pt-1">
                  <QuantitySelector
                    quantity={quantity}
                    onChange={setQuantity}
                  />
                  <button
                    onClick={handleAddToCart}
                    disabled={!isAvailable || isLoading}
                    className={`relative flex-1 h-12 lg:h-14 font-semibold text-[14px] rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${addedToCart
                      ? "bg-emerald-500 text-white"
                      : "bg-[#DB021D] text-white hover:bg-[#B8011A] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                      }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Ajout...
                      </span>
                    ) : addedToCart ? (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Ajouté !
                      </span>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" strokeWidth={2} />
                        Ajouter au panier
                      </>
                    )}
                  </button>
                </div>

                {/* Reassurance */}
                <div className="flex items-center gap-4 lg:gap-5 flex-wrap pt-1 text-[11px] lg:text-[12px] text-[#9CA3AF]">
                  <span>Livraison 24h</span>
                  <span>Garantie 3 ans</span>
                  <span>SAV Expert</span>
                </div>

                {/* Use cases + Battery compatibility */}
                {(() => {
                  const platform = getBatteryPlatform(product.title, product.tags || []);
                  const useCases = getUseCases(product.title, product.productType || "");

                  if (!useCases && !platform) return null;

                  return (
                    <div className="space-y-2">
                      {useCases && (
                        <div className="flex items-start gap-2.5">
                          <Crosshair className="w-3.5 h-3.5 text-[#9CA3AF] mt-0.5 flex-shrink-0" strokeWidth={2} />
                          <p className="text-[12px] text-[#6B7280]">
                            <span className="font-medium text-[#4B5563]">Idéal pour :</span>{" "}
                            {useCases.join(", ")}
                          </p>
                        </div>
                      )}
                      {platform && (
                        <div className="flex items-start gap-2.5">
                          <Battery className="w-3.5 h-3.5 text-[#9CA3AF] mt-0.5 flex-shrink-0" strokeWidth={2} />
                          <p className="text-[12px] text-[#6B7280]">
                            <span className="font-medium text-[#4B5563]">Compatible</span> avec toutes vos batteries {platform} existantes
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Contact Florian */}
                <a
                  href="tel:+352621304952"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 bg-[#FAFAFA] hover:bg-[#F5F5F5] transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center text-[#9CA3AF]">
                    <img
                      src="/images/florian-avatar.jpg"
                      alt="Florian"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<span class="text-[13px] font-semibold text-[#6B7280]">FD</span>';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#1A1A1A] leading-tight">
                      Une question ? Appelez Florian
                    </p>
                    <p className="text-[11px] text-[#9CA3AF]">
                      +352 621 304 952 · Conseil gratuit
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
                  </div>
                </a>

                {/* Separator */}
                <div className="border-t border-gray-100" />

                {/* Accordions */}
                <div>
                  {contenuDeBoite && (
                    <Accordion title="Contenu de la boîte">
                      <div className="rounded-lg border border-gray-100 overflow-hidden">
                        {contenuDeBoite.split("\n").filter(Boolean).map((line, i, arr) => (
                          <div
                            key={i}
                            className={`flex items-center gap-3 px-4 py-3 ${i % 2 === 0 ? "bg-[#FAFAFA]" : "bg-white"} ${i < arr.length - 1 ? "border-b border-gray-50" : ""}`}
                          >
                            <Check className="w-3.5 h-3.5 text-[#9CA3AF] flex-shrink-0" />
                            <span className="text-[#4B5563] text-[13px]">{line.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </Accordion>
                  )}

                  <Accordion title="Description">
                    {renderDescriptionContent()}
                  </Accordion>

                  {features.length > 0 && (
                    <Accordion title="Caractéristiques">
                      <div className="rounded-lg border border-gray-100 overflow-hidden">
                        {features.map((feat, i) => {
                          const colonIdx = feat.indexOf(" : ");
                          const isKeyValue = colonIdx > 0 && colonIdx < 30;
                          return (
                            <div
                              key={i}
                              className={`flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-4 px-4 py-3 ${i % 2 === 0 ? "bg-[#FAFAFA]" : "bg-white"
                                } ${i < features.length - 1 ? "border-b border-gray-50" : ""}`}
                            >
                              {isKeyValue ? (
                                <>
                                  <span className="text-[#6B7280] text-[13px]">
                                    {feat.substring(0, colonIdx)}
                                  </span>
                                  <span className="text-[#1A1A1A] font-medium text-[13px]">
                                    {feat.substring(colonIdx + 3)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[#4B5563] text-[13px] flex items-center gap-2">
                                  <Check className="w-3.5 h-3.5 text-[#9CA3AF] flex-shrink-0" />
                                  {feat}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Accordion>
                  )}

                  {(specsRows.length > 0 || technicalSpecs.length > 0) && (
                    <Accordion title="Spécifications techniques">
                      <div className="rounded-lg border border-gray-100 overflow-hidden">
                        {(specsRows.length > 0
                          ? specsRows
                          : technicalSpecs
                        ).map((row, i) => (
                          <div
                            key={i}
                            className={`flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-4 px-4 py-3 ${i % 2 === 0 ? "bg-[#FAFAFA]" : "bg-white"
                              } ${i <
                                (specsRows.length > 0
                                  ? specsRows
                                  : technicalSpecs
                                ).length -
                                1
                                ? "border-b border-gray-50"
                                : ""
                              }`}
                          >
                            <span className="text-[#6B7280] text-[13px]">
                              {row.label}
                            </span>
                            <span className="text-[#1A1A1A] font-medium text-[13px]">
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
          </div>
        </div>

        {/* Cross-Selling */}
        {relatedProducts.length > 0 && (
          <CrossSellSection products={relatedProducts} />
        )}
      </main>

      {/* Mobile Sticky Add to Cart */}
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
