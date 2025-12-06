'use client';

import React from 'react';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Award, 
  Briefcase,
  Clock,
  CheckCircle2,
  Edit,
  Shield,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

export function ProfileView() {
  const { currentUser, currentRole } = useApp();

  const skills = currentUser?.skills || [];
  const categories = currentUser?.categories || [];

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="card-shadow overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#1A2B4A] to-[#2A4B6A]" />
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
              <AvatarFallback className="text-3xl">{currentUser?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold font-display text-[#1A2B4A]">
                      {currentUser?.name}
                    </h1>
                    {currentUser?.kycStatus === 'approved' && (
                      <Badge className="bg-[#00B8A9]/10 text-[#00B8A9]">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-3">{currentUser?.bio}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>San Francisco, CA</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {new Date(currentUser?.createdAt || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    {currentRole === 'freelancer' && currentUser?.hourlyRate && (
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-semibold text-[#1A2B4A]">${currentUser.hourlyRate}/hr</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {currentRole === 'freelancer' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-5 w-5 text-[#F6A623] fill-[#F6A623]" />
                <span className="text-2xl font-bold font-mono">{currentUser?.rating}</span>
              </div>
              <p className="text-sm text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold font-mono mb-1">{currentUser?.totalJobs || 0}</div>
              <p className="text-sm text-muted-foreground">Jobs Completed</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold font-mono mb-1">0%</div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold font-mono mb-1">0h</div>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Skills */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="font-display">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="font-display">Service Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#00B8A9]/10 flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-[#00B8A9]" />
                    </div>
                    <span className="font-medium">{category}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="font-display">Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="font-medium">React Fundamentals</p>
                    <p className="text-xs text-muted-foreground">Completed Jan 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-medium">Advanced TypeScript</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="projects" className="data-[state=active]:bg-white">
                Projects
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-white">
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No projects yet</p>
                <p className="text-sm">Your completed projects will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No reviews yet</p>
                <p className="text-sm">Reviews from clients will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
