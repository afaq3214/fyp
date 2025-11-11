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
  ExternalLink,
  Heart,
  MessageCircle,
  Linkedin,
  Award,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useParams, useNavigate } from 'react-router-dom';

interface APIUser {
  _id: string;
  name: string;
  email: string;
  badges: string[];
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
  tags: string[];
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

export default function ProductOwner() {
  const [user, setUser] = useState<APIUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    <div className="min-h-screen relative bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Enhanced Cover Section */}
      <div className="absolute w-full h-80 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 ">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        
        {/* Back Button */}
        <div className="relative max-w-7xl mx-auto px-6 pt-8">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-32 pb-12 z-10 absolute" style={{marginTop:"130px"}}>
        {/* Enhanced Profile Card */}
        <Card className="bg-white  border-2 border-white/50 shadow-2xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Avatar Section */}
              <div className="flex flex-col  lg:items-start space-y-4">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                                    <Avatar style={{ height: '100px', width: '100px' }}>
                                    {user.profilePicture &&

                   <img
                   src={user.profilePicture}
                   alt={user.name}
                   referrerPolicy="no-referrer"
                   loading="lazy"
                   />
                  }
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                </div>
                <div className="text-center lg:text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {user.name}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <Briefcase className="w-4 h-4" />
                    <span className="capitalize font-medium">{user.role}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {user.badges.map(badge => (
                      <Badge key={badge} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-shadow">
                        <Award className="w-3 h-3 mr-1" />
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                    <div className="text-xs text-gray-600 mt-1">Products</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl font-bold text-purple-600">{user.portfolio.length}</div>
                    <div className="text-xs text-gray-600 mt-1">Projects</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl font-bold text-orange-600">{user.totalUpvotes}</div>
                    <div className="text-xs text-gray-600 mt-1">Upvotes</div>
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{user.badges.length} Achievement Badges</span>
                  </div>
                </div>

                {/* Social Links */}
                {(user.github || user.twitter || user.linkedin || user.website) && (
                  <div className="flex flex-wrap gap-2">
                    {user.github && (
                      <Button variant="outline" size="sm" className="hover:bg-gray-900 hover:text-white transition-colors" asChild>
                        <a href={user.github} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />GitHub
                        </a>
                      </Button>
                    )}
                    {user.twitter && (
                      <Button variant="outline" size="sm" className="hover:bg-blue-400 hover:text-white transition-colors" asChild>
                        <a href={user.twitter} target="_blank" rel="noopener noreferrer">
                          <Twitter className="w-4 h-4 mr-2" />Twitter
                        </a>
                      </Button>
                    )}
                    {user.linkedin && (
                      <Button variant="outline" size="sm" className="hover:bg-blue-700 hover:text-white transition-colors" asChild>
                        <a href={user.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-4 h-4 mr-2" />LinkedIn
                        </a>
                      </Button>
                    )}
                    {user.website && (
                      <Button variant="outline" size="sm" className="hover:bg-indigo-600 hover:text-white transition-colors" asChild>
                        <a href={user.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-4 h-4 mr-2" />Website
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Achievements Section */}
        {user.achievements && user.achievements.length > 0 && (
          <Card className="mb-8 border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Trophy className="w-5 h-5 text-purple-600" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(achievement.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Section */}
        <Card className="mb-8 border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50" style={{padding:"26px"}}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold">Products by {user.name}</h3>
                  <p className="text-sm text-gray-600 font-normal mt-1">{products.length} {products.length === 1 ? 'product' : 'products'} created</p>
                </div>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <Card 
                    key={product._id} 
                    className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 cursor-pointer"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
                      {product.media[0] && (
                        <ImageWithFallback
                          src={product.media[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" className="bg-white hover:bg-gray-100 text-gray-900" asChild>
                          <a href={product.demoUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
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
                    <CardContent className="p-5" style={{padding:'20px'}}>
                      <h3 className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.pitch}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600" style={{marginTop:'10px',marginBottom:'10px'}}>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {product.upvotes.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {product.reviews.length}
                        </span>
                      </div>
                      {product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {product.tags.slice(0, 3).map((tag, index) => (
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
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl mb-2 text-gray-900">No Products Yet</h3>
                <p className="text-gray-600">This user hasn't submitted any products yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}