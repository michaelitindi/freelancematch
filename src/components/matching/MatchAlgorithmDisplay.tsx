'use client';

import React from 'react';
import {
  Sparkles,
  Star,
  Clock,
  History,
  TrendingUp,
  Award,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MatchFactor {
  id: string;
  label: string;
  description: string;
  weight: number;
  score: number;
  icon: React.ElementType;
}

interface MatchAlgorithmDisplayProps {
  matchScore: number;
  factors: {
    categoryFit: number;
    availability: number;
    ratingTier: number;
    recency?: number;
  };
  isNewFreelancer?: boolean;
  consecutiveMatches?: number;
  className?: string;
}

export function MatchAlgorithmDisplay({
  matchScore,
  factors,
  isNewFreelancer = false,
  consecutiveMatches = 0,
  className,
}: MatchAlgorithmDisplayProps) {
  const matchFactors: MatchFactor[] = [
    {
      id: 'category',
      label: 'Category Fit',
      description: 'How well your skills match the project requirements',
      weight: 40,
      score: factors.categoryFit,
      icon: Sparkles,
    },
    {
      id: 'availability',
      label: 'Availability',
      description: 'Your current online status and workload capacity',
      weight: 30,
      score: factors.availability,
      icon: Clock,
    },
    {
      id: 'rating',
      label: 'Rating Tier',
      description: 'Your overall rating and review history',
      weight: 30,
      score: factors.ratingTier,
      icon: Star,
    },
  ];

  if (factors.recency !== undefined) {
    matchFactors.push({
      id: 'recency',
      label: 'Job Recency',
      description: 'Time since your last completed job',
      weight: 0,
      score: factors.recency,
      icon: History,
    });
  }

  const weightedScore = matchFactors.reduce((sum, f) => sum + (f.score * f.weight / 100), 0);

  return (
    <Card className={cn("card-shadow", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-display text-[#1A2B4A] flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#00B8A9]" />
              Match Analysis
            </CardTitle>
            <CardDescription>
              Why this match was made
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#1A2B4A] font-mono">
              {Math.round(matchScore)}%
            </p>
            <p className="text-xs text-muted-foreground">Match Score</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Boosts */}
        {(isNewFreelancer || consecutiveMatches >= 3) && (
          <div className="flex flex-wrap gap-2">
            {isNewFreelancer && (
              <Badge className="bg-[#00B8A9] text-white">
                <Award className="h-3 w-3 mr-1" />
                New Freelancer Boost (2x)
              </Badge>
            )}
            {consecutiveMatches >= 3 && (
              <Badge variant="outline" className="border-[#F6A623] text-[#F6A623]">
                <History className="h-3 w-3 mr-1" />
                Rotation Applied
              </Badge>
            )}
          </div>
        )}

        {/* Factor Breakdown */}
        <div className="space-y-4">
          {matchFactors.map((factor) => (
            <FactorItem key={factor.id} factor={factor} />
          ))}
        </div>

        {/* Algorithm Explanation */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-[#1A2B4A] text-sm mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            How Matching Works
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>Category Fit (40%):</strong> Skills alignment with project needs</li>
            <li>• <strong>Availability (30%):</strong> Online status and capacity</li>
            <li>• <strong>Rating Tier (30%):</strong> Historical performance</li>
            <li>• <strong>New Freelancer Boost:</strong> First 10 jobs get 2x priority</li>
            <li>• <strong>Rotation:</strong> After 3 consecutive matches, others get priority</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function FactorItem({ factor }: { factor: MatchFactor }) {
  const Icon = factor.icon;
  const scoreColor = factor.score >= 80 
    ? 'text-[#00B8A9]' 
    : factor.score >= 50 
      ? 'text-[#F6A623]' 
      : 'text-[#FF6B6B]';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-[#1A2B4A]">{factor.label}</span>
                {factor.weight > 0 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {factor.weight}%
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-[200px]">{factor.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className={cn("text-sm font-bold font-mono", scoreColor)}>
          {factor.score}%
        </span>
      </div>
      <Progress 
        value={factor.score} 
        className="h-2"
      />
    </div>
  );
}

// Compact version for match notifications
export function MatchScoreBadge({
  score,
  size = 'default',
}: {
  score: number;
  size?: 'sm' | 'default' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    default: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
  };

  const color = score >= 80 
    ? 'bg-[#00B8A9] text-white' 
    : score >= 50 
      ? 'bg-[#F6A623] text-white' 
      : 'bg-[#FF6B6B] text-white';

  return (
    <div className={cn(
      "rounded-full flex items-center justify-center font-bold font-mono",
      sizeClasses[size],
      color
    )}>
      {Math.round(score)}%
    </div>
  );
}
