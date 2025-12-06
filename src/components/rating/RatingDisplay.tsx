'use client';

import React from 'react';
import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface RatingBreakdown {
  category: string;
  score: number;
  trend?: 'up' | 'down' | 'stable';
}

interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  feedback: string;
  date: Date;
  projectTitle: string;
}

interface RatingDisplayProps {
  overallRating: number;
  totalReviews: number;
  breakdown: RatingBreakdown[];
  recentReviews?: Review[];
  ratingDistribution?: { stars: number; count: number }[];
}

export function RatingDisplay({
  overallRating,
  totalReviews,
  breakdown,
  recentReviews = [],
  ratingDistribution = [],
}: RatingDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Overall Rating Card */}
      <Card className="card-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center gap-8">
            {/* Main Score */}
            <div className="text-center">
              <div className="text-5xl font-bold text-[#1A2B4A] font-mono">
                {overallRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= Math.round(overallRating)
                        ? "fill-[#F6A623] text-[#F6A623]"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {totalReviews} reviews
              </p>
            </div>

            {/* Distribution */}
            {ratingDistribution.length > 0 && (
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const data = ratingDistribution.find(d => d.stars === stars);
                  const count = data?.count || 0;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-3">{stars}</span>
                      <Star className="h-4 w-4 fill-[#F6A623] text-[#F6A623]" />
                      <Progress value={percentage} className="h-2 flex-1" />
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="card-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-display text-[#1A2B4A]">
            Rating Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {breakdown.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{item.category}</span>
                  {item.trend && (
                    <TrendIndicator trend={item.trend} />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= Math.round(item.score)
                            ? "fill-[#F6A623] text-[#F6A623]"
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-mono font-medium text-[#1A2B4A] w-8">
                    {item.score.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      {recentReviews.length > 0 && (
        <Card className="card-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-display text-[#1A2B4A]">
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TrendIndicator({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') {
    return (
      <div className="flex items-center gap-0.5 text-[#00B8A9]">
        <TrendingUp className="h-3 w-3" />
      </div>
    );
  }
  if (trend === 'down') {
    return (
      <div className="flex items-center gap-0.5 text-[#D63031]">
        <TrendingDown className="h-3 w-3" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0.5 text-muted-foreground">
      <Minus className="h-3 w-3" />
    </div>
  );
}

function ReviewItem({ review }: { review: Review }) {
  return (
    <div className="border-b last:border-0 pb-4 last:pb-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-[#1A2B4A]">{review.reviewerName}</p>
          <p className="text-xs text-muted-foreground">{review.projectTitle}</p>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-4 w-4",
                star <= review.rating
                  ? "fill-[#F6A623] text-[#F6A623]"
                  : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{review.feedback}</p>
      <p className="text-xs text-muted-foreground mt-2">
        {review.date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>
    </div>
  );
}
