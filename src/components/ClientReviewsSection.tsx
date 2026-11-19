'use client';

import React, { useMemo, useState } from 'react';
import {
  Star,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquareQuote,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { StudioTestimonial } from '@/src/types/studio';

export interface DisplayReview {
  id: number;
  clientName: string;
  clientRole: string;
  eventLocation: string;
  quote: string;
  rating: number;
}

interface ClientReviewsSectionProps {
  reviews: DisplayReview[];
  onReviewAdded: (newReview: StudioTestimonial) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Needs Improvement',
  2: 'Fair',
  3: 'Good Experience',
  4: 'Great Experience',
  5: 'Outstanding!',
};

const SHOOT_TYPES = [
  'Wedding Photography',
  'Pre-Wedding Shoot',
  'Cinematic Wedding Film',
  'Studio Portrait Shoot',
  'Traditional Videography',
  'Short Film / Reel',
];

function getInitials(name: string): string {
  const parts = name
    .replace(/&/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'MC';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function ClientReviewsSection({
  reviews,
  onReviewAdded,
}: ClientReviewsSectionProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [clientName, setClientName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [shootType, setShootType] = useState<string>('Wedding Photography');
  const [comment, setComment] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const [starFilter, setStarFilter] = useState<'all' | '5' | '4' | '3below'>('all');
  const [showAll, setShowAll] = useState<boolean>(false);

  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return { avg: '5.0', count: 0, fiveStarCount: 0 };
    }
    const total = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    const fiveStarCount = reviews.filter((r) => (r.rating || 5) === 5).length;
    return {
      avg: (total / reviews.length).toFixed(1),
      count: reviews.length,
      fiveStarCount,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const stars = r.rating || 5;
      if (starFilter === '5') return stars === 5;
      if (starFilter === '4') return stars === 4;
      if (starFilter === '3below') return stars <= 3;
      return true;
    });
  }, [reviews, starFilter]);

  const visibleReviews = showAll ? filteredReviews : filteredReviews.slice(0, 6);
  const activeStarValue = hoverRating || rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanName = clientName.trim();
    const cleanAddress = address.trim();
    const cleanComment = comment.trim();

    if (cleanName.length < 2) {
      setErrorMsg('Please enter your name (at least 2 characters).');
      return;
    }
    if (cleanAddress.length < 2) {
      setErrorMsg('Please enter your address or city (e.g., Teghra, Begusarai).');
      return;
    }
    if (cleanComment.length < 5) {
      setErrorMsg('Please share a brief comment about your experience.');
      return;
    }

    setSubmitting(true);
    try {
      let savedReview: StudioTestimonial | null = null;
      let shouldFallbackToLocal = false;

      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientName: cleanName,
            address: cleanAddress,
            shootType,
            comment: cleanComment,
            rating,
          }),
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.status === 404 || res.status === 405 || !contentType.includes('application/json')) {
          shouldFallbackToLocal = true;
        } else {
          const data = await res.json();
          if (!res.ok) {
            setErrorMsg(data.error || 'Unable to submit review. Please try again.');
            return;
          }
          savedReview = data.review || null;
        }
      } catch {
        shouldFallbackToLocal = true;
      }

      if (shouldFallbackToLocal || !savedReview) {
        const safeRating = Math.min(5, Math.max(1, Math.round(rating)));
        savedReview = {
          id: Date.now(),
          clientName: cleanName,
          clientRole: shootType || 'Client Review',
          eventLocation: cleanAddress,
          quote: cleanComment,
          outcomeStat: `${safeRating}★ Client Review`,
          rating: safeRating,
          featured: true,
        };
        try {
          const existingRaw = window.localStorage.getItem('mc_local_reviews');
          const existing: StudioTestimonial[] = existingRaw ? JSON.parse(existingRaw) : [];
          window.localStorage.setItem(
            'mc_local_reviews',
            JSON.stringify([savedReview, ...existing].slice(0, 30))
          );
        } catch {
          // Ignore storage quota errors
        }
      }

      if (savedReview) {
        onReviewAdded(savedReview);
      }

      setClientName('');
      setAddress('');
      setComment('');
      setRating(5);
      setHoverRating(0);
      setStarFilter('all');
      setSuccessMsg('Thank you! Your review has been published.');
    } catch {
      setErrorMsg('Unable to save your review right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="reviews"
      className="py-20 lg:py-24 border-b border-white/10 bg-[#0d0d0d]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section Header + Live Rating Summary */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-script text-2xl text-[#e10600]">Words From Our Clients</p>
            <h2
              className="font-display font-black italic uppercase text-3xl sm:text-5xl text-white mt-1 tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Client Reviews &amp; Ratings
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-white/10 bg-[#121212]">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black italic text-3xl sm:text-4xl text-white tabular-nums">
                {stats.avg}
              </span>
              <span className="text-xs text-neutral-400">/ 5.0</span>
            </div>
            <div className="h-9 w-px bg-white/10 hidden sm:block" />
            <div>
              <div className="flex items-center gap-1" aria-label={`Average rating ${stats.avg} out of 5`}>
                {[1, 2, 3, 4, 5].map((starNum) => (
                  <Star
                    key={starNum}
                    className={`w-4 h-4 ${
                      starNum <= Math.round(Number(stats.avg))
                        ? 'text-[#e10600] fill-[#e10600]'
                        : 'text-neutral-600'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-xs text-neutral-400 mt-1 tabular-nums">
                Based on <span className="text-white font-semibold">{stats.count}</span>{' '}
                {stats.count === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
        </div>

        {/* Two-Column Layout: Write a Review Form + Live Reviews Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Add Your Review Form */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 rounded-3xl border border-white/15 bg-[#121212] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#e10600]/15 border border-[#e10600]/40 text-[#e10600] flex items-center justify-center shrink-0">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-extrabold italic uppercase text-xl text-white leading-tight">
                  Share Your Experience
                </h3>
                <p className="text-xs text-neutral-400">
                  Rate our studio and leave your feedback below
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Interactive Star Rating Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Your Rating <span className="text-[#e10600]">*</span>
                  </label>
                  <span className="text-xs font-semibold text-[#e10600]">
                    {activeStarValue} / 5 · {RATING_LABELS[activeStarValue]}
                  </span>
                </div>
                <div
                  role="radiogroup"
                  aria-label="Select star rating from 1 to 5"
                  onMouseLeave={() => setHoverRating(0)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-[#0a0a0a] border border-white/10"
                >
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isFilled = starValue <= activeStarValue;
                    return (
                      <button
                        key={starValue}
                        type="button"
                        role="radio"
                        aria-checked={rating === starValue}
                        aria-label={`${starValue} ${starValue === 1 ? 'star' : 'stars'}`}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onClick={() => setRating(starValue)}
                        className="p-1.5 rounded-lg transition-transform hover:scale-115 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e10600]"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            isFilled
                              ? 'text-[#e10600] fill-[#e10600] drop-shadow-[0_0_8px_rgba(225,6,0,0.45)]'
                              : 'text-neutral-600 hover:text-neutral-400'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Client Name */}
              <div>
                <label
                  htmlFor="review-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5"
                >
                  Your Name <span className="text-[#e10600]">*</span>
                </label>
                <input
                  id="review-name"
                  type="text"
                  required
                  maxLength={80}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Rahul & Anjali Verma"
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/15 focus:border-[#e10600] focus:outline-none text-sm text-white placeholder:text-neutral-500 transition-colors"
                />
              </div>

              {/* Client Address */}
              <div>
                <label
                  htmlFor="review-address"
                  className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5"
                >
                  Address / City <span className="text-[#e10600]">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="review-address"
                    type="text"
                    required
                    maxLength={120}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Ayodhya Chowk, Teghra, Begusarai"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/15 focus:border-[#e10600] focus:outline-none text-sm text-white placeholder:text-neutral-500 transition-colors"
                  />
                </div>
              </div>

              {/* Shoot Type (Optional) */}
              <div>
                <label
                  htmlFor="review-shoot-type"
                  className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5"
                >
                  Shoot / Service
                </label>
                <select
                  id="review-shoot-type"
                  value={shootType}
                  onChange={(e) => setShootType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/15 focus:border-[#e10600] focus:outline-none text-sm text-white transition-colors"
                >
                  {SHOOT_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-[#121212] text-white">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comment */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="review-comment"
                    className="text-xs font-semibold uppercase tracking-wider text-neutral-300"
                  >
                    Your Comments <span className="text-[#e10600]">*</span>
                  </label>
                  <span className="text-[11px] text-neutral-500 tabular-nums">
                    {comment.length} / 600
                  </span>
                </div>
                <textarea
                  id="review-comment"
                  required
                  rows={4}
                  maxLength={600}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your shoot, photo quality, team behavior, or film delivery..."
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/15 focus:border-[#e10600] focus:outline-none text-sm text-white placeholder:text-neutral-500 resize-none transition-colors"
                />
              </div>

              {/* Status Feedback */}
              {errorMsg && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#e10600]/15 border border-[#e10600]/45 text-xs text-red-200"
                >
                  <AlertCircle className="w-4 h-4 text-[#e10600] shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div
                  role="status"
                  className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#e10600] hover:bg-[#c50500] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_24px_rgba(225,6,0,0.3)]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing Review...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post Client Review
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Filterable Client Reviews List */}
          <div className="lg:col-span-7 space-y-5">
            {/* Rating Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'all' as const, label: `All (${reviews.length})` },
                  { key: '5' as const, label: '5 Stars' },
                  { key: '4' as const, label: '4 Stars' },
                  { key: '3below' as const, label: '3 Stars & Below' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setStarFilter(tab.key);
                      setShowAll(false);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      starFilter === tab.key
                        ? 'bg-[#e10600] text-white'
                        : 'bg-[#121212] border border-white/10 text-neutral-300 hover:border-[#e10600]/60 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-neutral-500">Newest first</span>
            </div>

            {visibleReviews.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#121212] p-10 text-center">
                <p className="text-sm text-neutral-300 font-medium">
                  No reviews match this star filter yet.
                </p>
                <button
                  type="button"
                  onClick={() => setStarFilter('all')}
                  className="mt-3 text-xs font-semibold text-[#e10600] hover:underline"
                >
                  Show all client reviews
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleReviews.map((review) => {
                  const stars = Math.min(5, Math.max(1, review.rating || 5));
                  return (
                    <article
                      key={review.id}
                      className="rounded-2xl border border-white/10 hover:border-[#e10600]/45 bg-[#121212] p-6 flex flex-col justify-between gap-4 transition-colors"
                    >
                      <div className="space-y-3">
                        {/* Top row: Stars + Service label */}
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className="flex items-center gap-0.5"
                            aria-label={`Rated ${stars} out of 5 stars`}
                          >
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= stars
                                    ? 'text-[#e10600] fill-[#e10600]'
                                    : 'text-neutral-700'
                                }`}
                                aria-hidden="true"
                              />
                            ))}
                            <span className="ml-1.5 text-xs font-bold text-white tabular-nums">
                              {stars}.0
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                            {review.clientRole || 'Client Review'}
                          </span>
                        </div>

                        {/* Comment Quote */}
                        <p className="text-sm text-neutral-200 leading-relaxed">
                          &ldquo;{review.quote}&rdquo;
                        </p>
                      </div>

                      {/* Footer: Client Avatar + Name + Address */}
                      <div className="pt-3 border-t border-white/10 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#e10600]/15 border border-[#e10600]/40 text-[#e10600] font-display font-extrabold italic text-xs flex items-center justify-center shrink-0">
                          {getInitials(review.clientName)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-display font-bold italic text-sm text-white truncate">
                            {review.clientName}
                          </h4>
                          <p className="text-xs text-neutral-400 flex items-center gap-1 truncate mt-0.5">
                            <MapPin className="w-3 h-3 text-[#e10600] shrink-0" />
                            <span className="truncate">{review.eventLocation}</span>
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Show More / Show Less Toggle */}
            {filteredReviews.length > 6 && (
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 bg-[#121212] hover:border-[#e10600] text-xs font-semibold text-white transition-colors"
                >
                  {showAll ? (
                    <>
                      Show Fewer Reviews
                      <ChevronUp className="w-4 h-4 text-[#e10600]" />
                    </>
                  ) : (
                    <>
                      View All {filteredReviews.length} Reviews
                      <ChevronDown className="w-4 h-4 text-[#e10600]" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
