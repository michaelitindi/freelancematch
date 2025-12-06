'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api-client';
import { useApp } from '@/contexts/AppContext';

// Generic hook for API calls with loading state
export function useApiCall<T, Args extends any[]>(
  apiFunction: (...args: Args) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: Args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { data, loading, error, execute };
}

// Hook for fetching projects
export function useProjects() {
  const { currentUser, currentRole } = useApp();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const params = currentRole === 'buyer' 
        ? { buyerId: currentUser.id }
        : { freelancerId: currentUser.id };
      const result = await api.projects.list(params) as any[];
      setProjects(result);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentRole]);

  return { projects, loading, fetchProjects };
}

// Hook for fetching transactions
export function useTransactions() {
  const { currentUser } = useApp();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async (type?: string) => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const [txResult, summaryResult] = await Promise.all([
        api.transactions.list(currentUser.id, type),
        api.transactions.getSummary(currentUser.id),
      ]);
      setTransactions(txResult as any[]);
      setSummary(summaryResult);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  return { transactions, summary, loading, fetchTransactions };
}

// Hook for fetching conversations
export function useConversations() {
  const { currentUser } = useApp();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const result = await api.conversations.list(currentUser.id) as any[];
      setConversations(result);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!currentUser?.id) return;
    try {
      await api.conversations.sendMessage(conversationId, {
        senderId: currentUser.id,
        content,
      });
      await fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [currentUser?.id, fetchConversations]);

  return { conversations, loading, fetchConversations, sendMessage };
}

// Hook for fetching reviews
export function useReviews() {
  const { currentUser } = useApp();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const result = await api.reviews.list(currentUser.id) as any[];
      setReviews(result);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const submitReview = useCallback(async (data: {
    projectId: string;
    revieweeId: string;
    overallRating: number;
    categories?: Record<string, number>;
    feedback?: string;
  }) => {
    if (!currentUser?.id) return;
    try {
      await api.reviews.create({
        ...data,
        reviewerId: currentUser.id,
      });
      await fetchReviews();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  }, [currentUser?.id, fetchReviews]);

  return { reviews, loading, fetchReviews, submitReview };
}

// Hook for courses
export function useCourses() {
  const { currentUser } = useApp();
  const [courses, setCourses] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = useCallback(async (category?: string) => {
    setLoading(true);
    try {
      const result = await api.courses.list(category) as any[];
      setCourses(result);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProgress = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const result = await api.courses.getProgress(currentUser.id) as any[];
      setProgress(result);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  }, [currentUser?.id]);

  const enrollInCourse = useCallback(async (courseId: string) => {
    if (!currentUser?.id) return;
    try {
      await api.courses.enroll(courseId, currentUser.id);
      await fetchProgress();
    } catch (error) {
      console.error('Failed to enroll:', error);
    }
  }, [currentUser?.id, fetchProgress]);

  return { courses, progress, loading, fetchCourses, fetchProgress, enrollInCourse };
}

// Hook for KYC
export function useKYC() {
  const { currentUser } = useApp();
  const [status, setStatus] = useState<string>('not_started');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const result = await api.kyc.getStatus(currentUser.id) as any;
      setStatus(result.status);
      setDocuments(result.documents);
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const uploadDocument = useCallback(async (documentType: string, fileUrl: string) => {
    if (!currentUser?.id) return;
    try {
      await api.kyc.upload({
        userId: currentUser.id,
        documentType,
        fileUrl,
      });
      await fetchStatus();
    } catch (error) {
      console.error('Failed to upload document:', error);
    }
  }, [currentUser?.id, fetchStatus]);

  return { status, documents, loading, fetchStatus, uploadDocument };
}

// Hook for payments
export function usePayments() {
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(false);

  const createCheckout = useCallback(async (data: {
    projectId: string;
    milestoneId: string;
    amount: number;
  }) => {
    if (!currentUser?.id) return null;
    setLoading(true);
    try {
      const result = await api.payments.createCheckout({
        ...data,
        buyerId: currentUser.id,
      }) as any;
      return result.checkoutUrl;
    } catch (error) {
      console.error('Failed to create checkout:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const releaseMilestone = useCallback(async (milestoneId: string, freelancerId: string, amount: number) => {
    setLoading(true);
    try {
      await api.payments.release({ milestoneId, freelancerId, amount });
      return true;
    } catch (error) {
      console.error('Failed to release payment:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, createCheckout, releaseMilestone };
}
