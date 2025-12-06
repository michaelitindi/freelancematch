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

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const { currentRole } = useApp();

  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

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
