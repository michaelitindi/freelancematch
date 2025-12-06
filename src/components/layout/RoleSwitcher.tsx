'use client';

import React from 'react';
import { User, Briefcase, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

interface RoleSwitcherProps {
  variant?: 'default' | 'compact' | 'full';
  className?: string;
}

export function RoleSwitcher({ variant = 'default', className }: RoleSwitcherProps) {
  const { currentRole, switchRole, currentUser } = useApp();

  const roles: { role: UserRole; label: string; icon: React.ElementType; description: string }[] = [
    {
      role: 'freelancer',
      label: 'Freelancer',
      icon: User,
      description: 'Receive matches and offer services',
    },
    {
      role: 'buyer',
      label: 'Buyer',
      icon: Briefcase,
      description: 'Post requests and hire freelancers',
    },
  ];

  const currentRoleData = roles.find(r => r.role === currentRole)!;
  const CurrentIcon = currentRoleData.icon;

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => switchRole(currentRole === 'freelancer' ? 'buyer' : 'freelancer')}
        className={cn("gap-2", className)}
      >
        <ArrowLeftRight className="h-4 w-4" />
        <span className="sr-only">Switch role</span>
      </Button>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn("flex items-center gap-2 p-1 bg-muted rounded-lg", className)}>
        {roles.map(({ role, label, icon: Icon }) => (
          <Button
            key={role}
            variant={currentRole === role ? 'default' : 'ghost'}
            size="sm"
            onClick={() => switchRole(role)}
            className={cn(
              "flex-1 gap-2",
              currentRole === role && "bg-[#1A2B4A] text-white hover:bg-[#1A2B4A]/90"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 border-[#1A2B4A]/20 hover:border-[#00B8A9] transition-colors",
            className
          )}
        >
          <CurrentIcon className="h-4 w-4 text-[#00B8A9]" />
          <span className="font-medium">{currentRoleData.label}</span>
          <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Switch Role</p>
            <p className="text-xs leading-none text-muted-foreground">
              Currently viewing as {currentRoleData.label}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.map(({ role, label, icon: Icon, description }) => (
          <DropdownMenuItem
            key={role}
            onClick={() => switchRole(role)}
            className={cn(
              "flex items-start gap-3 p-3 cursor-pointer",
              currentRole === role && "bg-[#00B8A9]/5"
            )}
          >
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center mt-0.5",
              currentRole === role
                ? "bg-[#00B8A9] text-white"
                : "bg-muted text-muted-foreground"
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{label}</span>
                {currentRole === role && (
                  <Badge className="bg-[#00B8A9] text-white text-[10px] px-1.5 py-0">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
