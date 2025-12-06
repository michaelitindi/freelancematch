'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { User, UserRole, Match, MatchRequest, Conversation, Activity } from '@/types';
import api from '@/lib/api-client';
import { setAuthCookie, removeAuthCookie, isAuthenticated, getCurrentUser } from '@/lib/auth-client';

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
  
  // API actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshActivities: () => Promise<void>;
  refreshMatches: () => Promise<void>;
  checkSession: () => Promise<boolean>;
  isLoading: boolean;
  isSessionChecked: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize with null user - will be set from session
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('freelancer');
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  
  const [pendingMatches, setPendingMatches] = useState<Match[]>([]);
  const [activeMatches, setActiveMatches] = useState<Match[]>([]);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);

  // Check session on mount
  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      // First check if we have a valid token client-side
      if (!isAuthenticated()) {
        setIsSessionChecked(true);
        return false;
      }
      
      // Verify with server
      const result = await api.auth.me();
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setCurrentRole(result.user.role);
        setIsOnline(result.user.is_online === 1);
        setIsSessionChecked(true);
        return true;
      }
      
      // Token invalid, clear it
      removeAuthCookie();
      setIsSessionChecked(true);
      return false;
    } catch (error) {
      console.error('Session check failed:', error);
      removeAuthCookie();
      setIsSessionChecked(true);
      return false;
    }
  }, []);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // API-based login
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await api.auth.login({ email, password });
      if (result.success && result.user) {
        // Token is set via httpOnly cookie by the server
        // Also set client-side cookie for session checking
        if (result.token) {
          setAuthCookie(result.token);
        }
        setCurrentUser(result.user);
        setCurrentRole(result.user.role);
        setIsOnline(result.user.is_online === 1);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // API-based register
  const register = useCallback(async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await api.auth.register({ email, password, name, role });
      if (result.success && result.user) {
        // Token is set via httpOnly cookie by the server
        // Also set client-side cookie for session checking
        if (result.token) {
          setAuthCookie(result.token);
        }
        setCurrentUser(result.user);
        setCurrentRole(result.user.role);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    removeAuthCookie();
    setCurrentUser(null);
    setCurrentRole('freelancer');
    setIsOnline(false);
    setPendingMatches([]);
    setActiveMatches([]);
    setActivities([]);
  }, []);

  // Refresh activities from API
  const refreshActivities = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const result = await api.activities.list(currentUser.id) as Activity[];
      setActivities(result);
    } catch (error) {
      console.error('Failed to refresh activities:', error);
    }
  }, [currentUser?.id]);

  // Refresh matches from API
  const refreshMatches = useCallback(async () => {
    if (!currentUser?.id || currentRole !== 'freelancer') return;
    try {
      const result = await api.matches.list({ freelancerId: currentUser.id, status: 'pending' }) as any[];
      const formattedMatches: Match[] = result.map(m => ({
        id: m.id,
        requestId: m.project_id,
        freelancerId: m.freelancer_id,
        freelancerName: currentUser.name,
        freelancerAvatar: currentUser.avatar,
        freelancerRating: currentUser.rating || 0,
        buyerId: m.buyer_id,
        buyerName: m.buyer_name,
        buyerAvatar: m.buyer_avatar,
        category: m.category,
        description: m.project_description,
        matchReason: {
          categoryFit: m.category_fit,
          availability: m.availability_score,
          ratingTier: m.rating_score,
        },
        status: m.status,
        createdAt: new Date(m.created_at),
      }));
      setPendingMatches(formattedMatches);
    } catch (error) {
      console.error('Failed to refresh matches:', error);
    }
  }, [currentUser, currentRole]);

  const switchRole = useCallback((role: UserRole) => {
    setCurrentRole(role);
    // Role switching now just changes the role, user stays the same
  }, []);

  const toggleOnlineStatus = useCallback(async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    // Update via API if user is logged in
    if (currentUser?.id) {
      try {
        await api.users.setAvailability(currentUser.id, newStatus);
      } catch (error) {
        console.error('Failed to update availability:', error);
      }
    }
  }, [isOnline, currentUser?.id]);

  const acceptMatch = useCallback(async (matchId: string) => {
    // Update via API
    try {
      await api.matches.respond(matchId, 'accepted');
    } catch (error) {
      console.error('Failed to accept match:', error);
    }
    
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

  const declineMatch = useCallback(async (matchId: string) => {
    // Update via API
    try {
      await api.matches.respond(matchId, 'declined');
    } catch (error) {
      console.error('Failed to decline match:', error);
    }
    
    setPendingMatches(prev => prev.filter(m => m.id !== matchId));
    setShowMatchNotification(false);
    setCurrentMatch(null);
  }, []);

  const createMatchRequest = useCallback(async (request: Omit<MatchRequest, 'id' | 'createdAt' | 'status'>) => {
    // Create project via API if user is logged in
    if (currentUser?.id) {
      try {
        await api.projects.create({
          buyerId: currentUser.id,
          title: request.title,
          description: request.description,
          category: request.category,
          budget: request.budget || 0,
        });
      } catch (error) {
        console.error('Failed to create project:', error);
      }
    }
    
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
  }, [currentUser?.id]);

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
    login,
    register,
    logout,
    refreshActivities,
    refreshMatches,
    checkSession,
    isLoading,
    isSessionChecked,
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
