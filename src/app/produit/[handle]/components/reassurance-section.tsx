'use client';

import { Truck, Shield, Headphones, Package } from 'lucide-react';

const items = [
  { icon: Truck, label: 'Livraison 24h' },
  { icon: Shield, label: 'Garantie 3 ans' },
  { icon: Headphones, label: 'SAV Expert' },
  { icon: Package, label: '+5000 réf.' },
];

export function ReassuranceSection() {
  return (
    <div className="flex items-center gap-4 lg:gap-6 flex-wrap">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-zinc-500">
          <item.icon className="w-4 h-4 text-[#DB021D]" strokeWidth={2} />
          <span className="text-[11px] lg:text-[12px] font-semibold">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
