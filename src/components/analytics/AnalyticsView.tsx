'use client';

import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Star, 
  Clock, 
  Briefcase,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useApp } from '@/contexts/AppContext';
import { mockFreelancerAnalytics, mockBuyerAnalytics, mockFreelancers } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export function AnalyticsView() {
  const { currentRole } = useApp();

  if (currentRole === 'buyer') {
    return <BuyerAnalytics />;
  }

  return <FreelancerAnalytics />;
}

function FreelancerAnalytics() {
  const analytics = mockFreelancerAnalytics;

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${analytics.totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-[#00B8A9]',
      bgColor: 'bg-[#00B8A9]/10',
    },
    {
      title: 'Completion Rate',
      value: `${analytics.completionRate}%`,
      change: '+2.1%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'text-[#00B8A9]',
      bgColor: 'bg-[#00B8A9]/10',
    },
    {
      title: 'Average Rating',
      value: analytics.averageRating.toFixed(1),
      change: '+0.2',
      trend: 'up',
      icon: Star,
      color: 'text-[#F6A623]',
      bgColor: 'bg-[#F6A623]/10',
    },
    {
      title: 'Response Time',
      value: `${analytics.responseTime}h`,
      change: '-0.5h',
      trend: 'down',
      icon: Clock,
      color: 'text-[#1A2B4A]',
      bgColor: 'bg-[#1A2B4A]/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-[#1A2B4A]">
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your performance and earnings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    stat.trend === 'up' ? "text-[#00B8A9]" : "text-[#FF6B6B]"
                  )}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-display">Revenue Trend</CardTitle>
            <CardDescription>Monthly earnings over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.revenueByMonth.map((item) => {
                const maxAmount = Math.max(...analytics.revenueByMonth.map(r => r.amount));
                const height = (item.amount / maxAmount) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      ${(item.amount / 1000).toFixed(1)}k
                    </span>
                    <div 
                      className="w-full bg-gradient-to-t from-[#00B8A9] to-[#00D4C4] rounded-t-lg transition-all hover:from-[#00A89A] hover:to-[#00C4B4]"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground font-medium">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Rating Trend */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-display">Rating Trend</CardTitle>
            <CardDescription>Your average rating over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-muted-foreground">
                <span>5.0</span>
                <span>4.5</span>
                <span>4.0</span>
              </div>
              {/* Chart area */}
              <div className="ml-8 h-full flex items-end justify-between gap-4 pb-8">
                {analytics.ratingTrend.map((item, index) => {
                  const height = ((item.rating - 4) / 1) * 100;
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full flex justify-center">
                        <div 
                          className="w-3 h-3 rounded-full bg-[#F6A623] relative z-10"
                          style={{ marginBottom: `${height}%` }}
                        />
                        {index < analytics.ratingTrend.length - 1 && (
                          <div className="absolute top-1.5 left-1/2 w-full h-0.5 bg-[#F6A623]/30" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium mt-auto">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-display">Job Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#00B8A9]/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-[#00B8A9]" />
                </div>
                <div>
                  <p className="font-medium">Total Jobs</p>
                  <p className="text-sm text-muted-foreground">All time</p>
                </div>
              </div>
              <span className="text-2xl font-bold font-mono">{analytics.totalJobs}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#F6A623]/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-[#F6A623]" />
                </div>
                <div>
                  <p className="font-medium">Active Jobs</p>
                  <p className="text-sm text-muted-foreground">In progress</p>
                </div>
              </div>
              <span className="text-2xl font-bold font-mono">{analytics.activeJobs}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Completed</p>
                  <p className="text-sm text-muted-foreground">Successfully delivered</p>
                </div>
              </div>
              <span className="text-2xl font-bold font-mono">
                {analytics.totalJobs - analytics.activeJobs}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 card-shadow">
          <CardHeader>
            <CardTitle className="font-display">Performance Metrics</CardTitle>
            <CardDescription>Key indicators of your freelance success</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-sm font-mono text-[#00B8A9]">{analytics.completionRate}%</span>
              </div>
              <Progress value={analytics.completionRate} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">On-Time Delivery</span>
                <span className="text-sm font-mono text-[#00B8A9]">95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Client Satisfaction</span>
                <span className="text-sm font-mono text-[#00B8A9]">98%</span>
              </div>
              <Progress value={98} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Repeat Clients</span>
                <span className="text-sm font-mono text-[#00B8A9]">42%</span>
              </div>
              <Progress value={42} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BuyerAnalytics() {
  const analytics = mockBuyerAnalytics;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-[#1A2B4A]">
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your spending and project performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-[#1A2B4A]/10">
                <DollarSign className="h-5 w-5 text-[#1A2B4A]" />
              </div>
              <Badge variant="secondary">+8.2%</Badge>
            </div>
            <p className="text-2xl font-bold font-mono">${analytics.totalSpent.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-[#00B8A9]/10">
                <CheckCircle2 className="h-5 w-5 text-[#00B8A9]" />
              </div>
              <Badge variant="secondary">+3</Badge>
            </div>
            <p className="text-2xl font-bold font-mono">{analytics.projectsCompleted}</p>
            <p className="text-sm text-muted-foreground">Projects Completed</p>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-[#F6A623]/10">
                <Briefcase className="h-5 w-5 text-[#F6A623]" />
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <p className="text-2xl font-bold font-mono">{analytics.activeProjects}</p>
            <p className="text-sm text-muted-foreground">Active Projects</p>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-[#FF6B6B]/10">
                <Users className="h-5 w-5 text-[#FF6B6B]" />
              </div>
              <Badge variant="secondary">Top Talent</Badge>
            </div>
            <p className="text-2xl font-bold font-mono">{analytics.favoriteFreelancers.length}</p>
            <p className="text-sm text-muted-foreground">Favorite Freelancers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Chart */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-display">Spending Trend</CardTitle>
            <CardDescription>Monthly spending over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.spendingByMonth.map((item) => {
                const maxAmount = Math.max(...analytics.spendingByMonth.map(r => r.amount));
                const height = (item.amount / maxAmount) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      ${(item.amount / 1000).toFixed(1)}k
                    </span>
                    <div 
                      className="w-full bg-gradient-to-t from-[#1A2B4A] to-[#2A4B6A] rounded-t-lg transition-all hover:from-[#0A1B3A] hover:to-[#1A3B5A]"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground font-medium">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-display">Spending by Category</CardTitle>
            <CardDescription>Where your budget goes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.categoryBreakdown.map((cat, index) => {
              const percentage = (cat.amount / analytics.totalSpent) * 100;
              const colors = ['bg-[#00B8A9]', 'bg-[#1A2B4A]', 'bg-[#F6A623]', 'bg-[#FF6B6B]'];
              return (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{cat.category}</span>
                    <span className="font-mono text-muted-foreground">
                      ${cat.amount.toLocaleString()} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", colors[index % colors.length])}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Favorite Freelancers */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="font-display">Top Freelancers</CardTitle>
          <CardDescription>Freelancers you&apos;ve worked with most</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockFreelancers.slice(0, 3).map((freelancer) => (
              <div
                key={freelancer.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={freelancer.avatar} />
                  <AvatarFallback>{freelancer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{freelancer.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {freelancer.categories?.[0]}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-[#F6A623] fill-[#F6A623]" />
                    <span className="text-xs font-mono">{freelancer.rating}</span>
                    <span className="text-xs text-muted-foreground">
                      • {freelancer.totalJobs} jobs
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
