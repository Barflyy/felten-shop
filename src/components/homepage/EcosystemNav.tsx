'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ECOSYSTEMS = [
    {
        id: 'm12',
        name: 'M12™',
        desc: 'Léger & Compact',
        color: '#DB021D',
        url: '/collections/m12',
    },
    {
        id: 'm18',
        name: 'M18™',
        desc: 'Performance sur chantiers',
        color: '#DB021D',
        url: '/collections/m18',
    },
    {
        id: 'packout',
        name: 'PACKOUT™',
        desc: 'Rangement modulable',
        color: '#1A1A1A',
        url: '/collections/packout',
    },
    {
        id: 'mx-fuel',
        name: 'MX FUEL™',
        desc: 'Zéro émission',
        color: '#1A1A1A',
        url: '/collections/mx-fuel',
    },
];

export default function EcosystemNav() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-40px' });

    return (
        <section className="py-6 lg:py-10 bg-white border-b border-gray-100">
            <div className="max-w-[1280px] mx-auto px-0 lg:px-8">
                {/* Mobile: horizontal scroll strip */}
                <div
                    ref={ref}
                    className="flex gap-2.5 overflow-x-auto no-scrollbar px-5 pb-1 lg:pb-0 lg:px-0 lg:grid lg:grid-cols-4 lg:gap-4"
                >
                    {ECOSYSTEMS.map((eco, i) => (
                        <motion.div
                            key={eco.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                            className="shrink-0"
                        >
                            <Link
                                href={eco.url}
                                className={`group flex items-center gap-2.5 px-4 py-3 lg:flex-col lg:items-start lg:p-5 rounded-xl lg:rounded-2xl border-2 transition-all duration-300 whitespace-nowrap ${eco.id === 'm12' || eco.id === 'm18'
                                    ? 'border-[#DB021D]/10 hover:border-[#DB021D] hover:bg-[#DB021D]/[0.02]'
                                    : 'border-gray-100 hover:border-[#1A1A1A] hover:bg-gray-50'
                                    }`}
                            >
                                <h3
                                    className={`text-lg lg:text-2xl font-black italic tracking-wide transition-colors ${eco.id === 'm12' || eco.id === 'm18'
                                        ? 'text-[#DB021D] group-hover:text-[#B8011A]'
                                        : 'text-[#1A1A1A]'
                                        }`}
                                    style={{ fontFamily: 'var(--font-display)' }}
                                >
                                    {eco.name}
                                </h3>
                                <p className="text-[11px] lg:text-[13px] text-[#6B7280] font-semibold uppercase tracking-wider">
                                    {eco.desc}
                                </p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
