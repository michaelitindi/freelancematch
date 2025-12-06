'use client';

import React from 'react';
import { Bell, MessageSquare, User, ChevronDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

export function Header({ onNavigate, currentView }: HeaderProps) {
  const {
    currentUser,
    currentRole,
    isOnline,
    switchRole,
    toggleOnlineStatus,
    conversations,
    pendingMatches,
  } = useApp();

  const unreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const pendingMatchCount = pendingMatches.length;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1A2B4A]">
            <Zap className="h-5 w-5 text-[#00B8A9]" />
          </div>
          <span className="text-xl font-bold text-[#1A2B4A] font-display">
            FreelanceMatch
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Button
            variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onNavigate('dashboard')}
          >
            Dashboard
          </Button>
          {currentRole === 'freelancer' && (
            <Button
              variant={currentView === 'matches' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('matches')}
            >
              Matches
              {pendingMatchCount > 0 && (
                <Badge className="ml-2 bg-[#00B8A9] text-white">{pendingMatchCount}</Badge>
              )}
            </Button>
          )}
          {currentRole === 'buyer' && (
            <Button
              variant={currentView === 'post-request' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('post-request')}
            >
              Post Request
            </Button>
          )}
          <Button
            variant={currentView === 'messages' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onNavigate('messages')}
          >
            Messages
            {unreadMessages > 0 && (
              <Badge className="ml-2 bg-[#FF6B6B] text-white">{unreadMessages}</Badge>
            )}
          </Button>
          <Button
            variant={currentView === 'courses' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onNavigate('courses')}
          >
            Courses
          </Button>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Online Status Toggle (Freelancer only) */}
          {currentRole === 'freelancer' && (
            <div className="hidden md:flex items-center gap-2">
              <span className={cn(
                "text-sm font-medium",
                isOnline ? "text-[#00B8A9]" : "text-muted-foreground"
              )}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <Switch
                checked={isOnline}
                onCheckedChange={toggleOnlineStatus}
                className="data-[state=checked]:bg-[#00B8A9]"
              />
            </div>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {(pendingMatchCount > 0 || unreadMessages > 0) && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#FF6B6B] text-[10px] font-bold text-white flex items-center justify-center">
                {pendingMatchCount + unreadMessages}
              </span>
            )}
          </Button>

          {/* Messages */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => onNavigate('messages')}
          >
            <MessageSquare className="h-5 w-5" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#FF6B6B] text-[10px] font-bold text-white flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </Button>

          {/* Role Switcher & Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                  <AvatarFallback>
                    {currentUser?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">{currentUser?.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{currentRole}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate('profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate('analytics')}>
                Analytics
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Switch Role
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => switchRole('freelancer')}
                className={cn(currentRole === 'freelancer' && 'bg-accent')}
              >
                Freelancer Mode
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => switchRole('buyer')}
                className={cn(currentRole === 'buyer' && 'bg-accent')}
              >
                Buyer Mode
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
