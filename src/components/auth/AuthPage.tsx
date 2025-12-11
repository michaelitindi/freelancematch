'use client';

import React, { useState } from 'react';
import { Zap, ArrowRight, ArrowLeft, Briefcase, User, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import type { UserRole } from '@/types';

interface AuthPageProps {
  onComplete: (role: UserRole) => void;
}

export function AuthPage({ onComplete }: AuthPageProps) {
  const { login, register } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      if (authMode === 'login') {
        const success = await login(formData.email, formData.password);
        if (success) {
          onComplete(selectedRole || 'freelancer');
        } else {
          setError('Invalid email or password');
        }
      } else {
        // Move to onboarding
        setStep(3);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const success = await register(
        formData.email,
        formData.password,
        formData.name,
        selectedRole || 'freelancer'
      );
      
      if (success) {
        onComplete(selectedRole || 'freelancer');
      } else {
        setError('Registration failed. Email may already be in use.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      
      {/* Back to Home Button */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-muted-foreground hover:text-[#1A2B4A]"
        onClick={() => window.location.href = '/'}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>
      
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A2B4A]">
          <Zap className="h-7 w-7 text-[#00B8A9]" />
        </div>
        <span className="text-2xl font-bold text-[#1A2B4A] font-display">
          FreelanceMatch
        </span>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-md card-shadow">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display text-[#1A2B4A]">
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {authMode === 'login' 
              ? 'Sign in to access your dashboard'
              : step === 1 
                ? 'Choose how you want to use FreelanceMatch'
                : step === 2
                  ? 'Enter your details to get started'
                  : 'Complete your profile'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={authMode} onValueChange={(v) => { setAuthMode(v as 'login' | 'register'); setStep(1); }}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#1A2B4A] hover:bg-[#1A2B4A]/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Select your primary role (you can switch anytime)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <RoleCard
                      role="freelancer"
                      icon={User}
                      title="Freelancer"
                      description="Offer your skills and get matched with clients"
                      selected={selectedRole === 'freelancer'}
                      onClick={() => handleRoleSelect('freelancer')}
                    />
                    <RoleCard
                      role="buyer"
                      icon={Briefcase}
                      title="Buyer"
                      description="Find talented freelancers for your projects"
                      selected={selectedRole === 'buyer'}
                      onClick={() => handleRoleSelect('buyer')}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-[#00B8A9]/10 border border-[#00B8A9]/20">
                    {selectedRole === 'freelancer' ? (
                      <User className="h-5 w-5 text-[#00B8A9]" />
                    ) : (
                      <Briefcase className="h-5 w-5 text-[#00B8A9]" />
                    )}
                    <span className="text-sm font-medium text-[#1A2B4A]">
                      Registering as {selectedRole === 'freelancer' ? 'Freelancer' : 'Buyer'}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-xs"
                      onClick={() => setStep(1)}
                    >
                      Change
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 bg-[#1A2B4A] hover:bg-[#1A2B4A]/90">
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <OnboardingStep
                  role={selectedRole!}
                  onComplete={handleOnboardingComplete}
                  onBack={() => setStep(2)}
                  isLoading={isLoading}
                  error={error}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}

interface RoleCardProps {
  role: UserRole;
  icon: React.ElementType;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

function RoleCard({ icon: Icon, title, description, selected, onClick }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 hover:-translate-y-1",
        selected
          ? "border-[#00B8A9] bg-[#00B8A9]/5"
          : "border-border hover:border-[#00B8A9]/50 hover:bg-muted/50"
      )}
    >
      <div className={cn(
        "h-12 w-12 rounded-full flex items-center justify-center mb-3",
        selected ? "bg-[#00B8A9] text-white" : "bg-muted text-muted-foreground"
      )}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-[#1A2B4A]">{title}</h3>
      <p className="text-xs text-muted-foreground text-center mt-1">{description}</p>
    </button>
  );
}

interface OnboardingStepProps {
  role: UserRole;
  onComplete: () => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
}

function OnboardingStep({ role, onComplete, onBack, isLoading, error }: OnboardingStepProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const freelancerQuestions = [
    {
      id: 'categories',
      question: 'What services do you offer?',
      options: ['Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design', 'Content Writing', 'Marketing'],
      multiple: true,
    },
    {
      id: 'experience',
      question: 'How many years of experience do you have?',
      options: ['Less than 1 year', '1-3 years', '3-5 years', '5+ years'],
      multiple: false,
    },
    {
      id: 'availability',
      question: 'What is your typical availability?',
      options: ['Full-time (40+ hrs/week)', 'Part-time (20-40 hrs/week)', 'Limited (< 20 hrs/week)'],
      multiple: false,
    },
  ];

  const buyerQuestions = [
    {
      id: 'company_type',
      question: 'What type of organization are you?',
      options: ['Startup', 'Small Business', 'Enterprise', 'Agency', 'Individual'],
      multiple: false,
    },
    {
      id: 'hiring_needs',
      question: 'What services do you typically need?',
      options: ['Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design', 'Content Writing', 'Marketing'],
      multiple: true,
    },
    {
      id: 'budget_range',
      question: 'What is your typical project budget?',
      options: ['Under $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000+'],
      multiple: false,
    },
  ];

  const questions = role === 'freelancer' ? freelancerQuestions : buyerQuestions;
  const currentQuestion = questions[currentStep];

  const handleOptionSelect = (option: string) => {
    if (currentQuestion.multiple) {
      const current = answers[currentQuestion.id]?.split(',').filter(Boolean) || [];
      const updated = current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option];
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: updated.join(',') }));
    } else {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
    }
  };

  const isSelected = (option: string) => {
    const value = answers[currentQuestion.id] || '';
    return currentQuestion.multiple
      ? value.split(',').includes(option)
      : value === option;
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {questions.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              idx <= currentStep ? "bg-[#00B8A9]" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Question */}
      <div>
        <h3 className="font-semibold text-[#1A2B4A] mb-4">{currentQuestion.question}</h3>
        <div className="grid grid-cols-2 gap-2">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleOptionSelect(option)}
              className={cn(
                "p-3 text-sm rounded-lg border transition-all text-left",
                isSelected(option)
                  ? "border-[#00B8A9] bg-[#00B8A9]/10 text-[#1A2B4A]"
                  : "border-border hover:border-[#00B8A9]/50"
              )}
            >
              <div className="flex items-center gap-2">
                {isSelected(option) && <CheckCircle className="h-4 w-4 text-[#00B8A9]" />}
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
        {currentQuestion.multiple && (
          <p className="text-xs text-muted-foreground mt-2">Select all that apply</p>
        )}
      </div>

      {/* Navigation */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handlePrev} disabled={isLoading}>
          Back
        </Button>
        <Button
          className="flex-1 bg-[#1A2B4A] hover:bg-[#1A2B4A]/90"
          onClick={handleNext}
          disabled={!answers[currentQuestion.id] || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : currentStep < questions.length - 1 ? (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Complete Setup
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
