'use client';

import React, { useState } from 'react';
import {
  Zap,
  ArrowRight,
  Star,
  Shield,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  Play,
  Briefcase,
  User,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface LandingPageProps {
  onGetStarted: (role: 'freelancer' | 'buyer', projectDescription?: string) => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [projectDescription, setProjectDescription] = useState('');

  const handleGetStarted = (role: 'freelancer' | 'buyer', projectDescription?: string) => {
    onGetStarted(role, projectDescription);
  };

  const handleGetMatched = () => {
    onGetStarted('buyer', projectDescription);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A2B4A]">
              <Zap className="h-6 w-6 text-[#00B8A9]" />
            </div>
            <span className="text-xl font-bold text-[#1A2B4A]">FreelanceMatch</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-[#1A2B4A] transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-[#1A2B4A] transition-colors">
              Features
            </a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-[#1A2B4A] transition-colors">
              Testimonials
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-[#00B8A9] text-[#00B8A9] hover:bg-[#00B8A9]/10"
              onClick={() => onGetStarted('freelancer')}
            >
              <User className="h-4 w-4 mr-2" />
              For Freelancers
            </Button>
            <Button 
              className="bg-[#1A2B4A] hover:bg-[#1A2B4A]/90 text-white" 
              onClick={() => onGetStarted('buyer')}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              For Businesses
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="bg-[#00B8A9]/10 text-[#00B8A9] mb-6 px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Instant Matching • Fair Distribution • Quality Guaranteed
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-[#1A2B4A] mb-4 leading-tight">
              Get Matched with
              <br />
              <span className="text-[#00B8A9]">Top Freelancers</span>
              <br />
              Instantly
            </h1>
            <p className="text-base text-muted-foreground max-w-xl mx-auto mb-6">
              Like Uber, but for digital services. Post your project and get matched with qualified freelancers in seconds.
            </p>
            
            {/* Project Input Box - ChatGPT Style */}
            <div className="max-w-4xl mx-auto mb-10">
              <div className="relative bg-white rounded-2xl shadow-lg border border-[#1A2B4A]/10 p-2">
                <div className="flex items-end gap-2">
                  <div className="relative flex-1">
                    <textarea
                      placeholder="What do you need help with today? Describe your project..."
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      rows={3}
                      className="w-full resize-none px-4 py-3 text-base border-0 focus:outline-none focus:ring-0 rounded-xl bg-transparent placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <Button
                    size="lg"
                    className="bg-[#00B8A9] hover:bg-[#00B8A9]/90 text-white h-12 px-4 rounded-xl flex-shrink-0 mb-1 gap-2"
                    onClick={handleGetMatched}
                  >
                    Get Matched
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center justify-between px-4 py-2 border-t border-[#1A2B4A]/5">
                  <p className="text-xs text-muted-foreground">
                    Popular: Web Development • UI/UX Design • Mobile Apps • Content Writing
                  </p>
                  <span className="text-xs text-[#00B8A9] font-medium">Get matched instantly</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                className="border-[#1A2B4A]/30 text-[#1A2B4A] hover:bg-[#1A2B4A]/5 px-8 h-12"
                onClick={() => onGetStarted('buyer')}
              >
                <Briefcase className="h-5 w-5 mr-2" />
                I'm looking to hire
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#00B8A9]/50 text-[#00B8A9] hover:bg-[#00B8A9]/10 px-8 h-12"
                onClick={() => onGetStarted('freelancer')}
              >
                <User className="h-5 w-5 mr-2" />
                I'm a freelancer
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { value: '10K+', label: 'Active Freelancers' },
              { value: '< 30s', label: 'Average Match Time' },
              { value: '4.9★', label: 'Average Rating' },
              { value: '$2M+', label: 'Paid to Freelancers' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[#1A2B4A] font-mono">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="bg-[#1A2B4A]/10 text-[#1A2B4A] mb-4">How It Works</Badge>
            <h2 className="text-4xl font-bold text-[#1A2B4A] mb-4">
              From Request to Results in Minutes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our intelligent matching algorithm connects you with the perfect freelancer based on skills, availability, and track record.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Post Your Request',
                description: 'Describe your project, set your budget, and specify requirements. Our smart categorization helps you find the right talent.',
                icon: Briefcase,
              },
              {
                step: '02',
                title: 'Get Instant Matches',
                description: 'Our algorithm finds available freelancers who match your needs. See their ratings, portfolio, and match score in real-time.',
                icon: Zap,
              },
              {
                step: '03',
                title: 'Collaborate & Pay Securely',
                description: 'Work together in our project workspace. Payments are held in escrow and released when you approve the work.',
                icon: Shield,
              },
            ].map((item, i) => (
              <Card key={i} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-8 pb-6">
                  <div className="absolute top-4 right-4 text-6xl font-bold text-[#00B8A9]/10">
                    {item.step}
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-[#00B8A9]/10 flex items-center justify-center mb-6">
                    <item.icon className="h-7 w-7 text-[#00B8A9]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A2B4A] mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="bg-[#00B8A9]/10 text-[#00B8A9] mb-4">Features</Badge>
            <h2 className="text-4xl font-bold text-[#1A2B4A] mb-4">
              Built for Modern Freelancing
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: 'Real-Time Matching',
                description: 'Get matched with available freelancers instantly. No more waiting for proposals.',
              },
              {
                icon: TrendingUp,
                title: 'Fair Distribution',
                description: 'New freelancers get boosted visibility. Everyone gets a fair chance at work.',
              },
              {
                icon: Shield,
                title: 'Escrow Protection',
                description: 'Payments are secured until work is approved. Safe for both parties.',
              },
              {
                icon: Star,
                title: 'Verified Reviews',
                description: 'Dual-sided ratings ensure accountability. Build trust with every project.',
              },
              {
                icon: Users,
                title: 'Project Workspace',
                description: 'Collaborate with messaging, file sharing, and video calls in one place.',
              },
              {
                icon: CheckCircle,
                title: 'Milestone Payments',
                description: 'Break projects into milestones. Pay as work progresses.',
              },
            ].map((feature, i) => (
              <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl bg-[#1A2B4A]/5 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-[#1A2B4A]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1A2B4A] mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-[#1A2B4A]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="bg-white/10 text-white mb-4">Testimonials</Badge>
            <h2 className="text-4xl font-bold text-white mb-4">
              Loved by Freelancers & Businesses
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah Chen',
                role: 'UI/UX Designer',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
                quote: 'Finally a platform that gives new freelancers a fair chance. I got my first client within hours of signing up!',
                rating: 5,
              },
              {
                name: 'Michael Torres',
                role: 'Startup Founder',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
                quote: 'The instant matching is a game-changer. I posted a project and had a qualified developer working on it the same day.',
                rating: 5,
              },
              {
                name: 'Emily Watson',
                role: 'Marketing Director',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
                quote: 'The escrow system gives us peace of mind. We know our payment is secure until we approve the work.',
                rating: 5,
              },
            ].map((testimonial, i) => (
              <Card key={i} className="bg-white/5 border-white/10 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-[#F6A623] text-[#F6A623]" />
                    ))}
                  </div>
                  <p className="text-white/90 mb-6">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{testimonial.name}</p>
                      <p className="text-sm text-white/60">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-[#00B8A9] to-[#00A89A] border-0 overflow-hidden">
            <CardContent className="py-16 px-8 text-center relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
              <div className="relative">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Join thousands of freelancers and businesses already using FreelanceMatch to connect and collaborate.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="bg-white text-[#00B8A9] hover:bg-white/90 px-8 h-14 text-lg"
                    onClick={() => onGetStarted('buyer')}
                  >
                    <Briefcase className="h-5 w-5 mr-2" />
                    I Want to Hire
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 px-8 h-14 text-lg"
                    onClick={() => onGetStarted('freelancer')}
                  >
                    <User className="h-5 w-5 mr-2" />
                    I Want to Work
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A2B4A]">
                  <Zap className="h-6 w-6 text-[#00B8A9]" />
                </div>
                <span className="text-xl font-bold text-[#1A2B4A]">FreelanceMatch</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The instant freelance marketplace that democratizes opportunity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#1A2B4A] mb-4">For Freelancers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-[#00B8A9]">Find Work</a></li>
                <li><a href="#" className="hover:text-[#00B8A9]">Learning Center</a></li>
                <li><a href="#" className="hover:text-[#00B8A9]">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#1A2B4A] mb-4">For Businesses</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-[#00B8A9]">Hire Talent</a></li>
                <li><a href="#" className="hover:text-[#00B8A9]">Enterprise</a></li>
                <li><a href="#" className="hover:text-[#00B8A9]">Case Studies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#1A2B4A] mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-[#00B8A9]">About Us</a></li>
                <li><a href="#" className="hover:text-[#00B8A9]">Blog</a></li>
                <li><a href="#" className="hover:text-[#00B8A9]">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 FreelanceMatch. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-[#00B8A9]">Privacy Policy</a>
              <a href="#" className="hover:text-[#00B8A9]">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
