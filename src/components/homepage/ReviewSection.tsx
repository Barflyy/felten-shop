'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { REVIEWS, RATING_DISTRIBUTION } from './data/constants';

export default function ReviewSection() {
  const [activeReviewSlide, setActiveReviewSlide] = useState(0);
  const reviewSliderRef = useRef<HTMLDivElement>(null);

  const handleReviewScroll = useCallback(() => {
    if (!reviewSliderRef.current) return;
    const { scrollLeft, offsetWidth } = reviewSliderRef.current;
    const cardWidth = offsetWidth * 0.75;
    setActiveReviewSlide(Math.round(scrollLeft / cardWidth));
  }, []);

  useEffect(() => {
    const el = reviewSliderRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleReviewScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleReviewScroll);
  }, [handleReviewScroll]);

  return (
    <section className="py-8 lg:py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <h2 className="text-[18px] lg:text-[26px] font-bold text-center mb-5 lg:mb-10 text-[#1A1A1A]">
          Ils nous font confiance
        </h2>

        <div className="md:flex md:gap-8 lg:gap-12">
          {/* Left: Aggregate */}
          <div className="md:w-1/3 mb-5 md:mb-0">
            {/* Mobile: compact inline bar */}
            <div className="md:hidden flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
              <div className="text-center">
                <span className="text-[32px] font-bold text-[#1A1A1A] leading-none block">
                  4.9
                </span>
                <div className="flex gap-0.5 justify-center mt-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3 h-3 text-[#FBBF24]" fill="#FBBF24" strokeWidth={0} />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-[#1A1A1A]">340 avis vérifiés</p>
                <div className="flex gap-1.5 mt-1">
                  <span className="text-[10px] text-[#6B7280] border border-gray-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4] flex-shrink-0" />
                    Google
                  </span>
                  <span className="text-[10px] text-[#6B7280] border border-gray-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00B67A] flex-shrink-0" />
                    Trustpilot
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop: full block */}
            <div className="hidden md:block bg-white rounded-lg p-6 border border-gray-100">
              <div className="text-center mb-4">
                <span className="text-[72px] font-bold text-[#1A1A1A] leading-none inline-block">
                  4.9
                </span>
                <div className="flex justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 text-[#FBBF24]" fill="#FBBF24" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-[13px] text-[#6B7280] mt-2">Basé sur 340 avis vérifiés</p>
              </div>
              <div className="space-y-2 mb-6">
                {RATING_DISTRIBUTION.map((r) => (
                  <div key={r.stars} className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-[#1A1A1A] w-4 text-right">{r.stars}</span>
                    <Star className="w-3 h-3 text-[#FBBF24]" fill="#FBBF24" strokeWidth={0} />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FBBF24] rounded-full"
                        style={{ width: `${r.percent}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[#6B7280] w-8">{r.percent}%</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-3">
                <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
                  Google
                </span>
                <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00B67A]" />
                  Trustpilot
                </span>
              </div>
            </div>
          </div>

          {/* Right: Reviews */}
          <div className="md:w-2/3">
            <div
              ref={reviewSliderRef}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 md:grid md:grid-cols-2 md:gap-4"
            >
              {REVIEWS.map((review, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[75vw] max-w-[300px] md:w-auto md:max-w-none snap-start bg-white rounded-lg p-4 lg:p-6 border border-gray-100 flex flex-col"
                >
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i <= review.rating ? 'text-[#F59E0B]' : 'text-gray-200'}`}
                        fill={i <= review.rating ? '#F59E0B' : '#e5e7eb'}
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                  <p className="text-[13px] lg:text-[14px] text-[#1A1A1A] leading-relaxed flex-grow mb-3">
                    &quot;{review.text}&quot;
                  </p>
                  <p className="text-[10px] text-[#6B7280] mb-2">Produit : {review.product}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[12px] lg:text-[13px] font-semibold text-[#1A1A1A] block">{review.name}</span>
                      <span className="text-[10px] lg:text-[11px] text-[#6B7280]">
                        {review.job} — {review.city}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      {review.verified && (
                        <span className="text-[9px] lg:text-[10px] font-semibold text-[#16A34A] flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                          Vérifié
                        </span>
                      )}
                      <span className="text-[9px] lg:text-[10px] text-[#6B7280] flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            review.source === 'Google' ? 'bg-[#4285F4]' : 'bg-[#00B67A]'
                          }`}
                        />
                        {review.source}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination dots (mobile) */}
            <div className="md:hidden flex justify-center gap-1.5 mt-4">
              {REVIEWS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === activeReviewSlide ? 'w-5 bg-[#DB021D]' : 'w-1.5 bg-[#D1D5DB]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
