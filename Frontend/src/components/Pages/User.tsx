import React, { useEffect, useState } from 'react';
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      );
    }
  
    if (!user) return <div>User not found</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Button 
            variant="ghost"
            // onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Avatar */}
          <div className="flex-shrink-0">
            
            <Avatar style={{ height: '100px', width: '100px' }}>
              {user.profilePicture && (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  style={{width:'100%',objectFit:'cover'}}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              )}
              {!user.profilePicture && <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>}
            </Avatar>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl mb-3 text-gray-900">{user.name}</h1>
            
            {/* Badges */}
            {user.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {user.badges.map(badgeObj => (
                  <Badge 
                    key={badgeObj._id || badgeObj.badge} 
                    variant="outline"
                    className="border-slate-300 text-slate-700 bg-slate-50"
                  >
                    <Award className="w-3 h-3 mr-1" />
                    {badgeObj.badge}
                  </Badge>
                ))}
              </div>
            )}

            {/* Bio */}
            {user.bio && (
              <p className="text-gray-700 text-lg mb-6 leading-relaxed max-w-2xl">
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
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
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
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
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
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
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
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{products.length}</span>
                <span className="text-gray-500">Projects</span>
              </div>
              
              {user.totalpoints && (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{user.totalpoints.toLocaleString()}</span>
                  <span className="text-gray-500">Engagement</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl text-gray-900 mb-1">
                {user.totalUpvotes || 0}
              </div>
              <div className="text-sm text-gray-500">Upvotes Given</div>
            </CardContent>
          </Card>
{/* 
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <MessageCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-2xl text-gray-900 mb-1">
                {user.reviewsWritten || 0}
              </div>
              <div className="text-sm text-gray-500">Reviews Written</div>
            </CardContent>
          </Card> */}

          {/* <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <ExternalLink className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-2xl text-gray-900 mb-1">
                {user.productsShared || 0}
              </div>
              <div className="text-sm text-gray-500">Products Shared</div>
            </CardContent>
          </Card> */}

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-2xl text-gray-900 mb-1">
                {user.badges.length}
              </div>
              <div className="text-sm text-gray-500">Badges Earned</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 bg-gray-100">
            <TabsTrigger value="projects" className="data-[state=active]:bg-white">
              Projects ({products.length})
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="data-[state=active]:bg-white">
              Wishlist ({wishlist.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-white">
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            {mockProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(project => (
                  <Card 
                    key={project._id} 
                    className="group overflow-hidden hover:shadow-lg transition-all border-gray-200 cursor-pointer"
                  >
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      <ImageWithFallback
                        src={project.media[0]}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-lg mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {project.upvotes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {project.reviews.length}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No projects yet</p>
              </div>
            )}
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item: any) => (
                  <Card 
                    key={item._id} 
                    className="group overflow-hidden hover:shadow-lg transition-all border-gray-200 cursor-pointer"
                  >
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      <ImageWithFallback
                        src={item.productId?.media?.[0] || '/placeholder-product.jpg'}
                        alt={item.productId?.title || 'Product'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        fallback="/placeholder-product.jpg"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2">
                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                        {item.productId?.title || 'Untitled Product'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {item.productId?.description || 'No description available'}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          Added {new Date(item.addedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {item.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-600 italic">"{item.notes}"</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No wishlist items yet</p>
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-3">
            {activities.length > 0 ? (
              activities.map((activity: any, index: number) => (
                <Card key={activity._id || index} className="border-gray-200 hover:border-gray-300 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        {activity.type === 'launch' && <Zap className="w-5 h-5 text-blue-600" />}
                        {activity.type === 'update' && <TrendingUp className="w-5 h-5 text-orange-600" />}
                        {activity.type === 'milestone' && <Award className="w-5 h-5 text-slate-600" />}
                        {activity.type === 'collab' && <Users className="w-5 h-5 text-slate-600" />}
                        {activity.type === 'badge' && <Award className="w-5 h-5 text-slate-600" />}
                        {activity.type === 'upvote' && <Heart className="w-5 h-5 text-red-600" />}
                        {activity.type === 'review' && <MessageCircle className="w-5 h-5 text-blue-600" />}
                        {activity.type === 'comment' && <MessageCircle className="w-5 h-5 text-green-600" />}
                        {!activity.type && <Award className="w-5 h-5 text-slate-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 mb-1">
                          <span className="text-gray-700">{activity.action || 'Activity'}</span>
                          {' '}
                          {activity.target && (
                            <span className="text-blue-600 hover:underline cursor-pointer">
                              {activity.target}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
