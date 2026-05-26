import React, { useState, useEffect, useContext } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Star,
  Trophy,
  Users,
  Briefcase,
  Github,
  Twitter,
  Globe,
  Edit3,
  Plus,
  ExternalLink,
  Heart,
  MessageCircle,
  Linkedin,
  Award,
  TrendingUp,
  Zap,
  Target,
  Trash,
  Mail
} from 'lucide-react';
import { UserContext } from '@/context/UserContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';

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
}

const mockAchievements = [
  { name: 'Early Adopter', description: 'Joined PeerRank in the first month', icon: '🚀', color: 'from-blue-500 to-blue-600' },
  { name: 'Top Reviewer', description: 'Provided 50+ helpful reviews', icon: '⭐', color: 'from-yellow-500 to-orange-500' },
  { name: 'AI Enthusiast', description: 'Active in AI Tools category', icon: '🤖', color: 'from-purple-500 to-purple-600' },
  { name: 'Community Builder', description: 'Helped 10+ makers with feedback', icon: '🤝', color: 'from-green-500 to-emerald-600' },
  { name: 'Trending Creator', description: 'Had 3 products in trending', icon: '🔥', color: 'from-red-500 to-orange-600' }
];

const mockStats = {
  totalUpvotes: 369,
  totalComments: 95,
  profileViews: 1247,
  followerGrowth: 23
};
export function UserProfile() {
  const [user, setUser] = useState<APIUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [digestOptIn, setDigestOptIn] = useState(false);
  const [digestLoading, setDigestLoading] = useState(false);
  const { user: currentUser } = useContext(UserContext);
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";
  const isOwnProfile = userId ;
  const handleEditProfile = () => {
     navigate(`/edit-profile/${userId}`);
   };
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, url]);

  // Fetch digest preference (own profile only)
  useEffect(() => {
    if (!isOwnProfile) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${url}/api/recommendations/digest-preference`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((data: { digestOptIn?: boolean } | null) => data && setDigestOptIn(!!data.digestOptIn))
      .catch(() => {});
  }, [url, isOwnProfile]);

  const handleDigestToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setDigestLoading(true);
    try {
      const res = await fetch(`${url}/api/recommendations/digest-preference`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ optIn: !digestOptIn }),
      });
      const data = await res.json().catch(() => ({}));
      setDigestOptIn(!!data.digestOptIn);
    } finally {
      setDigestLoading(false);
    }
  };

  // Fetch user's products
  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${url}/api/products/user/my-products`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.log('Could not fetch products');
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fields = [
      user.name,
      user.email,
      user.bio,
      user.profilePicture,
      user.makerStory,
      user.github,
      user.twitter,
      user.linkedin,
      user.website,
      
      // user.badges?.length > 0,
    ];
    const filledFields = fields.filter(field => field && field !== '').length;
    const completionPercentage = Math.round((filledFields / fields.length) * 100);
    setProfileCompletion(completionPercentage);
  }, [user]);

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    const id = productToDelete._id;
    try {
      setDeletingProductId(id);
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${url}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Delete failed' }));
        throw new Error(err.error || 'Delete failed');
      }

      setProducts(prev => prev.filter(p => p._id !== id));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Delete product error:', err);
      window.alert(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeletingProductId(null);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
    </div>
  );
  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-zinc-500">User not found</div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Cover / top bar */}
      <div className="relative h-48 bg-zinc-950 border-b border-zinc-900">
        <div className="absolute top-6 left-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative mb-8" style={{marginTop: '-80px'}}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                  {/* <div style={{ height: '100px', width: '100px',borderRadius: '50%' }}> */}
               <Avatar style={{ height: '100px', width: '100px' }}>
                                                {user.profilePicture &&
            
                               <img
                               src={user.profilePicture}
                               alt={user.name}
                               referrerPolicy="no-referrer"
                               loading="lazy"
                               style={{width:"100%",objectFit:'cover'}}
                               />
                              }
                                             {!user.profilePicture &&   <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>}
                                              </Avatar>
                {/* </div> */}

                <div className="mt-4 text-center md:text-left">
                  <h1 className="text-3xl mb-2">{user.name}</h1>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {user.badges.map((badgeItem) => (
                      <Badge key={badgeItem._id || badgeItem.badge} className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700">
                        <Award className="w-3 h-3 mr-1" />
                        {badgeItem.badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1">
                <div className="flex justify-end mb-4">
                  <button className="flex items-center gap-2 bg-white text-black text-xs font-semibold px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors" onClick={handleEditProfile}>
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center text-zinc-400">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span className="capitalize">{user.role}</span>
                  </div>

                  <div className="flex items-center text-zinc-400">
                    <Star className="w-4 h-4 mr-2 text-zinc-400" />
                    <span>{user.badges.length} Badges</span>
                  </div>
                </div>

                {/* Social Links */}
                {(user.github || user.twitter || user.linkedin || user.website) && (
                  <div className="flex flex-wrap gap-2">
                    {user.github && (
                      <a href={user.github} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-white hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors">
                        <Github className="w-3.5 h-3.5" />GitHub
                      </a>
                    )}
                    {user.twitter && (
                      <a href={user.twitter} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-white hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors">
                        <Twitter className="w-3.5 h-3.5" />Twitter
                      </a>
                    )}
                    {user.linkedin && (
                      <a href={user.linkedin} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-white hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors">
                        <Linkedin className="w-3.5 h-3.5" />LinkedIn
                      </a>
                    )}
                    {user.website && (
                      <a href={user.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-white hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors">
                        <Globe className="w-3.5 h-3.5" />Website
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion Banner */}
        {profileCompletion > 0 && profileCompletion < 100 && (
          <div className="mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-medium">Complete Your Profile — {profileCompletion}%</span>
                </div>
                <button onClick={handleEditProfile} className="text-xs text-zinc-400 hover:text-white underline underline-offset-2 transition-colors">
                  Complete Now →
                </button>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${profileCompletion}%` }} />
              </div>
              <p className="text-xs text-zinc-600 mt-2">Add more details to increase visibility</p>
            </div>
          </div>
        )}

        {/* Weekly digest (own profile only) */}
        {isOwnProfile && (
          <div className="mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="border-b border-zinc-800 px-6 py-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-semibold">AI Recommendations</span>
              </div>
              <div className="p-6">
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-white">Weekly digest email</p>
                    <p className="text-xs text-zinc-500 mt-1">Get top products and feedback sentiment in your inbox every week.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={digestOptIn}
                    disabled={digestLoading}
                    onChange={handleDigestToggle}
                    className="rounded border-zinc-600 bg-zinc-800 text-white focus:ring-zinc-500"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* About/Description Section */}
        <div className="mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">About</span>
            </div>
            <div className="p-6">
              {user.bio ? (
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {user.bio}
                </p>
              ) : (
                <div className="text-center py-6">
                  <p className="text-zinc-600 text-sm mb-4">No bio added yet.</p>
                  <Button variant="outline" onClick={handleEditProfile} className="border-zinc-700 text-zinc-400 hover:text-white hover:border-white/30">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Add Bio
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-6 h-6 text-zinc-400" />
            </div>
            <div className="text-3xl font-bold mb-1">{products.length}</div>
            <div className="text-sm text-zinc-500">Products</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-6 h-6 text-zinc-400" />
            </div>
            <div className="text-3xl font-bold mb-1">{user.totalUpvotes}</div>
            <div className="text-sm text-zinc-500">Total Upvotes</div>
          </div>
        </div>

        {/* Maker Story */}
        {user.makerStory && (
          <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">My Maker Journey</span>
            </div>
            <div className="p-6">
              <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {user.makerStory}
              </p>
            </div>
          </div>
        )}

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="flex w-full gap-1 mb-8 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <TabsTrigger value="projects" className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-semibold rounded-lg">
              <Briefcase className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-semibold rounded-lg">
              <Briefcase className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <div key={product._id} className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-all">
                    <div className="relative h-44 bg-zinc-800 overflow-hidden">
                      {product.media[0] && (
                        <ImageWithFallback
                          src={product.media[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                        <button
                          className="p-1.5 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
                          onClick={() => navigate(`/edit-product/${product._id}`)}
                          disabled={Boolean(deletingProductId)}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                          onClick={() => handleDeleteProduct(product)}
                          disabled={Boolean(deletingProductId)}
                        >
                          {deletingProductId === product._id
                            ? <span className="text-xs px-1">...</span>
                            : <Trash className="w-3.5 h-3.5" />}
                        </button>
                        {product.demoUrl && (
                          <a href={product.demoUrl} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      {product.category && (
                        <div className="absolute top-3 left-3">
                          <span className="text-[10px] bg-black/80 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full">
                            {product.category}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold mb-1.5 group-hover:text-zinc-300 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{product.pitch}</p>
                      <div className="flex items-center gap-3 text-xs text-zinc-600">
                        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{product.upvotes.length}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{product.reviews.length}</span>
                      </div>
                      {product.autoTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.autoTags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-zinc-800 rounded-xl p-16 text-center">
                <Briefcase className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
                <h3 className="text-sm font-semibold mb-1">No Products Yet</h3>
                <p className="text-zinc-600 text-xs mb-6">Start building and showcase your amazing products!</p>
                <button className="bg-white text-black text-xs font-semibold px-5 py-2 rounded-lg hover:bg-zinc-200 transition-colors" onClick={() => navigate('/submit-product')}>
                  <Plus className="w-3.5 h-3.5 inline mr-1.5" />Submit Your First Product
                </button>
              </div>
            )}
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            {user.portfolio && user.portfolio.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.portfolio.map((item, index) => (
                  <div key={item._id || index} className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-all">
                    <div className="relative h-44 bg-zinc-800 overflow-hidden">
                      {item.media && item.media[0] ? (
                        <img src={item.media[0]} alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Briefcase className="w-10 h-10 text-zinc-600" />
                        </div>
                      )}
                      {item.demoUrl && (
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={item.demoUrl} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 bg-white text-black rounded-lg flex items-center">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                      {item.demoUrl && (
                        <a href={item.demoUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                          View Project <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-zinc-800 rounded-xl p-16 text-center">
                <Briefcase className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
                <h3 className="text-sm font-semibold mb-1">No Portfolio Items Yet</h3>
                <p className="text-zinc-600 text-xs mb-6">Add portfolio items to showcase your work!</p>
                <button className="bg-white text-black text-xs font-semibold px-5 py-2 rounded-lg hover:bg-zinc-200 transition-colors" onClick={() => navigate('/edit-profile')}>
                  <Plus className="w-3.5 h-3.5 inline mr-1.5" />Add Portfolio Item
                </button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 z-10">
            <h3 className="text-sm font-semibold mb-3">Delete product</h3>
            <p className="text-xs text-zinc-400 mb-6">Are you sure you want to delete <strong className="text-white">{productToDelete.title}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button className="border border-zinc-700 text-zinc-400 hover:text-white text-xs px-4 py-2 rounded-lg transition-colors"
                onClick={() => { setShowDeleteModal(false); setProductToDelete(null); }}>
                Cancel
              </button>
              <button className="bg-white text-black text-xs font-semibold px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
                onClick={confirmDelete} disabled={Boolean(deletingProductId)}>
                {deletingProductId === productToDelete._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
