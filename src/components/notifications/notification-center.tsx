'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function NotificationCenter({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    const response = await fetch(`/api/events/${userId}`);
    const events = await response.json();
    
    const notifs = events.map((e: any) => ({
      id: e.id,
      type: e.event_type,
      title: getNotificationTitle(e.event_type),
      message: getNotificationMessage(e.event_type, e.payload),
      timestamp: e.created_at,
      read: e.is_read === 1
    }));
    
    setNotifications(notifs);
    setUnreadCount(notifs.filter((n: Notification) => !n.read).length);
  };

  const markAsRead = async (id: string) => {
    await fetch(`/api/events/${id}/read`, { method: 'PATCH' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b font-semibold">Notifications</div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No notifications</div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{notif.title}</div>
                    <div className="text-sm text-gray-600">{notif.message}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(notif.timestamp).toLocaleString()}
                    </div>
                  </div>
                  {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function getNotificationTitle(type: string): string {
  const titles: Record<string, string> = {
    'new_match': '🎯 New Match',
    'match_accepted': '✅ Match Accepted',
    'match_declined': '❌ Match Declined',
    'new_message': '💬 New Message',
    'payment_received': '💰 Payment Received',
    'payment_released': '💸 Payment Released',
    'video_call_invite': '📹 Video Call',
    'new_review': '⭐ New Review',
  };
  return titles[type] || '🔔 Notification';
}

function getNotificationMessage(type: string, payload: any): string {
  try {
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    
    switch (type) {
      case 'new_match':
        return 'You have a new project match!';
      case 'match_accepted':
        return 'Your match has been accepted!';
      case 'new_message':
        return 'You have a new message';
      case 'video_call_invite':
        return 'You have been invited to a video call';
      case 'payment_received':
        return `Payment received: $${data.amount || 0}`;
      default:
        return 'You have a new notification';
    }
  } catch {
    return 'You have a new notification';
  }
}
