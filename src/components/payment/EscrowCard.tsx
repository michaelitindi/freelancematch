'use client';

import React from 'react';
import {
  Shield,
  Lock,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EscrowMilestone {
  id: string;
  title: string;
  amount: number;
  status: 'locked' | 'pending_release' | 'released';
}

interface EscrowCardProps {
  projectTitle: string;
  totalAmount: number;
  milestones: EscrowMilestone[];
  userRole: 'freelancer' | 'buyer';
  onRelease?: (milestoneId: string) => void;
  onDispute?: () => void;
}

export function EscrowCard({
  projectTitle,
  totalAmount,
  milestones,
  userRole,
  onRelease,
  onDispute,
}: EscrowCardProps) {
  const releasedAmount = milestones
    .filter(m => m.status === 'released')
    .reduce((sum, m) => sum + m.amount, 0);
  const pendingAmount = milestones
    .filter(m => m.status === 'pending_release')
    .reduce((sum, m) => sum + m.amount, 0);
  const lockedAmount = milestones
    .filter(m => m.status === 'locked')
    .reduce((sum, m) => sum + m.amount, 0);

  const progress = (releasedAmount / totalAmount) * 100;

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-display text-[#1A2B4A] flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#00B8A9]" />
              Escrow Protection
            </CardTitle>
            <CardDescription>{projectTitle}</CardDescription>
          </div>
          <Badge className="bg-[#00B8A9]/10 text-[#00B8A9]">
            <Lock className="h-3 w-3 mr-1" />
            Secured
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Released</p>
            <p className="text-lg font-bold text-[#00B8A9] font-mono">
              ${releasedAmount.toLocaleString()}
            </p>
          </div>
          <div className="text-center border-x">
            <p className="text-xs text-muted-foreground mb-1">Pending</p>
            <p className="text-lg font-bold text-[#F6A623] font-mono">
              ${pendingAmount.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Locked</p>
            <p className="text-lg font-bold text-[#1A2B4A] font-mono">
              ${lockedAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment Progress</span>
            <span className="font-medium text-[#1A2B4A]">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <MilestoneEscrowItem
              key={milestone.id}
              milestone={milestone}
              userRole={userRole}
              onRelease={onRelease}
            />
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-[#00B8A9]/5 border border-[#00B8A9]/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-[#00B8A9] mt-0.5" />
            <div>
              <p className="font-medium text-[#1A2B4A] text-sm">Escrow Protection</p>
              <p className="text-xs text-muted-foreground mt-1">
                {userRole === 'buyer'
                  ? 'Your payment is held securely until you approve the work. Release funds when satisfied.'
                  : 'Funds are secured in escrow. You\'ll receive payment once the buyer approves your work.'}
              </p>
            </div>
          </div>
        </div>

        {/* Dispute Button */}
        <Button
          variant="outline"
          className="w-full text-muted-foreground hover:text-[#D63031] hover:border-[#D63031]"
          onClick={onDispute}
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          Report an Issue
        </Button>
      </CardContent>
    </Card>
  );
}

function MilestoneEscrowItem({
  milestone,
  userRole,
  onRelease,
}: {
  milestone: EscrowMilestone;
  userRole: 'freelancer' | 'buyer';
  onRelease?: (id: string) => void;
}) {
  const statusConfig = {
    locked: {
      icon: Lock,
      label: 'Locked',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    pending_release: {
      icon: Clock,
      label: 'Pending Release',
      color: 'text-[#F6A623]',
      bgColor: 'bg-[#F6A623]/10',
    },
    released: {
      icon: CheckCircle,
      label: 'Released',
      color: 'text-[#00B8A9]',
      bgColor: 'bg-[#00B8A9]/10',
    },
  };

  const config = statusConfig[milestone.status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", config.bgColor)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1A2B4A] truncate">{milestone.title}</p>
        <p className={cn("text-xs", config.color)}>{config.label}</p>
      </div>
      <p className="font-bold text-[#1A2B4A] font-mono">
        ${milestone.amount.toLocaleString()}
      </p>
      {userRole === 'buyer' && milestone.status === 'pending_release' && (
        <Button
          size="sm"
          className="bg-[#00B8A9] hover:bg-[#00B8A9]/90"
          onClick={() => onRelease?.(milestone.id)}
        >
          Release
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
