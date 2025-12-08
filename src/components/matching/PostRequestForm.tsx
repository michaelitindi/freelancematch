'use client';

import React, { useState, useEffect } from 'react';
import { Send, Lightbulb, DollarSign, CheckCircle2, ArrowLeft, AlertCircle, Users, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { SERVICE_CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

interface MatchingResult {
  matchesCreated: number;
  freelancersAvailable: number;
}

interface PostRequestFormProps {
  onNavigate: (view: string) => void;
  onAuthRequired?: (formData: {category: string; description: string; budget: string}) => void;
  onBack?: () => void;
  initialDescription?: string;
  initialCategory?: string;
  initialBudget?: string;
  isGuest?: boolean;
}

export function PostRequestForm({ 
  onNavigate, 
  onAuthRequired, 
  onBack,
  initialDescription = '',
  initialCategory = '',
  initialBudget = '',
  isGuest = false 
}: PostRequestFormProps) {
  const { currentUser, createMatchRequest } = useApp();
  const [category, setCategory] = useState(initialCategory);
  const [description, setDescription] = useState(initialDescription);
  const [budget, setBudget] = useState(initialBudget);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<{ category: string; confidence: number; keywords: string[] }[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Debounced AI-powered smart categorization
  useEffect(() => {
    if (description.length < 20) {
      setAiSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await fetch('/api/categorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description }),
        });
        const data = await response.json();
        if (data.suggestions) {
          setAiSuggestions(data.suggestions);
        }
      } catch (error) {
        console.error('Failed to get AI suggestions:', error);
      }
      setIsLoadingSuggestions(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [description]);

  // Smart suggestions based on description (fallback)
  const getSuggestions = () => {
    // Use AI suggestions if available
    if (aiSuggestions.length > 0) {
      return aiSuggestions.map(s => s.category).filter(s => s !== category);
    }
    
    const desc = description.toLowerCase();
    const suggestions: string[] = [];
    
    if (desc.includes('website') || desc.includes('web') || desc.includes('react') || desc.includes('frontend')) {
      suggestions.push('Web Development');
    }
    if (desc.includes('app') || desc.includes('mobile') || desc.includes('ios') || desc.includes('android')) {
      suggestions.push('Mobile Development');
    }
    if (desc.includes('design') || desc.includes('ui') || desc.includes('ux') || desc.includes('interface')) {
      suggestions.push('UI/UX Design');
    }
    if (desc.includes('logo') || desc.includes('brand') || desc.includes('graphic')) {
      suggestions.push('Graphic Design');
    }
    if (desc.includes('content') || desc.includes('blog') || desc.includes('article') || desc.includes('write')) {
      suggestions.push('Content Writing');
    }
    if (desc.includes('marketing') || desc.includes('seo') || desc.includes('ads') || desc.includes('social')) {
      suggestions.push('Digital Marketing');
    }
    
    return suggestions.filter(s => s !== category);
  };

  const suggestions = getSuggestions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description) return;

    // If guest user, require auth before submitting
    if (isGuest && onAuthRequired) {
      onAuthRequired({ category, description, budget });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Call API to create project and trigger matching
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: currentUser?.id || 'b1',
          title: description.slice(0, 50),
          description,
          category,
          budget: budget ? parseFloat(budget) : 0,
        }),
      });
      
      const result = await response.json();
      
      if (result.matchingResult) {
        setMatchingResult(result.matchingResult);
      }
      
      createMatchRequest({
        buyerId: currentUser?.id || 'b1',
        buyerName: currentUser?.name || 'Buyer',
        buyerAvatar: currentUser?.avatar,
        title: description.slice(0, 50),
        category,
        description,
        budget: budget ? parseFloat(budget) : undefined,
      });
    } catch (error) {
      console.error('Failed to create project:', error);
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    const noFreelancersAvailable = matchingResult && matchingResult.freelancersAvailable === 0;
    
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="card-shadow">
          <CardContent className="flex flex-col items-center justify-center py-16">
            {noFreelancersAvailable ? (
              <>
                <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                  <Users className="h-10 w-10 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold font-display text-[#1A2B4A] mb-2">
                  Request Submitted!
                </h2>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-md">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800">No freelancers available right now</p>
                      <p className="text-sm text-amber-700 mt-1">
                        There are currently no freelancers online in the {category} category. 
                        Your request has been saved and you&apos;ll be notified as soon as a freelancer becomes available.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="h-20 w-20 rounded-full bg-[#00B8A9]/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10 text-[#00B8A9]" />
                </div>
                <h2 className="text-2xl font-bold font-display text-[#1A2B4A] mb-2">
                  Request Submitted!
                </h2>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {matchingResult && matchingResult.matchesCreated > 0 
                    ? `We found ${matchingResult.matchesCreated} potential freelancer${matchingResult.matchesCreated > 1 ? 's' : ''} for your project. You'll receive match notifications soon.`
                    : "We're finding the perfect freelancer for your project. You'll receive a match notification soon."
                  }
                </p>
              </>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  setCategory('');
                  setDescription('');
                  setBudget('');
                  setMatchingResult(null);
                }}
              >
                Post Another Request
              </Button>
              <Button
                className="bg-[#00B8A9] hover:bg-[#00A89A] text-white"
                onClick={() => onNavigate('dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        {isGuest && onBack && (
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 -ml-2 text-muted-foreground hover:text-[#1A2B4A]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        )}
        <h1 className="text-3xl font-bold font-display text-[#1A2B4A]">
          Post a Request
        </h1>
        <p className="text-muted-foreground mt-1">
          Describe your project and we&apos;ll match you with the perfect freelancer
        </p>
        {isGuest && (
          <p className="text-sm text-[#00B8A9] mt-2">
            Fill out the details below. You&apos;ll create an account when you submit.
          </p>
        )}
      </div>

      {/* Form */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="font-display">Project Details</CardTitle>
          <CardDescription>
            Be specific about your requirements for better matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Service Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your project requirements, goals, and any specific skills needed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[150px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/500 characters
              </p>
            </div>

            {/* Smart Suggestions */}
            {(suggestions.length > 0 || isLoadingSuggestions) && (
              <div className="p-4 bg-[#00B8A9]/5 rounded-lg border border-[#00B8A9]/20">
                <div className="flex items-center gap-2 mb-3">
                  {isLoadingSuggestions ? (
                    <Loader2 className="h-4 w-4 text-[#00B8A9] animate-spin" />
                  ) : aiSuggestions.length > 0 ? (
                    <Sparkles className="h-4 w-4 text-[#00B8A9]" />
                  ) : (
                    <Lightbulb className="h-4 w-4 text-[#00B8A9]" />
                  )}
                  <span className="text-sm font-medium">
                    {isLoadingSuggestions ? 'Analyzing your description...' : 
                     aiSuggestions.length > 0 ? 'AI-Powered Suggestions' : 'Suggested Categories'}
                  </span>
                </div>
                {!isLoadingSuggestions && (
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.length > 0 ? (
                      aiSuggestions.filter(s => s.category !== category).map((suggestion) => (
                        <Badge
                          key={suggestion.category}
                          variant="secondary"
                          className="cursor-pointer hover:bg-[#00B8A9]/20 transition-colors"
                          onClick={() => setCategory(suggestion.category)}
                        >
                          {suggestion.category}
                          <span className="ml-1 text-xs opacity-60">
                            {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </Badge>
                      ))
                    ) : (
                      suggestions.map((suggestion) => (
                        <Badge
                          key={suggestion}
                          variant="secondary"
                          className="cursor-pointer hover:bg-[#00B8A9]/20 transition-colors"
                          onClick={() => setCategory(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (Optional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="budget"
                  type="number"
                  placeholder="Enter your budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Setting a budget helps freelancers understand your expectations
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 bg-[#00B8A9] hover:bg-[#00A89A] text-white"
              disabled={!category || !description || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Finding Matches...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {isGuest ? 'Continue & Create Account' : 'Submit Request'}
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="font-display">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-[#00B8A9]/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-[#00B8A9]">1</span>
              </div>
              <h4 className="font-semibold mb-1">Submit Request</h4>
              <p className="text-sm text-muted-foreground">
                Describe your project and requirements
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-[#00B8A9]/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-[#00B8A9]">2</span>
              </div>
              <h4 className="font-semibold mb-1">Get Matched</h4>
              <p className="text-sm text-muted-foreground">
                Our algorithm finds the best freelancer
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-[#00B8A9]/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-[#00B8A9]">3</span>
              </div>
              <h4 className="font-semibold mb-1">Start Working</h4>
              <p className="text-sm text-muted-foreground">
                Collaborate and complete your project
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
