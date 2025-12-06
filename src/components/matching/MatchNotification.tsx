'use client';

import React, { useEffect, useState } from 'react';
import { X, Check, Clock, Star, Briefcase, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

export function MatchNotification() {
  const { showMatchNotification, currentMatch, acceptMatch, declineMatch, dismissMatchNotification } = useApp();
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showMatchNotification) {
      setTimeLeft(60);
      // Animate in
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [showMatchNotification]);

  useEffect(() => {
    if (!showMatchNotification || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          declineMatch(currentMatch?.id || '');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showMatchNotification, timeLeft, currentMatch, declineMatch]);

  if (!showMatchNotification || !currentMatch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={cn(
          "w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 transform",
          isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A2B4A] to-[#2A3B5A] p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-5" />
          <button
            onClick={dismissMatchNotification}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-[#00B8A9] animate-pulse" />
            <span className="text-sm font-medium text-[#00B8A9]">New Match!</span>
          </div>
          
          <h2 className="text-2xl font-bold font-display mb-1">
            You&apos;ve Been Matched
          </h2>
          <p className="text-white/70 text-sm">
            A buyer is looking for your expertise
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Buyer Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-[#00B8A9]">
              <AvatarImage src={currentMatch.buyerAvatar} alt={currentMatch.buyerName} />
              <AvatarFallback>{currentMatch.buyerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{currentMatch.buyerName}</h3>
              <Badge variant="secondary" className="mt-1">
                {currentMatch.category}
              </Badge>
            </div>
          </div>

          {/* Project Description */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentMatch.description}
            </p>
          </div>

          {/* Match Reason */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Why You Were Matched
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Briefcase className="h-5 w-5 mx-auto mb-1 text-[#00B8A9]" />
                <div className="text-lg font-bold font-mono">{currentMatch.matchReason.categoryFit}%</div>
                <div className="text-xs text-muted-foreground">Category Fit</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Clock className="h-5 w-5 mx-auto mb-1 text-[#00B8A9]" />
                <div className="text-lg font-bold font-mono">{currentMatch.matchReason.availability}%</div>
                <div className="text-xs text-muted-foreground">Availability</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-[#00B8A9]" />
                <div className="text-lg font-bold font-mono">{currentMatch.matchReason.ratingTier}%</div>
                <div className="text-xs text-muted-foreground">Rating Tier</div>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Time to respond</span>
              <span className={cn(
                "font-mono font-bold",
                timeLeft <= 10 ? "text-[#FF6B6B]" : "text-[#1A2B4A]"
              )}>
                {timeLeft}s
              </span>
            </div>
            <Progress 
              value={(timeLeft / 60) * 100} 
              className="h-2"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => declineMatch(currentMatch.id)}
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
            <Button
              className="flex-1 h-12 bg-[#00B8A9] hover:bg-[#00A89A] text-white"
              onClick={() => acceptMatch(currentMatch.id)}
            >
              <Check className="h-4 w-4 mr-2" />
              Accept Match
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
