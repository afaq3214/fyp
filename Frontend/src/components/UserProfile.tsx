import React, { useState, useEffect } from 'react';
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
  Trash
} from 'lucide-react';
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
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";
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
  }, []);

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

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="min-h-screen  bg-gray-50">
      {/* Cover Image */}
      <div className="relative  h-64 " style={{backgroundColor:'black'}}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-6 left-6" style={{position: 'absolute', top: '1.5rem', left: '1.5rem'}}>
          <Button
            variant="secondary"
            onClick={() => window.history.back()}
            className="bg-white/90 hover:bg-white"
            style={{backgroundColor: 'rgba(255, 255, 255, 0.9)'}}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discovery
          </Button>
        </div>
      </div>

      <div className="container mx-auto mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative  mb-8" style={{marginTop: '-80px'}}>
          <div className="bg-white rounded-2xl shadow-lg p-8">
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
                      <Badge key={badgeItem._id || badgeItem.badge} className="bg-blue-100 text-blue-700 hover:bg-blue-200">
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
                  <Button    className="cursor-pointer"      onClick={handleEditProfile}> 
                    <Edit3 className="w-4 h-4 mr-2 cursor-pointer" />
                    Edit Profile
                  </Button>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span className="capitalize">{user.role}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    <span>{user.badges.length} Badges</span>
                  </div>
                </div>

                {/* Social Links */}
                {(user.github || user.twitter || user.linkedin || user.website) && (
                  <div className="flex flex-wrap gap-2">
                    {user.github && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={user.github} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-1" />
                          GitHub
                        </a>
                      </Button>
                    )}
                    {user.twitter && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={user.twitter} target="_blank" rel="noopener noreferrer">
                          <Twitter className="w-4 h-4 mr-1" />
                          Twitter
                        </a>
                      </Button>
                    )}
                    {user.linkedin && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={user.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-4 h-4 mr-1" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {user.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={user.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-4 h-4 mr-1" />
                          Website
                        </a>
                      </Button>
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
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h3 className="text-blue-900">Complete Your Profile - {profileCompletion}%</h3>
                  </div>
                  <Button variant="link" onClick={handleEditProfile} className="text-blue-600 hover:text-blue-700">
                    Complete Now →
                  </Button>
                </div>
                <Progress value={profileCompletion} className="h-2" />
                <p className="text-sm text-blue-700 mt-3">
                  Add more details to increase visibility and unlock premium features!
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* About/Description Section */}
        <div className="mb-8">
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {user.bio ? (
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {user.bio}
                </p>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">No bio added yet. Tell the community about yourself!</p>
                  <Button variant="outline"  onClick={handleEditProfile} className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Add Bio
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8 text-blue-600" />
               
              </div>
              <div className="text-3xl mb-1">{products.length}</div>
              <div className="text-sm text-gray-600">Products</div>
            </CardContent>
          </Card>

          

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-8 h-8 text-orange-600" />
                
              </div>
              <div className="text-3xl mb-1">{user.totalUpvotes}</div>
              <div className="text-sm text-gray-600">Total Upvotes</div>
            </CardContent>
          </Card>

          
        </div>

        {/* Maker Story */}
        {user.makerStory && (
          <Card className="mb-8 border-2 border-orange-200 bg-gradient-to-br from-orange-50/50 to-amber-50/50">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-500" />
                My Maker Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {user.makerStory}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full max-w-lg  mb-8 bg-transparent">
            <TabsTrigger value="projects" style={{width:"500px"}} className="flex  items-center text-3xl gap-2" >
              <Briefcase size={80} />
              Products
            </TabsTrigger>
            {/* <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Activity
            </TabsTrigger> */}
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <Card key={product._id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200">
                    <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
                      {product.media[0] && (
                        <ImageWithFallback
                          src={product.media[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                          onClick={() => navigate(`/edit-product/${product._id}`)}
                          disabled={Boolean(deletingProductId)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>

                        <Button 
                          size="sm" 
                          className="bg-red-100 hover:bg-red-200 text-gray-900 cursor-pointer"
                          onClick={() => handleDeleteProduct(product)}
                          disabled={Boolean(deletingProductId)}
                          title="Delete product"
                        >
                          {deletingProductId === product._id ? (
                            // simple loading indicator
                            <span className="w-4 h-4 inline-block animate-pulse">...</span>
                          ) : (
                            <Trash className="w-4 h-4 text-black cursor-pointer bg-white rounded-b-full" style={{width:"30px",height:"30px",borderRadius:"5px"}} />
                          )}
                        </Button>

                        <Button size="sm" className="bg-white hover:bg-gray-100 text-gray-900" asChild>
                          <a href={product.demoUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                      {product.category && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                            {product.category}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5" style={{padding:'15px'}}>
                      <h3 className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.pitch}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {product.upvotes.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {product.reviews.length}
                        </span>
                      </div>
                      {product.autoTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {product.autoTags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="w-24 h-24  bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 " style={{marginTop:"10px"}}>
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl mb-2 text-gray-900">No Products Yet</h3>
                <p className="text-gray-600 mb-6">Start building and showcase your amazing products!</p>
                <Button className="mx-auto  text-md p-10" style={{backgroundColor:"black",width:'300px',marginBottom:"10px"}} onClick={() => navigate('/submit-product')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Your First Product
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="mb-1">Next Achievement</h3>
                    <p className="text-sm text-gray-600">Collaboration Master - 7/10 completed</p>
                  </div>
                  <Trophy className="w-10 h-10 text-blue-600" />
                </div>
                <Progress value={70} className="h-3 mb-2" />
                <p className="text-sm text-gray-700">
                  Complete 3 more collaborations to unlock this prestigious badge! 🎯
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockAchievements.map((achievement, index) => (
                <Card key={index} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-gray-100">
                  <div className={`h-2 bg-gradient-to-r ${achievement.color}`}></div>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl group-hover:scale-110 transition-transform">
                      {achievement.icon}
                    </div>
                    <h3 className="mb-2">{achievement.name}</h3>
                    <p className="text-sm text-gray-600">
                      {achievement.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            {[
              { action: 'Received upvote on', target: 'AI Writing Assistant', time: '2 hours ago', icon: '👍', color: 'bg-blue-100 text-blue-600' },
              { action: 'Left review on', target: 'TaskFlow Pro', time: '1 day ago', icon: '💬', color: 'bg-purple-100 text-purple-600' },
              { action: 'Connected with', target: 'Sarah Chen', time: '2 days ago', icon: '🤝', color: 'bg-green-100 text-green-600' },
              { action: 'Updated project', target: 'CodeSnap', time: '3 days ago', icon: '✏️', color: 'bg-orange-100 text-orange-600' },
              { action: 'Earned badge', target: 'Top Reviewer', time: '1 week ago', icon: '🏆', color: 'bg-yellow-100 text-yellow-600' }
            ].map((activity, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${activity.color} rounded-full flex items-center justify-center text-xl flex-shrink-0`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="mb-1">
                        <span className="text-gray-700">{activity.action}</span>
                        {' '}
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {activity.target}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-10">
            <h3 className="text-lg font-semibold mb-4">Delete product</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete <strong>{productToDelete.title}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="cursor-pointer" onClick={() => { setShowDeleteModal(false); setProductToDelete(null); }}>
                Cancel
              </Button>
              <Button className="cursor-pointer bg-red-600 hover:bg-red-700 text-white" style={{backgroundColor:'red'}} onClick={confirmDelete} disabled={Boolean(deletingProductId)}>
                {deletingProductId === productToDelete._id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
