'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { User, UserRole, Match, MatchRequest, Conversation, Activity } from '@/types';
import {
  mockFreelancers,
  mockBuyers,
  mockMatches,
  mockMatchRequests,
  mockConversations,
  mockActivities,
} from '@/lib/mock-data';

interface AppState {
  // User state
  currentUser: User | null;
  currentRole: UserRole;
  isOnline: boolean;
  
  // Match state
  pendingMatches: Match[];
  activeMatches: Match[];
  matchRequests: MatchRequest[];
  
  // Conversations
  conversations: Conversation[];
  
  // Activities
  activities: Activity[];
  
  // UI state
  showMatchNotification: boolean;
  currentMatch: Match | null;
}

interface AppContextType extends AppState {
  // User actions
  setCurrentUser: (user: User | null) => void;
  switchRole: (role: UserRole) => void;
  toggleOnlineStatus: () => void;
  
  // Match actions
  acceptMatch: (matchId: string) => void;
  declineMatch: (matchId: string) => void;
  createMatchRequest: (request: Omit<MatchRequest, 'id' | 'createdAt' | 'status'>) => void;
  
  // Notification actions
  dismissMatchNotification: () => void;
  
  // Demo actions
  simulateMatch: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize with mock freelancer user
  const [currentUser, setCurrentUser] = useState<User | null>(mockFreelancers[0]);
  const [currentRole, setCurrentRole] = useState<UserRole>('freelancer');
  const [isOnline, setIsOnline] = useState(true);
  
  const [pendingMatches, setPendingMatches] = useState<Match[]>(mockMatches);
  const [activeMatches, setActiveMatches] = useState<Match[]>([]);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>(mockMatchRequests);
  
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);

  const switchRole = useCallback((role: UserRole) => {
    setCurrentRole(role);
    if (role === 'freelancer') {
      setCurrentUser(mockFreelancers[0]);
    } else {
      setCurrentUser(mockBuyers[0]);
    }
  }, []);

  const toggleOnlineStatus = useCallback(() => {
    setIsOnline(prev => !prev);
  }, []);

  const acceptMatch = useCallback((matchId: string) => {
    setPendingMatches(prev => {
      const match = prev.find(m => m.id === matchId);
      if (match) {
        setActiveMatches(active => [...active, { ...match, status: 'accepted' }]);
        
        // Add activity
        setActivities(acts => [{
          id: `a${Date.now()}`,
          type: 'match',
          title: 'Match Accepted',
          description: `You accepted a match for ${match.category}`,
          timestamp: new Date(),
        }, ...acts]);
      }
      return prev.filter(m => m.id !== matchId);
    });
    setShowMatchNotification(false);
    setCurrentMatch(null);
  }, []);

  const declineMatch = useCallback((matchId: string) => {
    setPendingMatches(prev => prev.filter(m => m.id !== matchId));
    setShowMatchNotification(false);
    setCurrentMatch(null);
  }, []);

  const createMatchRequest = useCallback((request: Omit<MatchRequest, 'id' | 'createdAt' | 'status'>) => {
    const newRequest: MatchRequest = {
      ...request,
      id: `mr${Date.now()}`,
      createdAt: new Date(),
      status: 'pending',
    };
    setMatchRequests(prev => [newRequest, ...prev]);
    
    // Add activity
    setActivities(acts => [{
      id: `a${Date.now()}`,
      type: 'match',
      title: 'Request Submitted',
      description: `Your request for ${request.category} has been submitted`,
      timestamp: new Date(),
    }, ...acts]);
  }, []);

  const dismissMatchNotification = useCallback(() => {
    setShowMatchNotification(false);
    setCurrentMatch(null);
  }, []);

  const simulateMatch = useCallback(() => {
    if (currentRole === 'freelancer' && isOnline) {
      const newMatch: Match = {
        id: `m${Date.now()}`,
        requestId: 'mr_sim',
        freelancerId: currentUser?.id || 'f1',
        freelancerName: currentUser?.name || 'Freelancer',
        freelancerAvatar: currentUser?.avatar,
        freelancerRating: currentUser?.rating || 4.5,
        buyerId: 'b1',
        buyerName: 'TechStartup Inc.',
        buyerAvatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&q=80',
        category: 'Web Development',
        description: 'Looking for a skilled developer to build a modern e-commerce platform with React and Node.js.',
        matchReason: {
          categoryFit: 92,
          availability: 100,
          ratingTier: 95,
        },
        status: 'pending',
        createdAt: new Date(),
      };
      
      setPendingMatches(prev => [newMatch, ...prev]);
      setCurrentMatch(newMatch);
      setShowMatchNotification(true);
    }
  }, [currentRole, isOnline, currentUser]);

  const value: AppContextType = {
    currentUser,
    currentRole,
    isOnline,
    pendingMatches,
    activeMatches,
    matchRequests,
    conversations,
    activities,
    showMatchNotification,
    currentMatch,
    setCurrentUser,
    switchRole,
    toggleOnlineStatus,
    acceptMatch,
    declineMatch,
    createMatchRequest,
    dismissMatchNotification,
    simulateMatch,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
