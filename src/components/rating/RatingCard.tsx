'use client';

import React, { useState } from 'react';
import { Star, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface RatingCategory {
  id: string;
  label: string;
  value: number;
}

interface RatingCardProps {
  recipientName: string;
  recipientAvatar?: string;
  recipientRole: 'freelancer' | 'buyer';
  projectTitle: string;
  onSubmit: (rating: {
    overall: number;
    categories: RatingCategory[];
    feedback: string;
  }) => void;
  onSkip?: () => void;
}

export function RatingCard({
  recipientName,
  recipientAvatar,
  recipientRole,
  projectTitle,
  onSubmit,
  onSkip,
}: RatingCardProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [categories, setCategories] = useState<RatingCategory[]>(
    recipientRole === 'freelancer'
      ? [
          { id: 'communication', label: 'Communication', value: 0 },
          { id: 'quality', label: 'Quality of Work', value: 0 },
          { id: 'timeliness', label: 'Timeliness', value: 0 },
        ]
      : [
          { id: 'communication', label: 'Communication', value: 0 },
          { id: 'clarity', label: 'Project Clarity', value: 0 },
          { id: 'payment', label: 'Payment Promptness', value: 0 },
        ]
  );

  const handleCategoryRating = (categoryId: string, value: number) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, value } : cat
      )
    );
  };

  const handleSubmit = () => {
    onSubmit({
      overall: overallRating,
      categories,
      feedback,
    });
  };

  const isComplete = overallRating > 0 && categories.every(c => c.value > 0);

  return (
    <Card className="card-shadow max-w-lg mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-display text-[#1A2B4A]">
          Rate Your Experience
        </CardTitle>
        <CardDescription>
          How was your experience working on "{projectTitle}"?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recipient Info */}
        <div className="flex items-center justify-center gap-3 pb-4 border-b">
          <Avatar className="h-12 w-12">
            <AvatarImage src={recipientAvatar} alt={recipientName} />
            <AvatarFallback className="bg-[#1A2B4A] text-white">
              {recipientName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-[#1A2B4A]">{recipientName}</p>
            <p className="text-sm text-muted-foreground capitalize">{recipientRole}</p>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="text-center">
          <p className="text-sm font-medium text-[#1A2B4A] mb-3">Overall Rating</p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setOverallRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "h-10 w-10 transition-colors",
                    (hoveredRating || overallRating) >= star
                      ? "fill-[#F6A623] text-[#F6A623]"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {overallRating === 0 && "Click to rate"}
            {overallRating === 1 && "Poor"}
            {overallRating === 2 && "Fair"}
            {overallRating === 3 && "Good"}
            {overallRating === 4 && "Very Good"}
            {overallRating === 5 && "Excellent"}
          </p>
        </div>

        {/* Category Ratings */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-[#1A2B4A]">Rate by Category</p>
          {categories.map((category) => (
            <CategoryRating
              key={category.id}
              label={category.label}
              value={category.value}
              onChange={(value) => handleCategoryRating(category.id, value)}
            />
          ))}
        </div>

        {/* Written Feedback */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-[#1A2B4A]">Written Feedback (Optional)</p>
          </div>
          <Textarea
            placeholder={`Share your experience working with ${recipientName}...`}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {onSkip && (
            <Button variant="outline" onClick={onSkip}>
              Skip
            </Button>
          )}
          <Button
            className="flex-1 bg-[#1A2B4A] hover:bg-[#1A2B4A]/90"
            disabled={!isComplete}
            onClick={handleSubmit}
          >
            Submit Review
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface CategoryRatingProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function CategoryRating({ label, value, onChange }: CategoryRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "h-5 w-5 transition-colors",
                (hovered || value) >= star
                  ? "fill-[#F6A623] text-[#F6A623]"
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
