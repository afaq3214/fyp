import React, { useEffect, useState, useContext } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '@/context/UserContext';

interface Notification {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
  viewed: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const userContext = useContext(UserContext);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notification`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [userContext]);

  useEffect(() => {
    const markAsViewed = async () => {
      if (userContext?.markNotificationsAsViewed) {
        await userContext.markNotificationsAsViewed();
        if (userContext.refreshNotifications) {
          await userContext.refreshNotifications();
        }
      }
    };
    markAsViewed();
  }, [userContext]);

  const deleteNotification = async (notificationId: string) => {
    if (!notificationId) return;
    setDeletingId(notificationId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notification/${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        if (userContext?.refreshNotifications) {
          userContext.refreshNotifications();
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'badge': return 'Badge';
      case 'upvote': return 'Upvote';
      case 'comment': return 'Comment';
      case 'follow': return 'Follow';
      case 'collaboration': return 'Collaboration';
      default: return 'Notification';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-900 bg-zinc-950 py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <Bell className="w-5 h-5 text-white" />
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          </div>
          <p className="text-zinc-500 text-sm">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {notifications.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-xl p-16 text-center">
            <Bell className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
            <p className="text-zinc-500 text-sm">No notifications yet</p>
            <p className="text-zinc-700 text-xs mt-1">Activity from others will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-900 border border-zinc-900 rounded-xl overflow-hidden">
            {notifications.map(notification => (
              <div
                key={notification._id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                  !notification.viewed ? 'bg-zinc-900' : 'bg-black hover:bg-zinc-950'
                }`}
              >
                {!notification.viewed && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 shrink-0" />
                )}
                {notification.viewed && <div className="w-1.5 shrink-0" />}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider border border-zinc-800 px-1.5 py-0.5 rounded">
                      {getTypeLabel(notification.type)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{notification.description}</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => deleteNotification(notification._id)}
                  disabled={deletingId === notification._id}
                  className="shrink-0 text-zinc-700 hover:text-white transition-colors p-1 mt-0.5"
                  title="Delete"
                >
                  {deletingId === notification._id ? (
                    <div className="w-3.5 h-3.5 border border-zinc-600 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
