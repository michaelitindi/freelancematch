'use client';

import React, { useState } from 'react';
import { Send, Lightbulb, DollarSign, CheckCircle2 } from 'lucide-react';
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

interface PostRequestFormProps {
  onNavigate: (view: string) => void;
}

export function PostRequestForm({ onNavigate }: PostRequestFormProps) {
  const { currentUser, createMatchRequest } = useApp();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Smart suggestions based on description
  const getSuggestions = () => {
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

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    createMatchRequest({
      buyerId: currentUser?.id || 'b1',
      buyerName: currentUser?.name || 'Buyer',
      buyerAvatar: currentUser?.avatar,
      category,
      description,
      budget: budget ? parseFloat(budget) : undefined,
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="card-shadow">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-[#00B8A9]/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-[#00B8A9]" />
            </div>
            <h2 className="text-2xl font-bold font-display text-[#1A2B4A] mb-2">
              Request Submitted!
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              We&apos;re finding the perfect freelancer for your project. You&apos;ll receive a match notification soon.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  setCategory('');
                  setDescription('');
                  setBudget('');
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
        <h1 className="text-3xl font-bold font-display text-[#1A2B4A]">
          Post a Request
        </h1>
        <p className="text-muted-foreground mt-1">
          Describe your project and we&apos;ll match you with the perfect freelancer
        </p>
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
            {suggestions.length > 0 && (
              <div className="p-4 bg-[#00B8A9]/5 rounded-lg border border-[#00B8A9]/20">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-[#00B8A9]" />
                  <span className="text-sm font-medium">Suggested Categories</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <Badge
                      key={suggestion}
                      variant="secondary"
                      className="cursor-pointer hover:bg-[#00B8A9]/20 transition-colors"
                      onClick={() => setCategory(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
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
                  Submit Request
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
