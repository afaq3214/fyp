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
  const getuserId=(userId)=>{
    setuserid(userId);
    console.log('userId',userId)
  }
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
          }
        } catch (err) {
          console.log('Could not fetch profile');
        } finally {
          
        }
      };
  
      fetchProfile();
    }, []);
  
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
  } catch (err) {
    console.error('Error sending comment', err);
    throw err;
  }
};
  

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        setToken,
        getuserId,
        userId,
        SendComments
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
