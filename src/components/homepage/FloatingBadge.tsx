'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FloatingBadge() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show only after scrolling past the hero section
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="fixed bottom-6 left-6 z-50 hidden md:flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-[#DB021D]/20 cursor-pointer hover:border-[#DB021D] transition-colors"
                >
                    <div className="w-10 h-10 rounded-full bg-[#DB021D] flex items-center justify-center flex-shrink-0 shadow-inner">
                        <ShieldCheck className="w-5 h-5 text-white" strokeWidth={3} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[12px] font-black uppercase text-[#1A1A1A] tracking-wide leading-tight">
                            Revendeur Officiel
                        </span>
                        <span className="text-[11px] font-bold text-[#DB021D] uppercase tracking-wider">
                            Garantie 3 Ans
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
