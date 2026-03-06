'use client';

import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  return (
    <div className="inline-flex items-center bg-[#F9F9F9] border border-gray-200 rounded-xl h-14 lg:h-16">
      <button
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className="w-12 lg:w-14 h-full flex items-center justify-center text-zinc-500 hover:bg-gray-100 hover:text-[#1A1A1A] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors rounded-l-xl"
        aria-label="Diminuer la quantité"
      >
        <Minus className="w-4 h-4" strokeWidth={3} />
      </button>
      <span
        className="w-10 text-center font-black text-[16px] xl:text-[18px] text-[#1A1A1A] tabular-nums select-none"
        style={{ fontFamily: 'var(--font-oswald)' }}
      >
        {quantity}
      </span>
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="w-12 lg:w-14 h-full flex items-center justify-center text-zinc-500 hover:bg-gray-100 hover:text-[#1A1A1A] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors rounded-r-xl"
        aria-label="Augmenter la quantité"
      >
        <Plus className="w-4 h-4" strokeWidth={3} />
      </button>
    </div>
  );
}
