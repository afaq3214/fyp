import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { ProductSubmissionModal } from './components/ProductSubmissionModal';
import { AIChatbot } from './components/AIChatbot';
import { Toaster } from './components/ui/sonner';
import {jwtDecode} from 'jwt-decode';

export type Page = 'discovery' | 'profile' | 'product-detail' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  bio: string;
  badges: string[];
  projects: number;
  products: number;
  collaborations: number;
  isAdmin?: boolean;
  role: string;
  status: string;
  joinDate: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  pitch: string;
  category: string;
  image: string;
  author: User;
  upvotes: number;
  reviews: number;
  tags: string[];
  trending: boolean;
  fresh: boolean;
  createdAt: string;
  demoUrl?: string;
  githubUrl?: string;
}

interface DecodedToken {
  id: string;
  exp: number;
}

const mockUser: User = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex@example.com',
  profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  bio: 'Full-stack developer and indie maker building AI-powered tools',
  badges: ['Early Adopter', 'Top Reviewer', 'AI Enthusiast'],
  projects: 12,
  products: 5,
  collaborations: 8,
  isAdmin: true,
  role: 'admin',
  status: 'active',
  joinDate: '2021-01-01'
};

const mockProducts: Product[] = [
  {
    id: '1',
    title: 'AI Writing Assistant',
    description: 'Transform your writing with AI-powered suggestions and grammar corrections',
    pitch: 'Revolutionizing content creation with smart AI that understands context and tone, helping writers produce better content faster.',
    category: 'AI Tools',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
    author: mockUser,
    upvotes: 124,
    reviews: 32,
    tags: ['AI', 'Writing', 'Productivity'],
    trending: true,
    fresh: false,
    createdAt: '2 hours ago',
    demoUrl: 'https://demo.example.com',
    githubUrl: 'https://github.com/example/ai-writer'
  },
  {
    id: '2',
    title: 'TaskFlow Pro',
    description: 'Visual project management tool designed for creative teams',
    pitch: 'Streamline your team\'s workflow with intuitive boards, smart automation, and real-time collaboration features.',
    category: 'Productivity',
    image: 'https://images.unsplash.com/photo-1700561570982-5f845601c505?w=400&h=250&fit=crop',
    author: mockUser,
    upvotes: 89,
    reviews: 18,
    tags: ['Project Management', 'Teams', 'Collaboration'],
    trending: false,
    fresh: true,
    createdAt: '1 day ago'
  },
  {
    id: '3',
    title: 'CodeSnap',
    description: 'Beautiful code screenshots with syntax highlighting and themes',
    pitch: 'Create stunning code snippets for social media, documentation, and presentations with customizable themes.',
    category: 'Developer Tools',
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe382dcfd?w=400&h=250&fit=crop',
    author: mockUser,
    upvotes: 156,
    reviews: 45,
    tags: ['Developer Tools', 'Design', 'Code'],
    trending: true,
    fresh: false,
    createdAt: '3 days ago'
  }
];

export default function App() {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-password'>('login');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setCurrentUser(null);
          return;
        }

        const decoded = jwtDecode<DecodedToken>(token);
        const userId = decoded.id;

        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setCurrentUser(null);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/auth/${userId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/');
            throw new Error('Invalid token');
          }
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        console.log('Fetched user data:', data);

        const user: User = {
          id: data._id,
          name: data.name,
          email: data.email,
          profilePicture: data.profilePicture ? `${data.profilePicture}?t=${Date.now()}` : '',
          bio: data.bio || '',
          badges: data.badges || [],
          projects: data.portfolio?.length || 0,
          products: data.portfolio?.length || 0,
          collaborations: data.portfolio?.length || 0,
          isAdmin: data.role === 'admin',
          role: data.role || 'user',
          status: 'active',
          joinDate: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : '',
        };

        setCurrentUser(user);
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        setCurrentUser(null);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleProfileClick = () => {
    if (currentUser) {
      navigate(`/profile/${currentUser.id}`);
    } else {
      setAuthMode('login');
      setShowAuthModal(true);
    }
  };

  const handleSubmitProduct = () => {
    if (currentUser) {
      setShowSubmissionModal(true);
    } else {
      setAuthMode('signup');
      setShowAuthModal(true);
    }
  };

  const handleAuth = (user: User) => {
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleToggleAuthMode = (mode: 'login' | 'signup' | 'forgot-password') => {
    console.log('Setting auth mode to:', mode);
    setAuthMode(mode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header
        currentUser={currentUser}
        onProfileClick={handleProfileClick}
        onSubmitProduct={handleSubmitProduct}
        onHomeClick={() => navigate('/')}
        onAuthClick={() => {
          setAuthMode('login');
          setShowAuthModal(true);
        }}
        onLogout={() => {
          localStorage.removeItem('token');
          setCurrentUser(null);
          navigate('/');
        }}
        onAdminClick={() => navigate('/admin')}
      />
      
      <Outlet />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onToggleMode={handleToggleAuthMode}
        onAuth={handleAuth}
      />

      <ProductSubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        currentUser={currentUser}
      />

      <AIChatbot currentUser={currentUser} />
      <Toaster />
    </div>
  );
}