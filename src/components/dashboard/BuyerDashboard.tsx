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
import { cn } from '@/lib/utils';

interface BuyerDashboardProps {
  onNavigate: (view: string) => void;
}

export function BuyerDashboard({ onNavigate }: BuyerDashboardProps) {
  const { currentUser, matchRequests, activities } = useApp();

  const stats = [
    {
      title: 'Total Spent',
      value: '$0',
      change: '+0%',
      icon: DollarSign,
      color: 'text-[#1A2B4A]',
      bgColor: 'bg-[#1A2B4A]/10',
    },
    {
      title: 'Projects Completed',
      value: '0',
      change: '+0',
      icon: CheckCircle2,
      color: 'text-[#00B8A9]',
      bgColor: 'bg-[#00B8A9]/10',
    },
    {
      title: 'Active Projects',
      value: '0',
      change: '0 in progress',
      icon: Briefcase,
      color: 'text-[#F6A623]',
      bgColor: 'bg-[#F6A623]/10',
    },
    {
      title: 'Avg. Freelancer Rating',
      value: '0.0',
      change: 'No data',
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
              {(() => {
                const spendingByMonth = [
                  { month: 'Jan', amount: 0 },
                  { month: 'Feb', amount: 0 },
                  { month: 'Mar', amount: 0 },
                  { month: 'Apr', amount: 0 },
                  { month: 'May', amount: 0 },
                  { month: 'Jun', amount: 0 },
                ];
                return spendingByMonth.map((item: { month: string; amount: number }) => {
                  const maxAmount = Math.max(...spendingByMonth.map((r: { month: string; amount: number }) => r.amount), 1);
                  const height = (item.amount / maxAmount) * 100;
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-[#1A2B4A] to-[#2A4B6A] rounded-t-lg transition-all hover:from-[#0A1B3A] hover:to-[#1A3B5A]"
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

        {/* Category Breakdown */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-display">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const categoryBreakdown = [
                { category: 'Development', amount: 0 },
                { category: 'Design', amount: 0 },
                { category: 'Marketing', amount: 0 },
              ];
              const totalSpent = 1;
              return categoryBreakdown.map((cat: { category: string; amount: number }) => {
                const percentage = (cat.amount / totalSpent) * 100;
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
              });
            })()}
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
              <Badge variant="secondary">0</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active projects yet</p>
              <p className="text-sm">Post a request to get started</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onNavigate('post-request')}
            >
              Post New Request
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
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No freelancers yet</p>
              <p className="text-sm">Your favorite freelancers will appear here</p>
            </div>
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
            {matchRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No requests yet</p>
                <p className="text-sm">Post a request to find freelancers</p>
              </div>
            ) : (
              matchRequests.slice(0, 3).map((request) => (
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
