'use client';

import React, { useState, useEffect } from 'react';
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

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showLanding, setShowLanding] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [showPostRequest, setShowPostRequest] = useState(false);
  const [initialRole, setInitialRole] = useState<UserRole>('freelancer');
  const [initialProjectDescription, setInitialProjectDescription] = useState('');
  const [pendingFormData, setPendingFormData] = useState<{category: string; description: string; budget: string} | null>(null);
  const { currentRole, switchRole, currentUser, isSessionChecked, logout } = useApp();

  // Check if user is already authenticated on mount
  useEffect(() => {
    if (isSessionChecked && currentUser) {
      setShowLanding(false);
      setShowAuth(false);
    }
  }, [isSessionChecked, currentUser]);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  const handleGetStarted = (role: UserRole, projectDescription?: string) => {
    setInitialRole(role);
    if (role === 'buyer' && projectDescription) {
      // For buyers with a project description, go directly to PostRequestForm
      setInitialProjectDescription(projectDescription);
      setShowLanding(false);
      setShowPostRequest(true);
    } else {
      // For freelancers or buyers without description, go to auth
      setShowLanding(false);
      setShowAuth(true);
    }
  };

  const handleLogin = () => {
    setShowLanding(false);
    setShowAuth(true);
  };

  const handleLogout = async () => {
    await logout();
    setShowLanding(true);
    setShowAuth(false);
    setShowKYC(false);
  };

  const handleAuthComplete = (role: UserRole) => {
    switchRole(role);
    setShowAuth(false);
    // If there's pending form data from PostRequestForm, go back to it
    if (pendingFormData && role === 'buyer') {
      setShowPostRequest(true);
    } else if (initialProjectDescription && role === 'buyer') {
      setShowPostRequest(true);
    }
  };

  // Handle when PostRequestForm needs auth
  const handlePostRequestAuthRequired = (formData: {category: string; description: string; budget: string}) => {
    setPendingFormData(formData);
    setShowPostRequest(false);
    setShowAuth(true);
  };

  // Handle when PostRequestForm is completed or cancelled
  const handlePostRequestComplete = () => {
    setShowPostRequest(false);
    setPendingFormData(null);
    setInitialProjectDescription('');
  };

  const handlePostRequestBack = () => {
    setShowPostRequest(false);
    setShowLanding(true);
    setInitialProjectDescription('');
    setPendingFormData(null);
  };

  const handleKYCComplete = () => {
    setShowKYC(false);
  };

  // Show loading while checking session
  if (!isSessionChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B8A9]"></div>
      </div>
    );
  }

  // Show landing page first
  if (showLanding && !currentUser) {
    return <LandingPage onGetStarted={handleGetStarted} onLogin={handleLogin} />;
  }

  // Show PostRequestForm for unauthenticated buyers
  if (showPostRequest && !currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <PostRequestForm 
            onNavigate={handlePostRequestComplete}
            onAuthRequired={handlePostRequestAuthRequired}
            onBack={handlePostRequestBack}
            initialDescription={pendingFormData?.description || initialProjectDescription}
            initialCategory={pendingFormData?.category}
            initialBudget={pendingFormData?.budget}
            isGuest={true}
          />
        </div>
      </div>
    );
  }

  // Show PostRequestForm for authenticated buyers returning from auth
  if (showPostRequest && currentUser && pendingFormData) {
    return (
      <div className="min-h-screen bg-background">
        <Header onNavigate={handleNavigate} currentView="post-request" onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-8">
          <PostRequestForm 
            onNavigate={(view) => {
              setShowPostRequest(false);
              setPendingFormData(null);
              setInitialProjectDescription('');
              handleNavigate(view);
            }}
            initialDescription={pendingFormData.description}
            initialCategory={pendingFormData.category}
            initialBudget={pendingFormData.budget}
            isGuest={false}
          />
        </main>
      </div>
    );
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
  if (!currentUser) {
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
            transactions={[]}
            userRole={currentRole}
            totalEarnings={0}
            totalSpent={0}
            pendingAmount={0}
          />
        );
      case 'workspace':
        return (
          <ProjectWorkspace
            projectId=""
            projectTitle="No Active Project"
            description="Select a project to view workspace"
            freelancer={{ id: '', name: '', avatar: '' }}
            buyer={{ id: '', name: '', avatar: '' }}
            status="in_progress"
            milestones={[]}
            deliverables={[]}
            totalBudget={0}
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
      <Header onNavigate={handleNavigate} currentView={currentView} onLogout={handleLogout} />
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
