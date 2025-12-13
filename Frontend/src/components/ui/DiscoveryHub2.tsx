import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Flame, Clock, Filter, Grid3X3, List, ArrowUp, Star, Sparkles, Zap, Users, Award, Activity, MessageSquare, Heart, Bookmark, Share2, BarChart3 } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardFooter, CardHeader } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import type { Product } from '@/App';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface TopUser {
  id: string;
  name: string;
  profilePicture: string;
  points: number;
  badges: string[];
  projects?: number;
  engagementScore?: number;
}

const categories = [
  'All Categories',
  'AI Tools',
  'Productivity',
  'Developer Tools',
  'Design',
  'SaaS',
  'Mobile Apps',
  'Web Apps'
];

export function DiscoveryHub() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('upvotes');
  
  const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch products
        const productsResponse = await fetch(`${url}/api/products`);
        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const productsData = await productsResponse.json();
        setProducts(productsData);
        
        // Fetch top users by points
        const usersResponse = await fetch(`${url}/api/users/top-users?limit=10`);
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setTopUsers(usersData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product._id}`);
  };

  const filteredProducts = products.filter(product => 
    selectedCategory === 'All Categories' || product.category === selectedCategory
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'upvotes':
        return b.upvotes.length - a.upvotes.length;
      case 'popular':
        return b.upvotes.length - a.upvotes.length;
      case 'fresh':
        return (b.fresh ? 1 : 0) - (a.fresh ? 1 : 0);
      case 'reviews':
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><div className="text-lg">Loading...</div></div>;
  if (error) return <div className="flex justify-center items-center min-h-screen"><div className="text-lg text-red-600">Error: {error}</div></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Simple Top Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Discovery Hub</h1>
              <p className="text-slate-600 mt-1">Explore products and connect with top makers</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">{products.length}</div>
                <div className="text-xs text-slate-500">Active Products</div>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">{topUsers.length}</div>
                <div className="text-xs text-slate-500">Top Makers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* About Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-slate-900 mb-2">Welcome to PeerRank Discovery</h2>
                <p className="text-slate-600 leading-relaxed">
                  A community-driven platform where students, indie makers, and entrepreneurs showcase their projects with equal opportunity. 
                  Discover innovative products ranked by genuine peer feedback, not paid promotions. Upvote products you love, write reviews, 
                  and connect with makers building the future.
                </p>
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>Merit-based ranking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span>Community-driven</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span>Real-time updates</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* New Layout - 3 Column: Top Makers | Products | Activity Feed */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SIDEBAR - Top Makers */}
          <div className="col-span-12 md:col-span-3">
            <div className="sticky top-6">
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                  <h2 className="font-semibold text-slate-900">Top Makers</h2>
                  <p className="text-xs text-slate-500 mt-1">Most active this week</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {topUsers.slice(0, 8).map((user, index) => (
                    <div key={user.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          {user.profilePicture ? (
                            <img 
                              src={user.profilePicture} 
                              alt={user.name} 
                              className="w-10 h-10 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                          ) : (
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-slate-200 text-slate-700">
                                {user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="absolute -top-1 -left-1 w-5 h-5 bg-slate-900 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-slate-900 truncate">{user.name}</div>
                          {user.badges && user.badges.length > 0 && (
                            <div className="text-xs text-slate-500 mt-0.5">
                              {typeof user.badges[0] === 'string' ? user.badges[0] : user.badges[0]?.badge || 'Badge'}
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span>{user.projects || 0} products</span>
                            <span>•</span>
                            <span>{user.points || 0} pts</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CENTER - Main Products Feed */}
          <div className="col-span-12 md:col-span-6">
            {/* Filters Bar */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upvotes">Most Upvotes</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="fresh">Fresh</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex-1" />

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`h-7 px-3 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`h-7 px-3 ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="space-y-4">
              {sortedProducts.map((product, index) => (
                <Card 
                  key={product._id}
                  className="group cursor-pointer hover:shadow-md transition-all duration-200 border-slate-200 bg-white"
                  onClick={() => handleProductClick(product)}
                >
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        <ImageWithFallback
                          src={product.media && product.media[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {product.title}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                          
                          {/* Upvote Button */}
                          <button className="flex flex-col items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors">
                            <ArrowUp className="w-4 h-4 text-slate-600" />
                            <span className="text-sm font-semibold text-slate-900">{product.upvotes.length}</span>
                          </button>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {product.author_profile ? (
                                <img 
                                  src={product.author_profile} 
                                  alt={product.author_name} 
                                  className="w-6 h-6 rounded-full object-cover"
                                  referrerPolicy="no-referrer"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-700">
                                    {product.author_name ? product.author_name.charAt(0).toUpperCase() : 'U'}
                                  </span>
                                </div>
                              )}
                              <span className="text-sm text-slate-600">{product.author_name}</span>
                            </div>
                            <span className="text-slate-300">•</span>
                            <span className="text-sm text-slate-500">{product.createdAt}</span>
                          </div>

                          {/* Engagement Stats */}
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{product.reviews}</span>
                            </div>
                            {product.trending && (
                              <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-0">
                                <Flame className="w-3 h-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                            {product.fresh && (
                              <Badge variant="secondary" className="bg-green-50 text-green-700 border-0">
                                Fresh
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* RIGHT SIDEBAR - Recent Activity & Stats */}
          <div className="col-span-12 md:col-span-3">
            <div className="sticky top-6 space-y-6">
              
              {/* Community Stats */}
              <div className="bg-white rounded-lg border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Community Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">Products Launched</span>
                      <span className="text-sm font-semibold text-slate-900">{products.length}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{width: '75%'}} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">Total Upvotes</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {products.reduce((sum, p) => sum + (p.upvotes?.length || 0), 0)}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-600 rounded-full" style={{width: '60%'}} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">Reviews Written</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {products.reduce((sum, p) => sum + p.reviews, 0)}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full" style={{width: '85%'}} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-slate-200">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">Recent Activity</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {products.slice(0, 5).map((product, index) => (
                    <div key={index} className="p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        {product.author_profile ? (
                          <img 
                            src={product.author_profile} 
                            alt={product.author_name} 
                            className="w-8 h-8 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              {product.author_name ? product.author_name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900">
                            <span className="font-medium">{product.author_name}</span>
                            {' launched '}
                            <span className="font-medium">{product.title}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{product.createdAt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Categories */}
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Trending Categories</h3>
                <div className="space-y-2">
                  {['AI Tools', 'Productivity', 'Design', 'Developer Tools'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}