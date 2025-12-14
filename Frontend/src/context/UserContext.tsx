import axios from 'axios';
import React, { createContext, useState, useEffect } from 'react';
 const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";

interface UserContextProps {
  user: any;
  userId:any;
  token: string | null;
  setToken: (token: string | null) => void;
  getuserId: (userId: string) => void;  // Add this line
  SendComments: (description: string, productId: string, emoji?: string,rating?:number) => Promise<void>;
  notification: any[];
  setnotification: (notifications: any[]) => void;
  refreshNotifications: () => Promise<void>;
}
type UserProviderProps = {
  children: React.ReactNode;  // This is the important part
  // Add any other props your provider might accept
}
export const UserContext = createContext<Partial<UserContextProps>>({});

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>({});
  const [userId,setuserid]=useState<string>('');
  const [notification,setnotification]=useState([])
  const getuserId= async (userId)=>{
    setuserid(userId);
    console.log('userId',userId)
    const token = localStorage.getItem('token');
        if (!token) return;
  
        try {
        
          const response = await fetch(`${url}/api/auth/${userId}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            console.log('user',data)
          }
        } catch (err) {
          console.log('Could not fetch profile');
        } finally {
          
        }
  }
   useEffect(() => {
    const token=localStorage.getItem('token')
    const notificationData = async () => {
        const response = await fetch(`${url}/api/notification`, { headers: { 'Authorization': `Bearer ${token}` } })
        console.log("Notification API response status:", response.status);
        const data = await response.json()
        console.log("Notification API data:", data);
        setnotification(data)
    }
    notificationData()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(notificationData, 30000);
    
    return () => clearInterval(interval);
      }, []);

  useEffect(() => {
      const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
  
        try {
        
          const response = await fetch(`${url}/api/auth/${userId}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            console.log('user',data)
          }
        } catch (err) {
          console.log('Could not fetch profile');
        } finally {
          
        }
      };
  
      fetchProfile();
    }, [userId]);
  
   const refreshNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch(`${url}/api/notification`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const data = await response.json();
      setnotification(data);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

   const SendComments = async (description: string, productId: string, emoji?: string,rating?:number) => {
  try {
    const authToken = token || localStorage.getItem('token');
    if (!authToken) {
      throw new Error('No auth token found');
    }
   
    await axios.post(
      `${url}/api/comments/add`,
      {
        comment: description,
        productId,
        userId,
        emoji,
        rating
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
  } catch (err: any) {
    console.error('Error sending comment', err);
    
    // Handle specific error for commenting on own product
    if (err.response?.status === 403 && err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    
    throw err;
  }
};
  

  return (
    <UserContext.Provider
      value={{
        user,
        userId,
        token,
        setToken,
        getuserId,
        SendComments,
        notification,
        setnotification,
        refreshNotifications
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
