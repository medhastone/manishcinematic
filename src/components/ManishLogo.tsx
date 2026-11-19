'use client';

import React from 'react';
import { Play } from 'lucide-react';

interface ManishLogoProps {
  compact?: boolean;
}

export function ManishLogo({ compact = false }: ManishLogoProps) {
  return (
    <span className="inline-flex flex-col leading-none select-none shrink-0">
      <span className="inline-flex items-center gap-1.5">
        <span
          className={`font-display font-black italic tracking-wider text-white ${
            compact ? 'text-lg' : 'text-xl sm:text-2xl'
          }`}
        >
          MANISH
        </span>
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm bg-[#e10600]/15 border border-[#e10600]/60">
          <Play
            className="w-3 h-3 text-[#e10600] fill-[#e10600] translate-x-[0.5px]"
            aria-hidden="true"
          />
        </span>
      </span>
      <span
        className={`font-display font-extrabold italic tracking-[0.28em] text-[#e10600] mt-0.5 ${
          compact ? 'text-[10px]' : 'text-[11px]'
        }`}
      >
        CINEMATIC
      </span>
    </span>
  );
}
