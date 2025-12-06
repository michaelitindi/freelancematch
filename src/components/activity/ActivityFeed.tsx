'use client';

import React from 'react';
import {
  Zap,
  MessageSquare,
  DollarSign,
  Star,
  CheckCircle,
  BookOpen,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Activity } from '@/types';

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onActivityClick?: (activity: Activity) => void;
}

export function ActivityFeed({
  activities,
  maxItems = 10,
  showViewAll = true,
  onViewAll,
  onActivityClick,
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'match':
        return { icon: Zap, color: 'text-[#00B8A9]', bgColor: 'bg-[#00B8A9]/10' };
      case 'message':
        return { icon: MessageSquare, color: 'text-blue-500', bgColor: 'bg-blue-100' };
      case 'payment':
        return { icon: DollarSign, color: 'text-green-500', bgColor: 'bg-green-100' };
      case 'rating':
        return { icon: Star, color: 'text-[#F6A623]', bgColor: 'bg-[#F6A623]/10' };
      case 'job_completed':
        return { icon: CheckCircle, color: 'text-[#00B8A9]', bgColor: 'bg-[#00B8A9]/10' };
      case 'course_completed':
        return { icon: BookOpen, color: 'text-purple-500', bgColor: 'bg-purple-100' };
      default:
        return { icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted' };
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display text-[#1A2B4A]">
            Activity Feed
          </CardTitle>
          {showViewAll && activities.length > maxItems && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-1">
            {displayedActivities.map((activity, index) => {
              const { icon: Icon, color, bgColor } = getActivityIcon(activity.type);
              const isLast = index === displayedActivities.length - 1;

              return (
                <div
                  key={activity.id}
                  className={cn(
                    "flex gap-4 py-3 cursor-pointer hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors",
                    !isLast && "border-b border-border/50"
                  )}
                  onClick={() => onActivityClick?.(activity)}
                >
                  <div className="relative">
                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", bgColor)}>
                      <Icon className={cn("h-5 w-5", color)} />
                    </div>
                    {!isLast && (
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-[calc(100%+4px)] bg-border/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm text-[#1A2B4A]">{activity.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                    {activity.metadata && (
                      <div className="flex items-center gap-2 mt-2">
                        {activity.metadata.amount !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            {`$${(Number(activity.metadata.amount)).toLocaleString()}`}
                          </Badge>
                        )}
                        {activity.metadata.rating !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1 fill-[#F6A623] text-[#F6A623]" />
                            {Number(activity.metadata.rating)}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for sidebars
export function ActivityFeedCompact({
  activities,
  maxItems = 5,
}: {
  activities: Activity[];
  maxItems?: number;
}) {
  const displayedActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'match':
        return { icon: Zap, color: 'text-[#00B8A9]' };
      case 'message':
        return { icon: MessageSquare, color: 'text-blue-500' };
      case 'payment':
        return { icon: DollarSign, color: 'text-green-500' };
      case 'rating':
        return { icon: Star, color: 'text-[#F6A623]' };
      case 'job_completed':
        return { icon: CheckCircle, color: 'text-[#00B8A9]' };
      case 'course_completed':
        return { icon: BookOpen, color: 'text-purple-500' };
      default:
        return { icon: Clock, color: 'text-muted-foreground' };
    }
  };

  return (
    <div className="space-y-3">
      {displayedActivities.map((activity) => {
        const { icon: Icon, color } = getActivityIcon(activity.type);

        return (
          <div key={activity.id} className="flex items-center gap-3">
            <Icon className={cn("h-4 w-4", color)} />
            <p className="text-sm text-muted-foreground truncate flex-1">
              {activity.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}
