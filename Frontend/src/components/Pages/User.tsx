import React, { useEffect, useState, useContext } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Briefcase,
  Github,
  Twitter,
  Globe,
  ExternalLink,
  Heart,
  MessageCircle,
  Linkedin,
  Award,
  TrendingUp,
  Zap,
  Eye   
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { UserContext } from '../../context/UserContext';

interface PublicUserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio: string;
    badges: string[];
    projects: number;
    collaborations: number;
    engagementScore?: number;
    upvotesGiven?: number;
    reviewsWritten?: number;
    productsShared?: number;
  };
  onBack: () => void;
}

const mockProjects = [
  {
    id: '1',
    title: 'AI Writing Assistant',
    description: 'Transform your writing with AI-powered suggestions and grammar corrections',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
    upvotes: 124,
    comments: 32,
    views: 1240
  },
  {
    id: '2',
    title: 'TaskFlow Pro',
    description: 'Visual project management tool designed for creative teams',
    image: 'https://images.unsplash.com/photo-1700561570982-5f845601c505?w=400&h=250&fit=crop',
    upvotes: 89,
    comments: 18,
    views: 856
  },
  {
    id: '3',
    title: 'CodeSnap',
    description: 'Beautiful code screenshots with syntax highlighting and themes',
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe382dcfd?w=400&h=250&fit=crop',
    upvotes: 156,
    comments: 45,
    views: 2103
  }
];

const mockActivity = [
  { action: 'Launched', target: 'AI Writing Assistant', time: '2 hours ago', type: 'launch' },
  { action: 'Updated', target: 'TaskFlow Pro', time: '1 day ago', type: 'update' },
  { action: 'Received 50+ upvotes on', target: 'CodeSnap', time: '2 days ago', type: 'milestone' },
  { action: 'Collaborated on', target: 'DesignKit Pro', time: '3 days ago', type: 'collab' },
  { action: 'Earned badge', target: 'Top Reviewer', time: '1 week ago', type: 'badge' }
];

import { useParams, useNavigate } from 'react-router-dom';

interface APIUser {
  _id: string;
  name: string;
  email: string;
  badges: {
    badge: string;
    awardedAt: string;
    _id?: string;
  }[];
  role: string;
  portfolio: {
    title: string;
    demoUrl: string;
    media: string[];
    _id: string;
  }[];
  achievements: {
    title: string;
    earnedAt: string;
    _id: string;
  }[];
  bio: string;
  github: string;
  linkedin: string;
  twitter: string;
  website: string;
  makerStory: string;
  profilePicture: string;
  createdAt: string;
  totalUpvotes: number;
  totalpoints:number
}

interface Product {
  _id: string;
  title: string;
  pitch: string;
  description: string;
  category: string;
  autoTags: string[];
  media: string[];
  websiteUrl: string;
  demoUrl: string;
  repoUrl: string;
  upvotes: string[];
  reviews: any[];
  createdAt: string;
  updatedAt: string;
  author_id: string | { _id: string };
}

export function PublicUserProfile() {
  const { darkmode } = useContext(UserContext);
  const [user, setUser] = useState<APIUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const { ownerId } = useParams<{ ownerId: string }>();
  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";
    useEffect(() => {
      const fetchOwnerProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }
  
        try {
          setIsLoading(true);
          const response = await fetch(`${url}/api/auth/${ownerId}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            console.log('Fetched owner profile:', data);
          }
        } catch (err) {
          console.log('Could not fetch owner profile');
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchOwnerProfile();
    }, [ownerId, navigate]);
   
    // Fetch owner's products
    useEffect(() => {
      const fetchOwnerProducts = async () => {
        const token = localStorage.getItem('token');
        if (!token || !ownerId) return;
  
        try {
          // Since we need products by specific user, we'll fetch all and filter
          // Or you can create a new backend endpoint for this
          const response = await fetch(`${url}/api/products`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (response.ok) {
            const data = await response.json();
            // Filter products by owner
            const ownerProducts = data.filter((p: Product) => 
              p.author_id === ownerId || (p as any).author_id?._id === ownerId
            );
            setProducts(ownerProducts);
          }
        } catch (err) {
          console.log('Could not fetch owner products');
        }
      };
  
      if (ownerId) {
        fetchOwnerProducts();
      }
    }, [ownerId]);

    // Fetch owner's wishlist
    useEffect(() => {
      const fetchOwnerWishlist = async () => {
        const token = localStorage.getItem('token');
        if (!token || !ownerId) return;

        try {
          const response = await fetch(`${url}/api/wishlist/public/${ownerId}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setWishlist(data.items || []);
          }
        } catch (err) {
          console.log('Could not fetch owner wishlist');
        }
      };

      if (ownerId) {
        fetchOwnerWishlist();
      }
    }, [ownerId]);

    // Fetch user's activity
    useEffect(() => {
      const fetchUserActivity = async () => {
        const token = localStorage.getItem('token');
        if (!token || !ownerId) return;

        try {
          const response = await fetch(`${url}/api/activity/user/${ownerId}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setActivities(data.activities || data || []);
          }
        } catch (err) {
          console.log('Could not fetch user activity');
        }
      };

      if (ownerId) {
        fetchUserActivity();
      }
    }, [ownerId]);
  
    if (isLoading) {
      return (
        <div className={`min-h-screen flex items-center justify-center ${darkmode ? 'bg-gray-900' : 'bg-slate-50'}`}>
          <div className="text-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${darkmode ? 'border-blue-400' : 'border-slate-600'}`}></div>
            <p className={darkmode ? 'text-gray-300' : 'text-slate-600'}>Loading profile...</p>
          </div>
        </div>
      );
    }
  
    if (!user) return <div className={`min-h-screen ${darkmode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>User not found</div>;

  return (
    <div className={`min-h-screen ${darkmode ? 'bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 shadow-lg ${darkmode ? 'bg-blue-800/90 border-blue-600' : 'bg-white/80 backdrop-blur-lg border-slate-200/50'} border-b`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Button 
            variant="ghost"
            className={`transition-all rounded-xl ${darkmode ? 'text-gray-300 hover:text-white hover:bg-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Profile Header with Gradient Background */}
        <div className={`relative ${darkmode ? 'bg-gradient-to-br from-blue-800 to-indigo-800' : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'} rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden text-white`}>
          <div className="absolute inset-0 bg-black/10"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              {/* Avatar with Glow Effect */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl"></div>
                  <Avatar className="relative border-4 border-white shadow-2xl" style={{ height: '120px', width: '120px' }}>
                    {user.profilePicture && (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        style={{width:'100%',objectFit:'cover'}}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    )}
                    {!user.profilePicture && <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold">{user.name.charAt(0)}</AvatarFallback>}
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-400 border-3 border-white rounded-full shadow-lg animate-pulse"></div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">{user.name}</h1>
                  <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">PRO</div>
                </div>
              
                {/* Badges */}
                {user.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.badges.map(badgeObj => (
                      <div 
                        key={badgeObj._id || badgeObj.badge} 
                        className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-bold rounded-full border border-white/30 shadow-lg"
                      >
                        <Award className="w-3 h-3 mr-1 inline" />
                        {badgeObj.badge}
                      </div>
                    ))}
                  </div>
                )}

                {/* Bio */}
                {user.bio && (
                  <p className="text-white/90 text-lg mb-6 leading-relaxed max-w-2xl drop-shadow">
                    {user.bio}
                  </p>
                )}

                {/* Social Links */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {user.github && (
                    <a 
                      href={`https://github.com/${user.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all shadow-lg border border-white/20"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                  {user.twitter && (
                    <a 
                      href={`https://twitter.com/${user.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all shadow-lg border border-white/20"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </a>
                  )}
                  {user.linkedin && (
                    <a 
                      href={`https://linkedin.com/in/${user.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all shadow-lg border border-white/20"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                  {user.website && (
                    <a 
                      href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all shadow-lg border border-white/20"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-8 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{products.length}</div>
                    <div className="text-sm text-white/80">Projects</div>
                  </div>
                  {user.totalpoints && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white drop-shadow">{user.totalpoints.toLocaleString()}</div>
                      <div className="text-sm text-white/80">Engagement</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{user.totalUpvotes || 0}</div>
                    <div className="text-sm text-white/80">Upvotes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{user.badges.length}</div>
                    <div className="text-sm text-white/80">Badges</div>
                  </div>
                </div>
            </div>
          </div>
        </div>
        </div>

        {/* Stats Cards with Gradient */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-white/80" />
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">↑</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {user.totalUpvotes || 0}
            </div>
            <div className="text-sm text-white/80">Upvotes Given</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="w-5 h-5 text-white/80" />
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">P</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {products.length}
            </div>
            <div className="text-sm text-white/80">Projects</div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-white/80" />
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">★</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {user.badges.length}
            </div>
            <div className="text-sm text-white/80">Badges Earned</div>
          </div>

          {user.totalpoints && (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-white/80" />
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">⚡</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {user.totalpoints.toLocaleString()}
              </div>
              <div className="text-sm text-white/80">Engagement</div>
            </div>
          )}
        </div>

        {/* Modern Tabs with Glass Effect */}
        <div className={`rounded-2xl shadow-xl border mb-8 ${darkmode ? 'bg-blue-800/60 border-blue-600' : 'bg-white/60 backdrop-blur-lg border-white/20'}`}>
          <div className={`flex flex-col sm:flex-row border-b ${darkmode ? 'border-blue-600' : 'border-white/20'}`}>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all relative rounded-tl-2xl ${
                activeTab === 'projects'
                  ? darkmode ? 'text-white bg-blue-700 shadow-lg' : 'text-slate-900 bg-white/80 shadow-lg'
                  : darkmode ? 'text-gray-300 hover:text-white hover:bg-blue-700' : 'text-slate-600 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>Projects</span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs rounded-full">
                  {products.length}
                </span>
              </div>
              {activeTab === 'projects' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all relative ${
                activeTab === 'wishlist'
                  ? darkmode ? 'text-white bg-blue-700 shadow-lg' : 'text-slate-900 bg-white/80 shadow-lg'
                  : darkmode ? 'text-gray-300 hover:text-white hover:bg-blue-700' : 'text-slate-600 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" />
                <span>Wishlist</span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full">
                  {wishlist.length}
                </span>
              </div>
              {activeTab === 'wishlist' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-red-500"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all relative rounded-tr-2xl ${
                activeTab === 'activity'
                  ? darkmode ? 'text-white bg-blue-700 shadow-lg' : 'text-slate-900 bg-white/80 shadow-lg'
                  : darkmode ? 'text-gray-300 hover:text-white hover:bg-blue-700' : 'text-slate-600 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Activity</span>
              </div>
              {activeTab === 'activity' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              )}
            </button>
          </div>
        </div>

          {/* Projects Tab Content */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(project => (
                    <div 
                      key={project._id} 
                      className={`group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 ${
                        darkmode 
                          ? 'bg-gradient-to-br from-blue-900/80 via-purple-900/60 to-indigo-900/80 border-blue-500/30' 
                          : 'bg-gradient-to-br from-white/90 via-indigo-50/80 to-purple-50/90 border-white/50'
                      } border backdrop-blur-xl`}
                    >
                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${
                        darkmode 
                          ? 'from-blue-600/20 via-purple-600/20 to-pink-600/20' 
                          : 'from-indigo-500/10 via-purple-500/10 to-pink-500/10'
                      } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                      
                      {/* Image Section with Enhanced Styling */}
                      <div className="relative h-52 overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${
                          darkmode 
                            ? 'from-blue-800 via-purple-800 to-indigo-800' 
                            : 'from-indigo-200 via-purple-200 to-pink-200'
                        } opacity-50`}></div>
                        
                        <ImageWithFallback
                          src={project.media[0]}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        
                        {/* Floating Badge */}
                        <div className="absolute top-4 right-4">
                          <div className={`px-4 py-2 rounded-full shadow-2xl backdrop-blur-md border ${
                            darkmode 
                              ? 'bg-blue-800/90 text-gray-200 border-blue-400/50' 
                              : 'bg-white/90 text-slate-700 border-white/50'
                          }`}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-semibold">{project.upvotes?.length || 0}</span>
                            </div>
                          </div>
                        </div>

                        {/* Category Tag */}
                        {project.category && (
                          <div className="absolute top-4 left-4">
                            <div className={`px-3 py-1.5 rounded-full shadow-xl backdrop-blur-md text-xs font-bold uppercase tracking-wider ${
                              darkmode 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/30' 
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-indigo-400/30'
                            }`}>
                              {project.category}
                            </div>
                          </div>
                        )}

                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>

                      {/* Content Section */}
                      <div className="relative p-6 space-y-4">
                        {/* Title with Enhanced Typography */}
                        <h3 className={`text-xl font-bold mb-3 transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text ${
                          darkmode 
                            ? 'text-white group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400' 
                            : 'text-slate-900 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600'
                        }`}>
                          {project.title}
                        </h3>

                        {/* Description with Better Readability */}
                        <p className={`text-sm leading-relaxed line-clamp-3 transition-all duration-300 ${
                          darkmode 
                            ? 'text-gray-300 group-hover:text-gray-200' 
                            : 'text-slate-600 group-hover:text-slate-700'
                        }`}>
                          {project.description}
                        </p>

                        {/* Tags */}
                        {project.autoTags && project.autoTags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.autoTags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105 ${
                                  darkmode 
                                    ? 'bg-blue-700/50 text-blue-300 border border-blue-600/30' 
                                    : 'bg-indigo-100/70 text-indigo-700 border border-indigo-200/50'
                                }`}
                              >
                                #{tag}
                              </span>
                            ))}
                            {project.autoTags.length > 3 && (
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                darkmode 
                                  ? 'text-gray-400' 
                                  : 'text-slate-500'
                              }`}>
                                +{project.autoTags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Stats Bar with Enhanced Design */}
                        <div className={`flex items-center justify-between pt-4 border-t ${
                          darkmode 
                            ? 'border-blue-700/50' 
                            : 'border-indigo-200/50'
                        }`}>
                          <div className="flex items-center gap-4">
                            {/* Upvotes with Icon */}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 hover:scale-105 ${
                              darkmode 
                                ? 'bg-red-900/30 text-red-400 border border-red-700/30' 
                                : 'bg-red-50 text-red-600 border border-red-200/50'
                            }`}>
                              <Heart className="w-4 h-4 fill-current" />
                              <span className="text-sm font-semibold">{project.upvotes?.length || 0}</span>
                            </div>

                            {/* Comments with Icon */}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 hover:scale-105 ${
                              darkmode 
                                ? 'bg-blue-900/30 text-blue-400 border border-blue-700/30' 
                                : 'bg-blue-50 text-blue-600 border border-blue-200/50'
                            }`}>
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-sm font-semibold">{project.reviews?.length || 0}</span>
                            </div>
                          </div>

                          {/* View Button */}
                          <button className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                            darkmode 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg' 
                              : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg'
                          }`}>
                            View
                          </button>
                        </div>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Corner Accent */}
                      <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${
                        darkmode ? 'bg-purple-400' : 'bg-indigo-500'
                      } opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-pulse`}></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-16 rounded-2xl border ${darkmode ? 'bg-blue-800/40 border-blue-600' : 'bg-white/40 backdrop-blur-lg border-white/20'}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkmode ? 'bg-blue-700' : 'bg-gradient-to-br from-slate-200 to-slate-300'}`}>
                    <Briefcase className={`w-8 h-8 ${darkmode ? 'text-gray-400' : 'text-slate-500'}`} />
                  </div>
                  <p className={`font-medium ${darkmode ? 'text-gray-300' : 'text-slate-600'}`}>No projects yet</p>
                  <p className={`text-sm mt-2 ${darkmode ? 'text-gray-500' : 'text-slate-400'}`}>Start building and showcase your amazing work!</p>
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab Content */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((item: any) => (
                    <div 
                      key={item._id} 
                      className={`rounded-2xl shadow-xl border overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 ${
                        darkmode 
                          ? 'bg-blue-800 border-blue-600' 
                          : 'bg-white/80 backdrop-blur-lg border-white/20'
                      }`}
                    >
                      <div className={`relative h-48 overflow-hidden ${
                        darkmode ? 'bg-blue-700' : 'bg-gradient-to-br from-pink-50 to-rose-100'
                      }`}>
                        <ImageWithFallback
                          src={item.productId?.media?.[0] || '/placeholder-product.jpg'}
                          alt={item.productId?.title || 'Product'}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          fallback="/placeholder-product.jpg"
                        />
                        <div className={`absolute top-3 right-3 rounded-full p-2 shadow-lg ${
                          darkmode 
                            ? 'bg-blue-800/90 border-blue-600' 
                            : 'bg-white/90 border-white/20'
                        }`}>
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className={`text-lg font-semibold mb-2 line-clamp-1 transition-colors ${
                          darkmode 
                            ? 'text-slate-100 hover:text-pink-400' 
                            : 'text-slate-900 hover:text-pink-600'
                        }`}>
                          {item.productId?.title || 'Untitled Product'}
                        </h3>
                        <p className={`text-sm mb-4 line-clamp-2 ${
                          darkmode ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {item.productId?.description || 'No description available'}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className={`flex items-center gap-1 ${
                            darkmode ? 'text-slate-300' : 'text-slate-500'
                          }`}>
                            <Heart className="w-4 h-4 text-red-500" />
                            Added {new Date(item.addedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {item.notes && (
                          <div className={`mt-3 p-3 rounded-xl border ${
                            darkmode 
                              ? 'bg-blue-700 border-blue-600' 
                              : 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-100'
                          }`}>
                            <p className={`text-sm italic ${
                              darkmode ? 'text-slate-300' : 'text-slate-600'
                            }`}>"{item.notes}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-16 rounded-2xl border ${darkmode ? 'bg-blue-800/40 border-blue-600' : 'bg-white/40 backdrop-blur-lg border-white/20'}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkmode ? 'bg-blue-700' : 'bg-gradient-to-br from-pink-200 to-rose-200'}`}>
                    <Heart className={`w-8 h-8 ${darkmode ? 'text-pink-400' : 'text-pink-500'}`} />
                  </div>
                  <p className={`font-medium ${darkmode ? 'text-slate-200' : 'text-slate-600'}`}>No wishlist items yet</p>
                  <p className={`text-sm mt-2 ${darkmode ? 'text-slate-400' : 'text-slate-400'}`}>Start adding products you love!</p>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab Content */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity: any, index: number) => (
                  <div key={activity._id || index} className={`rounded-2xl shadow-xl border hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                    darkmode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white/80 backdrop-blur-lg border-white/20'
                  }`}>
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                          {activity.type === 'launch' && <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg"><Zap className="w-5 h-5 text-white" /></div>}
                          {activity.type === 'update' && <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg"><TrendingUp className="w-5 h-5 text-white" /></div>}
                          {activity.type === 'milestone' && <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg"><Award className="w-5 h-5 text-white" /></div>}
                          {activity.type === 'collab' && <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"><Users className="w-5 h-5 text-white" /></div>}
                          {activity.type === 'badge' && <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg"><Award className="w-5 h-5 text-white" /></div>}
                          {activity.type === 'upvote' && <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg"><Heart className="w-5 h-5 text-white" /></div>}
                          {activity.type === 'review' && <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg"><MessageCircle className="w-5 h-5 text-white" /></div>}
                          {activity.type === 'comment' && <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"><MessageCircle className="w-5 h-5 text-white" /></div>}
                          {!activity.type && <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center shadow-lg"><Award className="w-5 h-5 text-white" /></div>}
                        </div>
                        <div className="flex-1">
                          <p className={`mb-1 ${darkmode ? 'text-white' : 'text-slate-900'}`}>
                            <span className={`font-medium ${darkmode ? 'text-gray-300' : 'text-slate-700'}`}>{activity.action || 'Activity'}</span>
                            {' '}
                            {activity.target && (
                              <span className={`hover:underline cursor-pointer font-semibold transition-colors ${
                                darkmode 
                                  ? 'text-white hover:text-blue-400' 
                                  : 'text-slate-900 hover:text-indigo-600'
                              }`}>
                                {activity.target}
                              </span>
                            )}
                          </p>
                          <p className={`text-sm ${darkmode ? 'text-gray-400' : 'text-slate-500'}`}>
                            {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-16 rounded-2xl border ${darkmode ? 'bg-blue-800/40 border-blue-600' : 'bg-white/40 backdrop-blur-lg border-white/20'}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkmode ? 'bg-blue-700' : 'bg-gradient-to-br from-slate-200 to-slate-300'}`}>
                    <Award className={`w-8 h-8 ${darkmode ? 'text-gray-400' : 'text-slate-500'}`} />
                  </div>
                  <p className={`font-medium ${darkmode ? 'text-gray-300' : 'text-slate-600'}`}>No recent activity</p>
                  <p className={`text-sm mt-2 ${darkmode ? 'text-gray-500' : 'text-slate-400'}`}>Start engaging with the community!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );
}
