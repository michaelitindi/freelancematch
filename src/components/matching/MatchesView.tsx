'use client';

import React from 'react';
import { 
  Check, 
  X, 
  Star, 
  Clock, 
  Briefcase, 
  TrendingUp,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface MatchesViewProps {
  onNavigate: (view: string) => void;
}

export function MatchesView({ onNavigate }: MatchesViewProps) {
  const { pendingMatches, activeMatches, acceptMatch, declineMatch } = useApp();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-[#1A2B4A]">
          Matches
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and manage your project matches
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="pending" className="data-[state=active]:bg-white">
            Pending
            {pendingMatches.length > 0 && (
              <Badge className="ml-2 bg-[#00B8A9] text-white">{pendingMatches.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-white">
            Active
            {activeMatches.length > 0 && (
              <Badge className="ml-2 bg-[#1A2B4A] text-white">{activeMatches.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Pending Matches */}
        <TabsContent value="pending" className="space-y-4">
          {pendingMatches.length === 0 ? (
            <Card className="card-shadow">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Pending Matches</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Stay online to receive new match notifications. When a buyer&apos;s request matches your skills, you&apos;ll see it here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingMatches.map((match) => (
                <Card key={match.id} className="card-shadow hover:card-shadow-hover transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      {/* Buyer Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-14 w-14 border-2 border-[#00B8A9]">
                          <AvatarImage src={match.buyerAvatar} alt={match.buyerName} />
                          <AvatarFallback>{match.buyerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{match.buyerName}</h3>
                            <Badge variant="secondary">{match.category}</Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-4">
                            {match.description}
                          </p>
                          
                          {/* Match Reasons */}
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1.5 text-sm">
                              <Briefcase className="h-4 w-4 text-[#00B8A9]" />
                              <span className="text-muted-foreground">Category:</span>
                              <span className="font-mono font-medium">{match.matchReason.categoryFit}%</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                              <Clock className="h-4 w-4 text-[#00B8A9]" />
                              <span className="text-muted-foreground">Availability:</span>
                              <span className="font-mono font-medium">{match.matchReason.availability}%</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                              <TrendingUp className="h-4 w-4 text-[#00B8A9]" />
                              <span className="text-muted-foreground">Rating:</span>
                              <span className="font-mono font-medium">{match.matchReason.ratingTier}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col gap-3 lg:w-40">
                        <Button
                          className="flex-1 bg-[#00B8A9] hover:bg-[#00A89A] text-white"
                          onClick={() => acceptMatch(match.id)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => declineMatch(match.id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Not Interested
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Active Matches */}
        <TabsContent value="active" className="space-y-4">
          {activeMatches.length === 0 ? (
            <Card className="card-shadow">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Active Matches</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Accept pending matches to start working on projects. Your active collaborations will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeMatches.map((match) => (
                <Card key={match.id} className="card-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Buyer Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={match.buyerAvatar} alt={match.buyerName} />
                          <AvatarFallback>{match.buyerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{match.buyerName}</h3>
                            <Badge className="bg-[#00B8A9]/10 text-[#00B8A9]">Active</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {match.category} • {match.description.slice(0, 60)}...
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => onNavigate('messages')}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button variant="outline">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Project
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Algorithm Explanation */}
      <Card className="card-shadow bg-gradient-to-br from-[#1A2B4A] to-[#2A3B5A] text-white">
        <CardHeader>
          <CardTitle className="font-display text-white">How Matching Works</CardTitle>
          <CardDescription className="text-white/70">
            Our fair matching algorithm ensures equal opportunity for all freelancers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-[#00B8A9]" />
              </div>
              <h4 className="font-semibold mb-1">Rating Weight: 40%</h4>
              <p className="text-sm text-white/70">
                Your overall rating and review history
              </p>
            </div>
            <div className="text-center p-4">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-[#00B8A9]" />
              </div>
              <h4 className="font-semibold mb-1">Availability: 30%</h4>
              <p className="text-sm text-white/70">
                Your online status and response time
              </p>
            </div>
            <div className="text-center p-4">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-[#00B8A9]" />
              </div>
              <h4 className="font-semibold mb-1">Recency: 30%</h4>
              <p className="text-sm text-white/70">
                Time since your last completed job
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-white/10 rounded-lg">
            <p className="text-sm text-white/80">
              <strong className="text-[#00B8A9]">New Freelancer Boost:</strong> First 10 jobs receive 2x matching weight to help build your reputation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
