'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CourseManager } from './course-manager';

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [pendingKyc, setPendingKyc] = useState<any[]>([]);
  const [flaggedReviews, setFlaggedReviews] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats);
    fetch('/api/admin/kyc/pending').then(r => r.json()).then(setPendingKyc);
    fetch('/api/admin/reviews/flagged').then(r => r.json()).then(setFlaggedReviews);
  }, []);

  const approveKyc = async (userId: string) => {
    await fetch(`/api/admin/kyc/${userId}/approve`, { method: 'PATCH' });
    setPendingKyc(prev => prev.filter(u => u.id !== userId));
  };

  const rejectKyc = async (userId: string) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    await fetch(`/api/admin/kyc/${userId}/reject`, { 
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    setPendingKyc(prev => prev.filter(u => u.id !== userId));
  };

  const moderateReview = async (reviewId: string, status: string) => {
    const notes = status === 'rejected' ? prompt('Moderation notes:') : '';
    await fetch(`/api/admin/reviews/${reviewId}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
    setFlaggedReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Users</div>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Projects</div>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Pending KYC</div>
            <div className="text-2xl font-bold">{stats.pendingKyc}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Flagged Reviews</div>
            <div className="text-2xl font-bold">{stats.flaggedReviews}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
          </Card>
        </div>
      )}

      <Tabs defaultValue="kyc">
        <TabsList>
          <TabsTrigger value="kyc">KYC Approvals</TabsTrigger>
          <TabsTrigger value="reviews">Review Moderation</TabsTrigger>
          <TabsTrigger value="courses">Course Management</TabsTrigger>
        </TabsList>

        <TabsContent value="kyc" className="space-y-4">
          {pendingKyc.map(user => (
            <Card key={user.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
                <div className="text-xs text-muted-foreground">{user.doc_count} documents</div>
              </div>
              <div className="space-x-2">
                <Button onClick={() => approveKyc(user.id)} size="sm">Approve</Button>
                <Button onClick={() => rejectKyc(user.id)} variant="destructive" size="sm">Reject</Button>
              </div>
            </Card>
          ))}
          {pendingKyc.length === 0 && <p className="text-muted-foreground">No pending KYC requests</p>}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          {flaggedReviews.map(review => (
            <Card key={review.id} className="p-4">
              <div className="flex justify-between mb-2">
                <div>
                  <div className="font-semibold">{review.reviewer_name} → {review.reviewee_name}</div>
                  <div className="text-sm text-muted-foreground">{review.project_title}</div>
                </div>
                <div className="text-lg font-bold">{review.overall_rating}⭐</div>
              </div>
              <p className="text-sm mb-2">{review.feedback}</p>
              <div className="text-xs text-red-600 mb-2">Flag: {review.flag_reason}</div>
              <div className="space-x-2">
                <Button onClick={() => moderateReview(review.id, 'published')} size="sm">Keep</Button>
                <Button onClick={() => moderateReview(review.id, 'rejected')} variant="destructive" size="sm">Remove</Button>
              </div>
            </Card>
          ))}
          {flaggedReviews.length === 0 && <p className="text-muted-foreground">No flagged reviews</p>}
        </TabsContent>

        <TabsContent value="courses">
          <CourseManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
