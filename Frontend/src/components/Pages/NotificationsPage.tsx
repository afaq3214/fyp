import React, { useEffect, useState, useContext } from 'react';
import { Bell, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { UserContext } from '@/context/UserContext';

interface Notification {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
  viewed: boolean;
  // Add other notification properties as needed
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const userContext = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notification`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
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
        // Refresh notifications after marking as viewed
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notification/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'badge':
        return <span className="text-yellow-500">🏆</span>;
      case 'upvote':
        return <span className="text-blue-500">👍</span>;
      case 'comment':
        return <span className="text-green-500">💬</span>;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <li 
                key={notification._id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  !notification.viewed ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 flex items-start space-x-3">
                    <div className="flex-shrink-0 pt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {notification.description}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                    disabled={deletingId === notification._id}
                    className="text-gray-400 hover:text-red-500 p-1 -mr-2 -mt-1"
                    title="Delete notification"
                  >
                    {deletingId === notification._id ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
