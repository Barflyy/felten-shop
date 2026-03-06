'use client';

import { Zap, Gauge, Ruler, Weight, RotateCcw, Flame, Layers } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Voltage: <Zap className="w-3.5 h-3.5" />,
  Couple: <Gauge className="w-3.5 h-3.5" />,
  Diamètre: <Ruler className="w-3.5 h-3.5" />,
  Poids: <Weight className="w-3.5 h-3.5" />,
  Vitesse: <RotateCcw className="w-3.5 h-3.5" />,
  Capacité: <Layers className="w-3.5 h-3.5" />,
  Énergie: <Flame className="w-3.5 h-3.5" />,
  Classe: <Layers className="w-3.5 h-3.5" />,
};

interface SpecBadgesProps {
  specs: { label: string; value: string }[];
}

export function SpecBadges({ specs }: SpecBadgesProps) {
  if (specs.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {specs.map((spec, i) => {
        const isVoltage = spec.label === 'Voltage';
        const icon = ICON_MAP[spec.label] || <Zap className="w-3.5 h-3.5" />;

        return (
          <span
            key={i}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
              isVoltage
                ? 'bg-[#DB021D] text-white'
                : 'bg-zinc-100 text-[#1A1A1A] border border-zinc-200'
            }`}
          >
            {icon}
            {spec.value}
          </span>
        );
      })}
    </div>
  );
}
