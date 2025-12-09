'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TourStep {
  target: string;
  title: string;
  content: string;
}

export function OnboardingTour({ steps, onComplete }: { steps: TourStep[]; onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || currentStep >= steps.length) return null;

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <span className="text-sm text-gray-500">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          <p className="text-gray-600">{step.content}</p>
        </div>
        
        <div className="flex justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tour
          </Button>
          <Button onClick={handleNext}>
            {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Predefined tours
export const buyerTour: TourStep[] = [
  {
    target: 'create-project',
    title: 'Welcome! 👋',
    content: 'Let\'s get you started. First, create a project to find the perfect freelancer.'
  },
  {
    target: 'matches',
    title: 'Smart Matching 🎯',
    content: 'We\'ll automatically match you with qualified freelancers based on your project needs.'
  },
  {
    target: 'messages',
    title: 'Stay Connected 💬',
    content: 'Chat with freelancers, share files, and schedule video calls right here.'
  },
  {
    target: 'milestones',
    title: 'Secure Payments 💰',
    content: 'Set milestones and release payments as work is completed.'
  }
];

export const freelancerTour: TourStep[] = [
  {
    target: 'profile',
    title: 'Complete Your Profile 📝',
    content: 'Add your skills, experience, and portfolio to attract more clients.'
  },
  {
    target: 'matches',
    title: 'Browse Opportunities 🔍',
    content: 'Check your matches daily. Accept projects that fit your expertise.'
  },
  {
    target: 'deliverables',
    title: 'Submit Work 📤',
    content: 'Upload deliverables and track your progress on each milestone.'
  },
  {
    target: 'earnings',
    title: 'Get Paid 💵',
    content: 'Receive payments directly when milestones are approved.'
  }
];
