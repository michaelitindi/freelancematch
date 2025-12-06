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
import { mockFreelancerAnalytics, mockProjects, mockCourses } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface FreelancerDashboardProps {
  onNavigate: (view: string) => void;
}

export function FreelancerDashboard({ onNavigate }: FreelancerDashboardProps) {
  const { currentUser, isOnline, pendingMatches, activities, simulateMatch } = useApp();
  const analytics = mockFreelancerAnalytics;

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${analytics.totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-[#00B8A9]',
      bgColor: 'bg-[#00B8A9]/10',
    },
    {
      title: 'Completion Rate',
      value: `${analytics.completionRate}%`,
      change: '+2.1%',
      icon: CheckCircle2,
      color: 'text-[#00B8A9]',
      bgColor: 'bg-[#00B8A9]/10',
    },
    {
      title: 'Average Rating',
      value: analytics.averageRating.toFixed(1),
      change: '+0.2',
      icon: Star,
      color: 'text-[#F6A623]',
      bgColor: 'bg-[#F6A623]/10',
    },
    {
      title: 'Response Time',
      value: `${analytics.responseTime}h`,
      change: '-0.5h',
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
              {analytics.revenueByMonth.map((item, index) => {
                const maxAmount = Math.max(...analytics.revenueByMonth.map(r => r.amount));
                const height = (item.amount / maxAmount) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
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
              <Badge variant="secondary">{mockProjects.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockProjects.map((project) => {
              const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
              const progress = (completedMilestones / project.milestones.length) * 100;
              
              return (
                <div key={project.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{project.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${project.totalBudget.toLocaleString()} budget
                      </p>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={cn(
                        project.status === 'in_progress' && 'bg-[#00B8A9]/10 text-[#00B8A9]',
                        project.status === 'review' && 'bg-[#F6A623]/10 text-[#F6A623]'
                      )}
                    >
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-mono">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              );
            })}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockCourses.slice(0, 3).map((course) => {
              const completedModules = course.modules.filter(m => m.completed).length;
              const progress = (completedModules / course.modules.length) * 100;
              
              return (
                <div
                  key={course.id}
                  className="group relative overflow-hidden rounded-xl border bg-card hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => onNavigate('courses')}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-3 right-3 text-2xl">{course.badge}</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold mb-1">{course.title}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{course.duration}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-mono">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
