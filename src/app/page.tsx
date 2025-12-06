'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { MatchNotification } from '@/components/matching/MatchNotification';
import { FreelancerDashboard } from '@/components/dashboard/FreelancerDashboard';
import { BuyerDashboard } from '@/components/dashboard/BuyerDashboard';
import { MatchesView } from '@/components/matching/MatchesView';
import { PostRequestForm } from '@/components/matching/PostRequestForm';
import { MessagesView } from '@/components/messages/MessagesView';
import { CoursesView } from '@/components/courses/CoursesView';
import { ProfileView } from '@/components/profile/ProfileView';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { AuthPage } from '@/components/auth/AuthPage';
import { KYCVerification } from '@/components/auth/KYCVerification';
import { TransactionHistory } from '@/components/payment/TransactionHistory';
import { ProjectWorkspace } from '@/components/workspace/ProjectWorkspace';
import { LandingPage } from '@/components/landing/LandingPage';
import type { UserRole } from '@/types';

// Mock transaction data
const mockTransactions = [
  {
    id: 't1',
    type: 'payout' as const,
    amount: 2500,
    fee: 75,
    status: 'completed' as const,
    description: 'Payment for Dashboard Redesign',
    projectTitle: 'Dashboard Redesign',
    counterparty: 'TechStartup Inc.',
    date: new Date('2024-01-15'),
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 't2',
    type: 'payout' as const,
    amount: 1200,
    fee: 36,
    status: 'pending' as const,
    description: 'Payment for Mobile App UI',
    projectTitle: 'Mobile App UI',
    counterparty: 'Creative Co.',
    date: new Date('2024-01-20'),
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 't3',
    type: 'fee' as const,
    amount: 111,
    status: 'completed' as const,
    description: 'Platform service fee',
    date: new Date('2024-01-15'),
  },
];

// Mock project data
const mockProject = {
  projectId: 'p1',
  projectTitle: 'E-commerce Dashboard Redesign',
  description: 'Complete redesign of the admin dashboard with modern UI/UX patterns and real-time analytics.',
  freelancer: {
    id: 'f1',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
  },
  buyer: {
    id: 'b1',
    name: 'TechStartup Inc.',
    avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&q=80',
  },
  status: 'in_progress' as const,
  milestones: [
    { id: 'm1', title: 'Initial Design Phase', amount: 1500, status: 'paid' as const, dueDate: new Date('2024-01-10') },
    { id: 'm2', title: 'Development Phase', amount: 2500, status: 'in_progress' as const, dueDate: new Date('2024-01-25') },
    { id: 'm3', title: 'Testing & Launch', amount: 1000, status: 'pending' as const, dueDate: new Date('2024-02-05') },
  ],
  deliverables: [
    { id: 'd1', name: 'Homepage Design v2.pdf', type: 'pdf', size: '2.4 MB', uploadedAt: new Date('2024-01-18'), status: 'approved' as const, version: 2 },
    { id: 'd2', name: 'Dashboard Components.fig', type: 'figma', size: '15.2 MB', uploadedAt: new Date('2024-01-20'), status: 'pending_review' as const, version: 1 },
  ],
  totalBudget: 5000,
};

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [initialRole, setInitialRole] = useState<UserRole>('freelancer');
  const { currentRole, switchRole } = useApp();

  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  const handleGetStarted = (role: UserRole) => {
    setInitialRole(role);
    setShowLanding(false);
    setShowAuth(true);
  };

  const handleLogin = () => {
    setShowLanding(false);
    setShowAuth(true);
  };

  const handleAuthComplete = (role: UserRole) => {
    switchRole(role);
    setShowAuth(false);
    if (role === 'freelancer') {
      setShowKYC(true);
    } else {
      setIsAuthenticated(true);
    }
  };

  const handleKYCComplete = () => {
    setShowKYC(false);
    setIsAuthenticated(true);
  };

  // Show landing page first
  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} onLogin={handleLogin} />;
  }

  // Show auth page
  if (showAuth) {
    return <AuthPage onComplete={handleAuthComplete} />;
  }

  // Show KYC verification for new freelancers
  if (showKYC) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <KYCVerification
            onComplete={handleKYCComplete}
            onSkip={handleKYCComplete}
          />
        </div>
      </div>
    );
  }

  // Show landing if not authenticated
  if (!isAuthenticated) {
    return <LandingPage onGetStarted={handleGetStarted} onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return currentRole === 'freelancer' 
          ? <FreelancerDashboard onNavigate={handleNavigate} />
          : <BuyerDashboard onNavigate={handleNavigate} />;
      case 'matches':
        return <MatchesView onNavigate={handleNavigate} />;
      case 'post-request':
        return <PostRequestForm onNavigate={handleNavigate} />;
      case 'messages':
        return <MessagesView />;
      case 'courses':
        return <CoursesView />;
      case 'profile':
        return <ProfileView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'payments':
        return (
          <TransactionHistory
            transactions={mockTransactions}
            userRole={currentRole}
            totalEarnings={12500}
            totalSpent={8200}
            pendingAmount={1200}
          />
        );
      case 'workspace':
        return (
          <ProjectWorkspace
            {...mockProject}
            currentUserRole={currentRole}
            onMessageClick={() => handleNavigate('messages')}
            onVideoCallClick={() => {}}
          />
        );
      case 'kyc':
        return (
          <div className="max-w-lg mx-auto">
            <KYCVerification />
          </div>
        );
      default:
        return currentRole === 'freelancer' 
          ? <FreelancerDashboard onNavigate={handleNavigate} />
          : <BuyerDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={handleNavigate} currentView={currentView} />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        {renderView()}
      </main>
      <MobileNav onNavigate={handleNavigate} currentView={currentView} />
      <MatchNotification />
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
