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
    <div className="inline-flex items-center border border-gray-200 rounded-lg h-12 lg:h-14">
      <button
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className="w-10 lg:w-12 h-full flex items-center justify-center text-[#9CA3AF] hover:text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Diminuer la quantité"
      >
        <Minus className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
      <span className="w-8 text-center font-semibold text-[14px] text-[#1A1A1A] tabular-nums select-none">
        {quantity}
      </span>
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="w-10 lg:w-12 h-full flex items-center justify-center text-[#9CA3AF] hover:text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Augmenter la quantité"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}
