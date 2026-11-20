'use client';

import React, { useState } from 'react';
import { Camera } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  loading?: 'lazy' | 'eager';
}

const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/+$/, '');

function resolveAssetSrc(src: string): string {
  if (!src || !BASE_PATH) return src;
  if (src.startsWith('/') && !src.startsWith('//') && !src.startsWith(`${BASE_PATH}/`)) {
    return `${BASE_PATH}${src}`;
  }
  return src;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
  loading = 'lazy',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = resolveAssetSrc(src);

  if (hasError || !resolvedSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#4E0B1B] via-[#3E0815] to-[#2B060F] text-neutral-200 p-6 text-center ${className}`}
      >
        <Camera className="w-8 h-8 text-[#e10600] mb-2 stroke-[1.5]" />
        <span className="font-display italic text-sm tracking-wide text-white">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
