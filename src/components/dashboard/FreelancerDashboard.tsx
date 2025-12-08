'use client';

import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Star, 
  Clock, 
  Briefcase, 
  ArrowUpRight,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useApp } from '@/contexts/AppContext';
import { useProjects, useTransactions, useCourses } from '@/hooks/useApi';
import { cn } from '@/lib/utils';

interface FreelancerDashboardProps {
  onNavigate: (view: string) => void;
}

export function FreelancerDashboard({ onNavigate }: FreelancerDashboardProps) {
  const { currentUser, isOnline, pendingMatches, activities, simulateMatch } = useApp();
  const { projects, loading: projectsLoading, fetchProjects } = useProjects();
  const { transactions, summary, loading: transactionsLoading, fetchTransactions } = useTransactions();
  const { courses, progress, loading: coursesLoading, fetchCourses, fetchProgress } = useCourses();

  // Fetch data on mount
  useEffect(() => {
    fetchProjects();
    fetchTransactions();
    fetchCourses();
    fetchProgress();
  }, [fetchProjects, fetchTransactions, fetchCourses, fetchProgress]);

  // Calculate real stats from API data
  const totalRevenue = summary?.totalEarned || 0;
  const activeProjects = projects.filter((p: any) => p.status === 'in_progress');
  const completedProjects = projects.filter((p: any) => p.status === 'completed');
  const completionRate = projects.length > 0 
    ? Math.round((completedProjects.length / projects.length) * 100) 
    : 0;
  const avgRating = currentUser?.rating || 0;

  // Calculate revenue by month from transactions
  const revenueByMonth = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const now = new Date();
    const monthData = months.map((month, index) => {
      const monthIndex = (now.getMonth() - 5 + index + 12) % 12;
      const monthTransactions = transactions.filter((t: any) => {
        const txDate = new Date(t.created_at);
        return txDate.getMonth() === monthIndex && t.type === 'payment';
      });
      const amount = monthTransactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      return { month, amount };
    });
    return monthData;
  })();

  // Get courses in progress
  const coursesInProgress = progress.filter((p: any) => p.progress < 100);

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: '+0%',
      icon: DollarSign,
      color: 'text-[#00B8A9]',
      bgColor: 'bg-[#00B8A9]/10',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      change: '+0%',
      icon: CheckCircle2,
      color: 'text-[#00B8A9]',
      bgColor: 'bg-[#00B8A9]/10',
    },
    {
      title: 'Average Rating',
      value: avgRating.toFixed(1),
      change: '+0',
      icon: Star,
      color: 'text-[#F6A623]',
      bgColor: 'bg-[#F6A623]/10',
    },
    {
      title: 'Active Projects',
      value: activeProjects.length.toString(),
      change: `${completedProjects.length} completed`,
      icon: Briefcase,
      color: 'text-[#1A2B4A]',
      bgColor: 'bg-[#1A2B4A]/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* KYC Verification Banner */}
      {currentUser?.kyc_status !== 'approved' && (
        <Card className="border-[#F6A623] bg-[#F6A623]/5">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#F6A623]/10">
                  <Shield className="h-5 w-5 text-[#F6A623]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A2B4A] flex items-center gap-2">
                    Complete Identity Verification
                    <Badge variant="outline" className="border-[#F6A623] text-[#F6A623] text-xs">
                      Required
                    </Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Verify your identity to unlock all features, receive payments, and build trust with clients.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => onNavigate('kyc')}
                className="bg-[#F6A623] hover:bg-[#E59612] text-white shrink-0"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Complete KYC
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              {revenueByMonth.map((item: { month: string; amount: number }) => {
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
              })}
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
              <Badge variant="secondary">{activeProjects.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#00B8A9]" />
              </div>
            ) : activeProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active projects yet</p>
                <p className="text-sm">Projects will appear here when you get matched</p>
              </div>
            ) : (
              activeProjects.slice(0, 3).map((project: any) => (
                <div
                  key={project.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => onNavigate('workspace')}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{project.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{project.category}</p>
                  </div>
                  <Badge variant="outline" className="border-[#00B8A9] text-[#00B8A9]">
                    In Progress
                  </Badge>
                </div>
              ))
            )}
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
          {coursesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#00B8A9]" />
            </div>
          ) : coursesInProgress.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No courses in progress</p>
              <p className="text-sm">Browse courses to start learning</p>
            </div>
          ) : (
            <div className="space-y-4">
              {coursesInProgress.slice(0, 3).map((courseProgress: any) => {
                const course = courses.find((c: any) => c.id === courseProgress.course_id);
                if (!course) return null;
                return (
                  <div
                    key={courseProgress.course_id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => onNavigate('courses')}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{course.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={courseProgress.progress || 0} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground font-mono">
                          {Math.round(courseProgress.progress || 0)}%
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
