'use client';

import React, { useState, useEffect } from 'react';
import {
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  User,
  Calendar,
  MessageSquare,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface FlaggedReview {
  id: string;
  project_id: string;
  project_title: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  reviewee_id: string;
  reviewee_name: string;
  reviewee_avatar?: string;
  overall_rating: number;
  feedback: string;
  flag_reason: string;
  status: string;
  created_at: string;
}

interface ReviewModerationQueueProps {
  moderatorId: string;
}

export function ReviewModerationQueue({ moderatorId }: ReviewModerationQueueProps) {
  const [reviews, setReviews] = useState<FlaggedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<FlaggedReview | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/moderation/reviews');
      const data = await response.json() as FlaggedReview[];
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch flagged reviews:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModerate = async (action: 'approve' | 'reject') => {
    if (!selectedReview) return;
    
    setIsProcessing(true);
    try {
      await fetch(`/api/moderation/reviews/${selectedReview.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          moderationNotes,
          moderatorId,
        }),
      });
      
      // Remove from list
      setReviews(reviews.filter(r => r.id !== selectedReview.id));
      setSelectedReview(null);
      setModerationNotes('');
      setActionType(null);
    } catch (error) {
      console.error('Failed to moderate review:', error);
    }
    setIsProcessing(false);
  };

  const openModerationDialog = (review: FlaggedReview, action: 'approve' | 'reject') => {
    setSelectedReview(review);
    setActionType(action);
    setModerationNotes('');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'h-4 w-4',
              star <= rating ? 'fill-[#F6A623] text-[#F6A623]' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B8A9]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-[#1A2B4A]">
            Review Moderation Queue
          </h2>
          <p className="text-muted-foreground">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} pending moderation
          </p>
        </div>
        <Button variant="outline" onClick={fetchReviews} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-[#00B8A9] mb-4" />
            <h3 className="text-lg font-semibold text-[#1A2B4A]">All caught up!</h3>
            <p className="text-muted-foreground">No reviews pending moderation</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="border-l-4 border-l-[#F6A623]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    {/* Flag Reason */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-[#F6A623]/10 text-[#F6A623] border-[#F6A623]/30">
                        <Flag className="h-3 w-3 mr-1" />
                        {review.flag_reason}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Reviewer & Reviewee */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.reviewer_avatar} />
                          <AvatarFallback className="bg-[#1A2B4A] text-white text-xs">
                            {review.reviewer_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{review.reviewer_name}</p>
                          <p className="text-xs text-muted-foreground">Reviewer</p>
                        </div>
                      </div>
                      <div className="text-muted-foreground">→</div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.reviewee_avatar} />
                          <AvatarFallback className="bg-[#00B8A9] text-white text-xs">
                            {review.reviewee_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{review.reviewee_name}</p>
                          <p className="text-xs text-muted-foreground">Reviewee</p>
                        </div>
                      </div>
                    </div>

                    {/* Rating & Project */}
                    <div className="flex items-center gap-4">
                      {renderStars(review.overall_rating)}
                      <span className="text-sm text-muted-foreground">
                        for <span className="font-medium text-[#1A2B4A]">{review.project_title}</span>
                      </span>
                    </div>

                    {/* Feedback */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{review.feedback}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      className="bg-[#00B8A9] hover:bg-[#00A89A] text-white gap-2"
                      onClick={() => openModerationDialog(review, 'approve')}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#D63031] text-[#D63031] hover:bg-[#D63031]/10 gap-2"
                      onClick={() => openModerationDialog(review, 'reject')}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Moderation Dialog */}
      <Dialog open={!!selectedReview && !!actionType} onOpenChange={() => {
        setSelectedReview(null);
        setActionType(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-[#00B8A9]" />
                  Approve Review
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-[#D63031]" />
                  Reject Review
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'This review will be published and visible to the reviewee.'
                : 'This review will be removed and the reviewer will be notified.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Moderation Notes (Optional)</Label>
              <Textarea
                placeholder={
                  actionType === 'approve'
                    ? 'Add any notes about why this review was approved...'
                    : 'Explain why this review is being rejected...'
                }
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedReview(null);
                setActionType(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleModerate(actionType!)}
              disabled={isProcessing}
              className={cn(
                actionType === 'approve'
                  ? 'bg-[#00B8A9] hover:bg-[#00A89A]'
                  : 'bg-[#D63031] hover:bg-[#D63031]/90',
                'text-white'
              )}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {actionType === 'approve' ? 'Approve Review' : 'Reject Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
