'use client';

import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Video,
  Calendar,
  MoreVertical,
  Plus,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Milestone {
  id: string;
  title: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'paid';
  dueDate?: Date;
}

interface Deliverable {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: Date;
  status: 'pending_review' | 'approved' | 'revision_requested';
  version: number;
}

interface ProjectWorkspaceProps {
  projectId: string;
  projectTitle: string;
  description: string;
  freelancer: {
    id: string;
    name: string;
    avatar?: string;
  };
  buyer: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: 'in_progress' | 'review' | 'revision' | 'completed';
  milestones: Milestone[];
  deliverables: Deliverable[];
  totalBudget: number;
  currentUserRole: 'freelancer' | 'buyer';
  onMessageClick?: () => void;
  onVideoCallClick?: () => void;
}

export function ProjectWorkspace({
  projectTitle,
  description,
  freelancer,
  buyer,
  status,
  milestones,
  deliverables,
  totalBudget,
  currentUserRole,
  onMessageClick,
  onVideoCallClick,
}: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const completedMilestones = milestones.filter(m => m.status === 'completed' || m.status === 'paid').length;
  const progress = (completedMilestones / milestones.length) * 100;
  const paidAmount = milestones
    .filter(m => m.status === 'paid')
    .reduce((sum, m) => sum + m.amount, 0);

  const statusConfig = {
    in_progress: { label: 'In Progress', color: 'bg-[#00B8A9]', icon: Clock },
    review: { label: 'Under Review', color: 'bg-[#F6A623]', icon: AlertCircle },
    revision: { label: 'Revision Requested', color: 'bg-[#FF6B6B]', icon: RefreshCw },
    completed: { label: 'Completed', color: 'bg-[#00B8A9]', icon: CheckCircle },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card-shadow">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn("text-white", statusConfig[status].color)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[status].label}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-[#1A2B4A] font-display mb-2">
                {projectTitle}
              </h1>
              <p className="text-muted-foreground">{description}</p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onMessageClick}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" size="sm" onClick={onVideoCallClick}>
                <Video className="h-4 w-4 mr-2" />
                Video Call
              </Button>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                <AvatarFallback className="bg-[#1A2B4A] text-white">
                  {freelancer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-[#1A2B4A]">{freelancer.name}</p>
                <p className="text-xs text-muted-foreground">Freelancer</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={buyer.avatar} alt={buyer.name} />
                <AvatarFallback className="bg-[#00B8A9] text-white">
                  {buyer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-[#1A2B4A]">{buyer.name}</p>
                <p className="text-xs text-muted-foreground">Buyer</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Progress Card */}
          <Card className="card-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display text-[#1A2B4A]">
                Project Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {completedMilestones} of {milestones.length} milestones completed
                  </span>
                  <span className="font-medium text-[#1A2B4A]">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="text-lg font-bold text-[#00B8A9] font-mono">
                      ${paidAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="text-lg font-bold text-[#1A2B4A] font-mono">
                      ${totalBudget.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="card-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display text-[#1A2B4A]">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem
                  icon={Upload}
                  title="New deliverable uploaded"
                  description="Homepage Design v2.pdf"
                  time="2 hours ago"
                />
                <ActivityItem
                  icon={MessageSquare}
                  title="New message"
                  description={`${freelancer.name} sent a message`}
                  time="5 hours ago"
                />
                <ActivityItem
                  icon={CheckCircle}
                  title="Milestone completed"
                  description="Initial Design Phase"
                  time="1 day ago"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="mt-6">
          <Card className="card-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display text-[#1A2B4A]">
                  Milestones
                </CardTitle>
                {currentUserRole === 'buyer' && (
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Milestone
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <MilestoneItem
                    key={milestone.id}
                    milestone={milestone}
                    index={index}
                    currentUserRole={currentUserRole}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliverables" className="mt-6">
          <Card className="card-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display text-[#1A2B4A]">
                  Deliverables
                </CardTitle>
                {currentUserRole === 'freelancer' && (
                  <Button size="sm" className="bg-[#1A2B4A] hover:bg-[#1A2B4A]/90">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload File
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {deliverables.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No deliverables uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliverables.map((deliverable) => (
                    <DeliverableItem
                      key={deliverable.id}
                      deliverable={deliverable}
                      currentUserRole={currentUserRole}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ActivityItem({
  icon: Icon,
  title,
  description,
  time,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1A2B4A]">{title}</p>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
    </div>
  );
}

function MilestoneItem({
  milestone,
  index,
  currentUserRole,
}: {
  milestone: Milestone;
  index: number;
  currentUserRole: 'freelancer' | 'buyer';
}) {
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-muted text-muted-foreground' },
    in_progress: { label: 'In Progress', color: 'bg-[#00B8A9]/10 text-[#00B8A9]' },
    completed: { label: 'Completed', color: 'bg-[#F6A623]/10 text-[#F6A623]' },
    paid: { label: 'Paid', color: 'bg-[#00B8A9] text-white' },
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border hover:border-[#00B8A9]/50 transition-colors">
      <div className="h-8 w-8 rounded-full bg-[#1A2B4A] text-white flex items-center justify-center text-sm font-medium">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#1A2B4A]">{milestone.title}</p>
        {milestone.dueDate && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Calendar className="h-3 w-3" />
            Due {milestone.dueDate.toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="font-bold text-[#1A2B4A] font-mono">${milestone.amount.toLocaleString()}</p>
        <Badge className={cn("mt-1", statusConfig[milestone.status].color)}>
          {statusConfig[milestone.status].label}
        </Badge>
      </div>
      {currentUserRole === 'buyer' && milestone.status === 'completed' && (
        <Button size="sm" className="bg-[#00B8A9] hover:bg-[#00B8A9]/90">
          Release
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>
  );
}

function DeliverableItem({
  deliverable,
  currentUserRole,
}: {
  deliverable: Deliverable;
  currentUserRole: 'freelancer' | 'buyer';
}) {
  const statusConfig = {
    pending_review: { label: 'Pending Review', color: 'bg-[#F6A623]/10 text-[#F6A623]' },
    approved: { label: 'Approved', color: 'bg-[#00B8A9]/10 text-[#00B8A9]' },
    revision_requested: { label: 'Revision Requested', color: 'bg-[#FF6B6B]/10 text-[#FF6B6B]' },
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border hover:border-[#00B8A9]/50 transition-colors">
      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
        <FileText className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#1A2B4A] truncate">{deliverable.name}</p>
        <p className="text-xs text-muted-foreground">
          {deliverable.size} • v{deliverable.version} • {deliverable.uploadedAt.toLocaleDateString()}
        </p>
      </div>
      <Badge className={statusConfig[deliverable.status].color}>
        {statusConfig[deliverable.status].label}
      </Badge>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon">
          <Download className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Download</DropdownMenuItem>
            {currentUserRole === 'buyer' && deliverable.status === 'pending_review' && (
              <>
                <DropdownMenuItem className="text-[#00B8A9]">Approve</DropdownMenuItem>
                <DropdownMenuItem className="text-[#FF6B6B]">Request Revision</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
