'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface RealtimeEvent {
  id: string;
  user_id: string;
  event_type: string;
  payload: any;
  is_read: boolean;
  created_at: string;
}

interface UseRealtimeOptions {
  userId: string | null;
  enabled?: boolean;
  pollingInterval?: number;
  onEvent?: (event: RealtimeEvent) => void;
}

export function useRealtime({
  userId,
  enabled = true,
  pollingInterval = 5000,
  onEvent,
}: UseRealtimeOptions) {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pollEvents = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/events/${userId}`);
      const newEvents = await response.json();

      if (Array.isArray(newEvents) && newEvents.length > 0) {
        setEvents((prev) => [...newEvents, ...prev].slice(0, 50)); // Keep last 50 events
        setLastEventTime(new Date());

        // Trigger callback for each new event
        newEvents.forEach((event: RealtimeEvent) => {
          onEvent?.(event);
        });
      }

      setIsConnected(true);
    } catch (error) {
      console.error('Failed to poll events:', error);
      setIsConnected(false);
    }
  }, [userId, onEvent]);

  useEffect(() => {
    if (!enabled || !userId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial poll
    pollEvents();

    // Set up polling interval
    intervalRef.current = setInterval(pollEvents, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, userId, pollingInterval, pollEvents]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    isConnected,
    lastEventTime,
    clearEvents,
    refresh: pollEvents,
  };
}

// Hook for specific event types
export function useRealtimeNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<{
    matches: RealtimeEvent[];
    messages: RealtimeEvent[];
    reviews: RealtimeEvent[];
    payments: RealtimeEvent[];
    videoCalls: RealtimeEvent[];
  }>({
    matches: [],
    messages: [],
    reviews: [],
    payments: [],
    videoCalls: [],
  });

  const handleEvent = useCallback((event: RealtimeEvent) => {
    setNotifications((prev) => {
      const newNotifications = { ...prev };

      switch (event.event_type) {
        case 'new_match':
        case 'match_accepted':
        case 'match_declined':
          newNotifications.matches = [event, ...prev.matches].slice(0, 10);
          break;
        case 'new_message':
          newNotifications.messages = [event, ...prev.messages].slice(0, 10);
          break;
        case 'new_review':
          newNotifications.reviews = [event, ...prev.reviews].slice(0, 10);
          break;
        case 'payment_received':
        case 'payment_released':
          newNotifications.payments = [event, ...prev.payments].slice(0, 10);
          break;
        case 'video_call_invite':
          newNotifications.videoCalls = [event, ...prev.videoCalls].slice(0, 10);
          break;
      }

      return newNotifications;
    });
  }, []);

  const { events, isConnected, lastEventTime, refresh } = useRealtime({
    userId,
    onEvent: handleEvent,
  });

  const clearNotificationType = useCallback((type: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: [],
    }));
  }, []);

  const totalUnread = 
    notifications.matches.length +
    notifications.messages.length +
    notifications.reviews.length +
    notifications.payments.length +
    notifications.videoCalls.length;

  return {
    notifications,
    totalUnread,
    isConnected,
    lastEventTime,
    clearNotificationType,
    refresh,
  };
}
