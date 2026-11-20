'use client';

import React, { useState } from 'react';
import { Camera } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
}

const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/+$/, '');

function withBasePath(path: string): string {
  if (!path || !BASE_PATH) return path;
  if (path.startsWith('/') && !path.startsWith('//') && !path.startsWith(`${BASE_PATH}/`)) {
    return `${BASE_PATH}${path}`;
  }
  return path;
}

/**
 * Automatically upgrades local studio JPEG assets to pre-compressed WebP equivalents
 * under /assets/opt/ while falling back to the original URL if ever unavailable.
 */
function toOptimizedWebpSrc(src: string): string {
  if (!src) return src;
  if (src === '/assets/cinema_hero_backdrop_1795170914610.jpg') {
    return '/assets/opt/cinema_hero_backdrop.webp';
  }
  const aiMatch = src.match(/^\/assets\/aistudio\/([^/]+)\.(jpg|jpeg|png)$/i);
  if (aiMatch) {
    return `/assets/opt/aistudio/${aiMatch[1]}.webp`;
  }
  return src;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
  loading = 'lazy',
  fetchPriority,
  srcSet,
  sizes,
  width,
  height,
}: ResilientImageProps) {
  const [useOriginalFallback, setUseOriginalFallback] = useState(false);
  const [hasError, setHasError] = useState(false);

  const optimizedSrc = toOptimizedWebpSrc(src);
  const activeSrc = withBasePath(useOriginalFallback ? src : optimizedSrc);

  const resolvedSrcSet =
    !useOriginalFallback && srcSet
      ? srcSet
          .split(',')
          .map((entry) => {
            const parts = entry.trim().split(/\s+/);
            if (!parts[0]) return entry;
            return [withBasePath(parts[0]), ...parts.slice(1)].join(' ');
          })
          .join(', ')
      : undefined;

  if (hasError || !activeSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#4E0B1B] via-[#3E0815] to-[#2B060F] text-neutral-200 p-6 text-center ${className}`}
      >
        <Camera className="w-8 h-8 text-[#F3D27A] mb-2 stroke-[1.5]" />
        <span className="font-display italic text-sm tracking-wide text-white">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={activeSrc}
      srcSet={resolvedSrcSet}
      sizes={resolvedSrcSet ? sizes : undefined}
      width={width}
      height={height}
      alt={alt}
      loading={loading}
      decoding={loading === 'eager' ? 'sync' : 'async'}
      fetchPriority={fetchPriority}
      referrerPolicy="no-referrer"
      onError={() => {
        if (!useOriginalFallback && optimizedSrc !== src) {
          setUseOriginalFallback(true);
        } else {
          setHasError(true);
        }
      }}
      className={className}
    />
  );
}
