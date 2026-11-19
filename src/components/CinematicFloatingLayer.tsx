'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';

export function CinematicFloatingLayer() {
  const progressRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [cursorHovered, setCursorHovered] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Scroll Progress Bar
  useEffect(() => {
    const updateProgress = () => {
      if (!progressRef.current) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      progressRef.current.style.transform = `scaleX(${pct / 100})`;
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  // Desktop Custom Red Cursor
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (reduced || !finePointer) return;

    let rafId = 0;
    let targetX = -100;
    let targetY = -100;
    let ringX = -100;
    let ringY = -100;

    const handleMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setCursorVisible(true);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }
      const target = e.target as HTMLElement | null;
      const interactive = Boolean(
        target?.closest('a, button, input, select, textarea, [role="button"], .cursor-pointer')
      );
      setCursorHovered(interactive);
    };

    const handleLeave = () => setCursorVisible(false);

    const tick = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Google Maps Platform Demo Key Quota Listener (Tier 1)
  useEffect(() => {
    const w = window as unknown as { gm_authFailure?: () => void };
    w.gm_authFailure = () => {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    };

    const origError = console.error;
    console.error = (...args: unknown[]) => {
      origError.apply(console, args);
      const msg = args.map((a) => String(a)).join(' ');
      if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
    };

    const onQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);

    return () => {
      console.error = origError;
      window.removeEventListener('gmp-quota-exceeded', onQuota);
    };
  }, []);

  const whatsappHref = `https://wa.me/918210057153?text=${encodeURIComponent(
    'Hello Manish Cinematic! I would like to inquire about booking a wedding photography / cinematography shoot in Begusarai.'
  )}`;

  return (
    <>
      {/* Top Red Scroll Progress Bar */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[3px] z-[60] bg-white/5 pointer-events-none"
      >
        <div
          ref={progressRef}
          className="h-full w-full bg-[#e10600] origin-left"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Google Maps Quota Exceeded Banner (renders only if triggered) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Custom Desktop Red Cursor */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`hidden lg:block fixed top-0 left-0 -ml-1.5 -mt-1.5 w-3 h-3 rounded-full bg-[#e10600] pointer-events-none z-[70] transition-opacity duration-200 ${
          cursorVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`hidden lg:block fixed top-0 left-0 rounded-full border border-[#e10600]/70 pointer-events-none z-[69] transition-all duration-150 ${
          cursorVisible ? 'opacity-100' : 'opacity-0'
        } ${
          cursorHovered
            ? '-ml-6 -mt-6 w-12 h-12 bg-[#e10600]/15 border-[#e10600]'
            : '-ml-4 -mt-4 w-8 h-8 bg-transparent'
        }`}
      />

      {/* Fixed WhatsApp Floating Button (Bottom-Right) with Pulse Animation */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Manish Cinematic on WhatsApp"
        className="whatsapp-pulse fixed bottom-5 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
      >
        <MessageCircle className="w-7 h-7 fill-white text-white" />
      </a>
    </>
  );
}
