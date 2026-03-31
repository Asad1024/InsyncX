'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { addReview } from '@/actions/review.actions';
import { useToast } from '@/hooks/use-toast';
import { StarRating } from './StarRating';

export function AddReviewForm({ productId }: { productId: string }) {
  const { status } = useSession();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await addReview({ productId, rating, comment });
    if (res?.error) {
      toast({ title: res.error, variant: 'error' });
    } else {
      toast({ title: 'Review added', variant: 'success' });
      setComment('');
      setRating(5);
    }
    setLoading(false);
  };

  if (status !== 'authenticated') {
    return (
      <div className="card card-p-lg text-center">
        <h3 className="font-display font-normal text-[28px] text-[var(--text)] mb-2">
          Share Your Experience
        </h3>
        <p className="font-sans text-[13px] text-[var(--text-3)] mb-8">
          Only customers who purchased this product can leave a review
        </p>
        <p className="font-sans text-[14px] text-[var(--text-3)]">
          Please sign in to leave a review
        </p>
        <Link href="/auth/login" className="btn btn-primary btn-sm mt-3">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card card-p-lg mt-12">
      <h3 className="font-display font-normal text-[28px] text-[var(--text)] mb-2">
        Share Your Experience
      </h3>
      <p className="font-sans text-[13px] text-[var(--text-3)] mb-8">
        Only customers who purchased this product can leave a review
      </p>
      <div className="mb-6">
        <label className="input-label">Your Rating</label>
        <StarRating
          value={rating}
          size="lg"
          interactive
          onChange={setRating}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="review-comment" className="input-label">
          Comment (optional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product…"
          className="input min-h-[120px] resize-y"
          rows={4}
        />
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}
