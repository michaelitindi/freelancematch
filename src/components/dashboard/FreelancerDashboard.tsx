'use client';

import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Star, 
  Clock, 
  Briefcase, 
  ArrowUpRight,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface FreelancerDashboardProps {
  onNavigate: (view: string) => void;
}

export function FreelancerDashboard({ onNavigate }: FreelancerDashboardProps) {
  const { currentUser, isOnline, pendingMatches, activities, simulateMatch } = useApp();

  const stats = [
    {
      title: 'Total Revenue',
      value: '$0',
      change: '+0%',
      icon: DollarSign,
      color: 'text-[#00B8A9]',
      bgColor: 'bg-[#00B8A9]/10',
    },
    {
      title: 'Completion Rate',
      value: '0%',
      change: '+0%',
      icon: CheckCircle2,
      color: 'text-[#00B8A9]',
      bgColor: 'bg-[#00B8A9]/10',
    },
    {
      title: 'Average Rating',
      value: '0.0',
      change: '+0',
      icon: Star,
      color: 'text-[#F6A623]',
      bgColor: 'bg-[#F6A623]/10',
    },
    {
      title: 'Response Time',
      value: '0h',
      change: '0h',
      icon: Clock,
      color: 'text-[#1A2B4A]',
      bgColor: 'bg-[#1A2B4A]/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[#1A2B4A]">
            Welcome back, {currentUser?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your freelance business
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full",
            isOnline ? "bg-[#00B8A9]/10 text-[#00B8A9]" : "bg-muted text-muted-foreground"
          )}>
            <div className={cn(
              "h-2 w-2 rounded-full",
              isOnline ? "bg-[#00B8A9] animate-pulse" : "bg-muted-foreground"
            )} />
            <span className="text-sm font-medium">
              {isOnline ? 'Available for matches' : 'Offline'}
            </span>
          </div>
          {isOnline && (
            <Button 
              onClick={simulateMatch}
              className="bg-[#00B8A9] hover:bg-[#00A89A] text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Simulate Match
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="card-shadow hover:card-shadow-hover transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold font-mono">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 card-shadow">
          <CardHeader>
            <CardTitle className="font-display">Revenue Overview</CardTitle>
            <CardDescription>Your earnings over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {(() => {
                const revenueByMonth = [
                  { month: 'Jan', amount: 0 },
                  { month: 'Feb', amount: 0 },
                  { month: 'Mar', amount: 0 },
                  { month: 'Apr', amount: 0 },
                  { month: 'May', amount: 0 },
                  { month: 'Jun', amount: 0 },
                ];
                return revenueByMonth.map((item: { month: string; amount: number }, index: number) => {
                  const maxAmount = Math.max(...revenueByMonth.map((r: { month: string; amount: number }) => r.amount), 1);
                  const height = (item.amount / maxAmount) * 100;
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-[#00B8A9] to-[#00D4C4] rounded-t-lg transition-all hover:from-[#00A89A] hover:to-[#00C4B4]"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      />
                      <span className="text-xs text-muted-foreground font-medium">{item.month}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Pending Matches */}
        <Card className="card-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display">Pending Matches</CardTitle>
              <Badge className="bg-[#00B8A9]">{pendingMatches.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingMatches.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No pending matches</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Stay online to receive new matches
                </p>
              </div>
            ) : (
              pendingMatches.slice(0, 3).map((match) => (
                <div
                  key={match.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => onNavigate('matches')}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={match.buyerAvatar} />
                    <AvatarFallback>{match.buyerName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{match.buyerName}</p>
                    <p className="text-xs text-muted-foreground truncate">{match.category}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))
            )}
            {pendingMatches.length > 0 && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onNavigate('matches')}
              >
                View All Matches
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Projects & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <Card className="card-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display">Active Projects</CardTitle>
              <Badge variant="secondary">0</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active projects yet</p>
              <p className="text-sm">Projects will appear here when you get matched</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onNavigate('workspace')}
            >
              Open Project Workspace
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-display">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity, index) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="relative">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      activity.type === 'match' && 'bg-[#00B8A9]/10 text-[#00B8A9]',
                      activity.type === 'message' && 'bg-blue-100 text-blue-600',
                      activity.type === 'payment' && 'bg-green-100 text-green-600',
                      activity.type === 'rating' && 'bg-[#F6A623]/10 text-[#F6A623]',
                      activity.type === 'course_completed' && 'bg-purple-100 text-purple-600'
                    )}>
                      {activity.type === 'match' && <Zap className="h-4 w-4" />}
                      {activity.type === 'message' && <span className="text-xs">💬</span>}
                      {activity.type === 'payment' && <DollarSign className="h-4 w-4" />}
                      {activity.type === 'rating' && <Star className="h-4 w-4" />}
                      {activity.type === 'course_completed' && <span className="text-xs">🎓</span>}
                    </div>
                    {index < activities.slice(0, 5).length - 1 && (
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-full bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      <Card className="card-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display">Continue Learning</CardTitle>
              <CardDescription>Complete courses to unlock new categories</CardDescription>
            </div>
            <Button variant="outline" onClick={() => onNavigate('courses')}>
              View All Courses
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No courses in progress</p>
            <p className="text-sm">Browse courses to start learning</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
