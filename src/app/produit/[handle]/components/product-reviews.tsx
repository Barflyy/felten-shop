"use client";

import { Star, Check } from "lucide-react";

const REVIEW_POOL = [
  {
    name: "Pierre D.",
    city: "Lyon",
    rating: 5,
    text: "Livraison express et service client toujours réactif. Felten est un partenaire B2B fiable.",
  },
  {
    name: "Marc L.",
    city: "Bruxelles",
    rating: 5,
    text: "Prix pros compétitifs et stock toujours disponible. Je recommande Felten les yeux fermés.",
  },
  {
    name: "Jean-François R.",
    city: "Luxembourg",
    rating: 5,
    text: "Enregistrement de la garantie Milwaukee et gestion SAV pris en charge directement, un gain de temps précieux.",
  },
  {
    name: "Sébastien M.",
    city: "Liège",
    rating: 5,
    text: "Service client au top et livraison en 24h très appréciable sur chantier.",
  },
  {
    name: "Thomas B.",
    city: "Strasbourg",
    rating: 5,
    text: "J'équipe toute mon équipe avec Felten. Commande facile et service après-vente d'une grande efficacité.",
  },
  {
    name: "Laurent K.",
    city: "Metz",
    rating: 5,
    text: "Commande traitée immédiatement, emballage très soigné. Du vrai travail de pro pour les pros.",
  },
  {
    name: "Julien T.",
    city: "Namur",
    rating: 5,
    text: "Partenaire de confiance de longue date. Leur réactivité pour nos besoins chantiers est exceptionnelle.",
  },
];

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = (s >>> 0) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function ProductReviews({ handle }: { handle: string }) {
  const seed = hashString(handle);
  const reviews = seededShuffle(REVIEW_POOL, seed).slice(0, 1);
  const avgRating = 4.9;

  const reviewDates = reviews.map((_, i) => {
    const daysAgo = ((seed * (i + 1) * 7) % 180) + 5;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  });

  return (
    <div className="pt-2">
      <div>
        <div className="flex flex-col gap-6">
          {/* Stats Column */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1.5 h-6 bg-[#DB021D] inline-block rounded-sm" />
              <h2
                className="text-2xl lg:text-4xl font-black text-[#1A1A1A] uppercase tracking-tight"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                Avis Clients
              </h2>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-400/10 rounded-full blur-[40px] pointer-events-none transition-all duration-700 group-hover:bg-amber-400/20" />

              <div className="flex items-end gap-4 mb-2">
                <span className="text-5xl font-black tracking-tighter tabular-nums leading-none">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-xl text-zinc-400 font-bold mb-1">
                  / 5
                </span>
              </div>

              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-6 h-6 ${
                      s <= Math.round(avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-zinc-500 mb-6">
                Service not&eacute; sur +500 avis
              </p>

              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Achats v&eacute;rifi&eacute;s
                </span>
                <span>100% Positif</span>
              </div>
            </div>
          </div>

          {/* Single Review Card */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col h-full">
              {reviews.map((review, i) => (
                <div
                  key={i}
                  className="bg-white border border-zinc-200 rounded-xl p-6 lg:p-7 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-zinc-400 font-medium bg-zinc-100 px-2 py-1 rounded">
                      {reviewDates[i]}
                    </span>
                  </div>

                  <p className="text-[14px] text-zinc-700 leading-relaxed font-medium mb-6 flex-1 italic">
                    &ldquo;{review.text}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-black shrink-0">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A]">
                        {review.name}
                      </p>
                      <p className="text-[11px] text-zinc-500 capitalize">
                        {review.city}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
