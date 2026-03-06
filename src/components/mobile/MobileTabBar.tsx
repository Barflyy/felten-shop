'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Menu, ShoppingCart, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileTabBarProps {
    cartCount: number;
    onOpenMenu: () => void;
    onOpenSearch: () => void;
    onOpenCart: () => void;
}

export default function MobileTabBar({
    cartCount,
    onOpenMenu,
    onOpenSearch,
    onOpenCart,
}: MobileTabBarProps) {
    const pathname = usePathname();

    // Add padding to body so content isn't hidden behind the fixed tab bar
    useEffect(() => {
        document.body.style.paddingBottom = 'calc(64px + env(safe-area-inset-bottom))';
        return () => {
            document.body.style.paddingBottom = '';
        };
    }, []);

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white/90 backdrop-blur-xl border-t border-gray-100 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-around px-2 h-16">
                {/* Accueil */}
                <Link
                    href="/"
                    className={`flex items-center justify-center w-full h-full active:scale-90 transition-transform ${pathname === '/' ? 'text-[#DB021D]' : 'text-[#A1A1AA] hover:text-[#1A1A1A]'}`}
                >
                    <Home className="w-[26px] h-[26px]" strokeWidth={pathname === '/' ? 2.5 : 2} />
                </Link>

                {/* Recherche */}
                <button
                    onClick={onOpenSearch}
                    className="flex items-center justify-center w-full h-full active:scale-90 transition-transform text-[#A1A1AA] hover:text-[#1A1A1A]"
                >
                    <Search className="w-[26px] h-[26px]" strokeWidth={2} />
                </button>

                {/* Catalogue (Menu) */}
                <button
                    onClick={onOpenMenu}
                    className="flex items-center justify-center w-full h-full active:scale-90 transition-transform text-[#A1A1AA] hover:text-[#1A1A1A]"
                >
                    <Menu className="w-[28px] h-[28px]" strokeWidth={2} />
                </button>

                {/* Panier */}
                <button
                    onClick={onOpenCart}
                    className="relative flex items-center justify-center w-full h-full active:scale-90 transition-transform text-[#A1A1AA] hover:text-[#1A1A1A]"
                >
                    <div className="relative">
                        <ShoppingCart className="w-[26px] h-[26px]" strokeWidth={2} />
                        <AnimatePresence>
                            {cartCount > 0 && (
                                <motion.span
                                    key="cart-badge-tab"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="absolute -top-1.5 -right-2 w-[18px] h-[18px] bg-[#DB021D] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm"
                                >
                                    {cartCount > 9 ? '9+' : cartCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </button>

                {/* Compte */}
                <Link
                    href="/connexion"
                    className={`flex items-center justify-center w-full h-full active:scale-90 transition-transform ${pathname === '/connexion' || pathname === '/compte' ? 'text-[#DB021D]' : 'text-[#A1A1AA] hover:text-[#1A1A1A]'}`}
                >
                    <User className="w-[26px] h-[26px]" strokeWidth={pathname === '/connexion' || pathname === '/compte' ? 2.5 : 2} />
                </Link>
            </div>
        </div>
    );
}
