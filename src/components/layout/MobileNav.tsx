'use client';

import React from 'react';
import { Home, Zap, MessageSquare, User, Wallet } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

export function MobileNav({ onNavigate, currentView }: MobileNavProps) {
  const { currentRole, conversations, pendingMatches } = useApp();

  const unreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const pendingMatchCount = pendingMatches.length;

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { 
      id: currentRole === 'freelancer' ? 'matches' : 'post-request', 
      label: currentRole === 'freelancer' ? 'Matches' : 'Request', 
      icon: Zap,
      badge: currentRole === 'freelancer' ? pendingMatchCount : 0,
    },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages },
    { id: 'payments', label: 'Payments', icon: Wallet },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full relative transition-colors",
                isActive ? "text-[#00B8A9]" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 h-4 w-4 rounded-full bg-[#FF6B6B] text-[10px] font-bold text-white flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#00B8A9] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
