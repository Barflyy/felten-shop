'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { REVIEWS, RATING_DISTRIBUTION } from './data/constants';

export default function ReviewSection() {
  const [activeReviewSlide, setActiveReviewSlide] = useState(0);
  const reviewSliderRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  const handleReviewScroll = useCallback(() => {
    if (!reviewSliderRef.current) return;
    const { scrollLeft, offsetWidth } = reviewSliderRef.current;
    const cardWidth = offsetWidth * 0.85;
    setActiveReviewSlide(Math.round(scrollLeft / cardWidth));
  }, []);

  useEffect(() => {
    const el = reviewSliderRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleReviewScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleReviewScroll);
  }, [handleReviewScroll]);

  return (
    <section className="pt-14 pb-12 lg:pt-24 lg:pb-20 bg-white">
      <div ref={sectionRef} className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-[1.75rem] lg:text-4xl font-black uppercase tracking-normal text-center mb-6 lg:mb-12"
        >
          ILS NOUS FONT CONFIANCE
        </motion.h2>

        <div className="md:flex md:gap-8 lg:gap-12">
          {/* Left 1/3: Aggregate */}
          <div className="md:w-1/3 mb-6 md:mb-0">
            {/* Mobile: compact inline bar */}
            <div className="md:hidden flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-center">
                <motion.span
                  className="text-[40px] font-black text-[#1A1A1A] leading-none block"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.6 }}
                >
                  4.9
                </motion.span>
                <div className="flex gap-0.5 justify-center mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-[#FBBF24]" fill="#FBBF24" strokeWidth={0} />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#1A1A1A]">340 avis vérifiés</p>
                <div className="flex gap-2 mt-1.5">
                  <span className="text-[11px] text-[#6B7280] border border-gray-200 px-2 py-1 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4] flex-shrink-0" />
                    Google
                  </span>
                  <span className="text-[11px] text-[#6B7280] border border-gray-200 px-2 py-1 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00B67A] flex-shrink-0" />
                    Trustpilot
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop: full block with distribution bars */}
            <div className="hidden md:block bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-center mb-4">
                <motion.span
                  className="text-[72px] font-black text-[#1A1A1A] leading-none inline-block"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  4.9
                </motion.span>
                <div className="flex justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 text-[#FBBF24]" fill="#FBBF24" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-[13px] text-[#6B7280] mt-2">Basé sur 340 avis vérifiés</p>
              </div>
              <div className="space-y-2 mb-6">
                {RATING_DISTRIBUTION.map((r, idx) => (
                  <div key={r.stars} className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-[#1A1A1A] w-4 text-right">{r.stars}</span>
                    <Star className="w-3 h-3 text-[#FBBF24]" fill="#FBBF24" strokeWidth={0} />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#FBBF24] rounded-full"
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${r.percent}%` } : {}}
                        transition={{ duration: 0.8, delay: 0.3 + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
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

          {/* Right 2/3: Reviews carousel */}
          <div className="md:w-2/3">
            <div
              ref={reviewSliderRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 md:grid md:grid-cols-2"
            >
              {REVIEWS.map((review, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 0.2 + index * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(0,0,0,0.07)' }}
                  className="flex-shrink-0 w-[85%] min-[480px]:w-[65%] md:w-auto snap-start bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col transition-shadow"
                >
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-[18px] h-[18px] ${i <= review.rating ? 'text-[#F59E0B]' : 'text-gray-200'}`}
                        fill={i <= review.rating ? '#F59E0B' : '#e5e7eb'}
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                  <p className="text-[14px] text-[#1A1A1A] leading-relaxed flex-grow mb-4">
                    &quot;{review.text}&quot;
                  </p>
                  <p className="text-[11px] text-[#6B7280] mb-3">Produit : {review.product}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-bold text-[#1A1A1A] block">{review.name}</span>
                      <span className="text-[11px] text-[#6B7280]">
                        {review.job} — {review.city}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      {review.verified && (
                        <span className="text-[10px] font-semibold text-[#16A34A] flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
                          Vérifié
                        </span>
                      )}
                      <span className="text-[10px] text-[#6B7280] flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            review.source === 'Google' ? 'bg-[#4285F4]' : 'bg-[#00B67A]'
                          }`}
                        />
                        {review.source} · {review.date}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination dots (mobile only) */}
            <div className="md:hidden flex justify-center gap-2 mt-5">
              {REVIEWS.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === activeReviewSlide ? 24 : 8,
                    backgroundColor: i === activeReviewSlide ? '#DB021D' : '#d1d5db',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="h-2 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
