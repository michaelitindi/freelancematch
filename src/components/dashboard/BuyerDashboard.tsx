'use client';

import React from 'react';
import { 
  DollarSign, 
  Briefcase, 
  Star, 
  Users,
  ArrowUpRight,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useApp } from '@/contexts/AppContext';
import { mockBuyerAnalytics, mockProjects, mockFreelancers } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface BuyerDashboardProps {
  onNavigate: (view: string) => void;
}

export function BuyerDashboard({ onNavigate }: BuyerDashboardProps) {
  const { currentUser, matchRequests, activities } = useApp();
  const analytics = mockBuyerAnalytics;

  const stats = [
    {
      title: 'Total Spent',
      value: `$${analytics.totalSpent.toLocaleString()}`,
      change: '+8.2%',
      icon: DollarSign,
      color: 'text-[#1A2B4A]',
      bgColor: 'bg-[#1A2B4A]/10',
    },
    {
      title: 'Projects Completed',
      value: analytics.projectsCompleted.toString(),
      change: '+3',
      icon: CheckCircle2,
      color: 'text-[#00B8A9]',
      bgColor: 'bg-[#00B8A9]/10',
    },
    {
      title: 'Active Projects',
      value: analytics.activeProjects.toString(),
      change: '2 in progress',
      icon: Briefcase,
      color: 'text-[#F6A623]',
      bgColor: 'bg-[#F6A623]/10',
    },
    {
      title: 'Avg. Freelancer Rating',
      value: '4.8',
      change: 'Top talent',
      icon: Star,
      color: 'text-[#FF6B6B]',
      bgColor: 'bg-[#FF6B6B]/10',
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
            Manage your projects and find talented freelancers
          </p>
        </div>
        <Button 
          onClick={() => onNavigate('post-request')}
          className="bg-[#00B8A9] hover:bg-[#00A89A] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Post New Request
        </Button>
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
        {/* Spending Chart */}
        <Card className="lg:col-span-2 card-shadow">
          <CardHeader>
            <CardTitle className="font-display">Spending Overview</CardTitle>
            <CardDescription>Your spending over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.spendingByMonth.map((item) => {
                const maxAmount = Math.max(...analytics.spendingByMonth.map(r => r.amount));
                const height = (item.amount / maxAmount) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
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
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.categoryBreakdown.map((cat) => {
              const percentage = (cat.amount / analytics.totalSpent) * 100;
              return (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{cat.category}</span>
                    <span className="font-mono text-muted-foreground">
                      ${cat.amount.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Active Projects & Favorite Freelancers */}
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
              const freelancer = mockFreelancers.find(f => f.id === project.freelancerId);
              
              return (
                <div 
                  key={project.id} 
                  className="p-4 rounded-lg border bg-card hover:border-[#00B8A9]/50 transition-colors cursor-pointer"
                  onClick={() => onNavigate('workspace')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={freelancer?.avatar} />
                        <AvatarFallback>{freelancer?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{project.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          with {freelancer?.name}
                        </p>
                      </div>
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
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onNavigate('workspace')}
            >
              Open Project Workspace
            </Button>
          </CardContent>
        </Card>

        {/* Favorite Freelancers */}
        <Card className="card-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display">Top Freelancers</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Freelancers you&apos;ve worked with</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockFreelancers.slice(0, 3).map((freelancer) => (
              <div
                key={freelancer.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={freelancer.avatar} />
                  <AvatarFallback>{freelancer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{freelancer.name}</p>
                    {freelancer.isOnline && (
                      <div className="h-2 w-2 rounded-full bg-[#00B8A9]" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {freelancer.categories?.join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-[#F6A623] fill-[#F6A623]" />
                    <span className="font-mono text-sm">{freelancer.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {freelancer.totalJobs} jobs
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card className="card-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display">Recent Requests</CardTitle>
              <CardDescription>Your recent project requests</CardDescription>
            </div>
            <Button variant="outline" onClick={() => onNavigate('post-request')}>
              Post New Request
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matchRequests.slice(0, 3).map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{request.category}</Badge>
                    <Badge 
                      variant="outline"
                      className={cn(
                        request.status === 'pending' && 'border-[#F6A623] text-[#F6A623]',
                        request.status === 'matched' && 'border-[#00B8A9] text-[#00B8A9]'
                      )}
                    >
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {request.description}
                  </p>
                </div>
                <div className="text-right ml-4">
                  {request.budget && (
                    <p className="font-mono font-semibold">${request.budget.toLocaleString()}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
