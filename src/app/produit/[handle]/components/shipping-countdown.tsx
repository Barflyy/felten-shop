'use client';

import { useState, useEffect } from 'react';
import { Clock, Truck } from 'lucide-react';

function getTimeUntilCutoff(): { hours: number; minutes: number; seconds: number; isPast: boolean } {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(14, 0, 0, 0);

    if (now >= cutoff) {
        return { hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    const diff = cutoff.getTime() - now.getTime();
    return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        isPast: false,
    };
}

export function ShippingCountdown() {
    const [time, setTime] = useState(getTimeUntilCutoff);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(getTimeUntilCutoff());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (time.isPast) {
        return (
            <p className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                Command&eacute; aujourd&apos;hui &rarr; exp&eacute;di&eacute; demain matin
            </p>
        );
    }

    return (
        <p className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>
                Commandez dans{' '}
                <span className="font-bold text-emerald-600 tabular-nums">
                    {pad(time.hours)}h{pad(time.minutes)}
                </span>
                {' '}pour une exp&eacute;dition aujourd&apos;hui
            </span>
        </p>
    );
}
