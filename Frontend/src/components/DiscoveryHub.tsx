import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Flame, Clock, Filter, Grid3X3, List, ArrowUp, Trophy, Users, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { Product } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { WishlistButton } from './WishlistButton';

interface DiscoveryHubProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}
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
  createdAt: string;
}





interface TopUser {
  id: string;
  name: string;
  profilePicture: string;
  points: number;
  badges: string[];
}

export function DiscoveryHub() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('upvotes');
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
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
      case 'trending':
        return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
      case 'fresh':
        return (b.fresh ? 1 : 0) - (a.fresh ? 1 : 0);
      case 'reviews':
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
 
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold  mb-4">
          Discover the Next Big Thing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
          A community-driven platform where indie makers, students, and entrepreneurs showcase their latest innovations. 
          No funding required. Pure peer-to-peer discovery.
        </p>
        
        {/* Trend Pulse */}
        {/* <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold">Trend Pulse</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {trendingTopics.map((topic, index) => (
              <div key={index} className="text-center">
                <div className={`${topic.color} w-3 h-3 rounded-full mx-auto mb-2`} />
                <p className="text-sm font-medium mb-1">{topic.name}</p>
                <p className="text-xs text-green-600 font-semibold">{topic.growth}</p>
              </div>
            ))}
          </div>
        </div> */}
      </div>

      {/* Enhanced Filters and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upvotes">
                <div className="flex items-center">
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Most Upvotes
                </div>
              </SelectItem>
              <SelectItem value="trending">
                <div className="flex items-center">
                  <Flame className="w-4 h-4 mr-2" />
                  Trending
                </div>
              </SelectItem>
              <SelectItem value="fresh">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Fresh
                </div>
              </SelectItem>
              <SelectItem value="reviews">
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Most Reviews
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Product Grid/List */}
      <Tabs defaultValue="all" className="w-full">
        {/* <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="trending">
            <Flame className="w-4 h-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="fresh">
            <Clock className="w-4 h-4 mr-2" />
            Fresh
          </TabsTrigger>
        </TabsList> */}

        <TabsContent value="all">
          <ProductGrid 
            products={sortedProducts} 
            viewMode={viewMode} 
            onProductClick={handleProductClick}
          />
        </TabsContent>
        
        <TabsContent value="trending">
          <ProductGrid 
            products={sortedProducts.filter(p => p.trending)} 
            viewMode={viewMode} 
            onProductClick={handleProductClick}
          />
        </TabsContent>
        
        <TabsContent value="fresh">
          <ProductGrid 
            products={sortedProducts.filter(p => p.fresh)} 
            viewMode={viewMode} 
            onProductClick={handleProductClick}
          />
        </TabsContent>
      </Tabs>

      {/* Hidden Gems Section */}
      {/* <div className="mt-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Hidden Gems</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Promising products with high growth potential, discovered by our AI
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 3).map(product => (
            <Card 
              key={product.id} 
              className="group cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700"
              onClick={() => onProductClick(product)}
            >
              <CardHeader className="pb-3">
                <Badge className="w-fit mb-2 bg-purple-600 hover:bg-purple-700">
                  💎 Hidden Gem
                </Badge>
                <h3 className="font-semibold group-hover:text-purple-600 transition-colors">
                  {product.title}
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div> */}
        </div>

        {/* Sidebar - Top Users by Points */}
        <div className="lg:w-80">
          <Card className="sticky top-8">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold">Top Contributors</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Users with the most points this week
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {topUsers.length > 0 ? (
                topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {user.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt={user.name} 
                            className="w-6 h-6 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                        )}
                        <p className="text-sm font-medium truncate">
                          {user.name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {user.points} points
                        </span>
                        {user.badges && user.badges.length > 0 && (
                          <div className="flex items-center space-x-1">
                            {user.badges.slice(0, 2).map((badge, badgeIndex) => (
                              <span key={badgeIndex} className="text-xs">
                                🏆
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No top contributors yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface ProductGridProps {
  products: Product[];
  viewMode: 'grid' | 'list';
  onProductClick: (product: Product) => void;
}

function ProductGrid({ products, viewMode, onProductClick }: ProductGridProps) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map(product => (
          <Card 
            key={product._id}
            className="group cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => onProductClick(product)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="w-full md:w-32 h-20 md:h-44 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0" style={{width:'300px',height:'150px'}}>
                  <ImageWithFallback
                    src={product.media[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center space-x-2 ml-4">
                      {product.trending && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          <Flame className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      {product.fresh && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Fresh
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                           {product.author_profile ? (
                   <img 
                     src={product.author_profile} 
                     alt={product.author_name} 
                     className="w-6 h-6 rounded-full object-cover"
                     referrerPolicy="no-referrer"
                     loading="lazy"
                   />
                 ) : (
                   <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                     <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                       {product.author_name ? product.author_name.charAt(0).toUpperCase() : 'U'}
                     </span>
                   </div>
                 )}
                        {/* <Avatar className="w-6 h-6">
                          <AvatarImage src={product.author_profile} />
                          <AvatarFallback>{product.author_name.charAt(0)}</AvatarFallback>
                        </Avatar> */}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {product.author_name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{product.createdAt}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>↑ {product.upvotes.length}</span>
                      <span>💬 {product.reviews}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <Card 
          key={product._id}
          className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden"
          onClick={() => onProductClick(product)}
        >
          <div className="relative">
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <ImageWithFallback
               src={product.media[0]}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="absolute top-3 left-3 flex space-x-2">
              {product.trending && (
                <Badge className="bg-orange-500 hover:bg-orange-600">
                  <Flame className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              )}
              {product.fresh && (
                <Badge className="bg-green-500 hover:bg-green-600">
                  <Clock className="w-3 h-3 mr-1" />
                  Fresh
                </Badge>
              )}
            </div>
            <div className="absolute top-3 right-3 flex space-x-2">
              <Button size="sm" variant="ghost" className="bg-white/80 hover:bg-white/90 text-gray-700">
                ↑ {product.upvotes.length}
              </Button>
              <div onClick={(e) => e.stopPropagation()}>
                <WishlistButton productId={product._id} size="sm" className="bg-white/80 hover:bg-white/90" />
              </div>
            </div>
          </div>

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold group-hover:text-blue-600 transition-colors line-clamp-1">
                {product.title}
              </h3>
            </div>
            <Badge variant="outline" className="w-fit">
              {product.category}
            </Badge>
          </CardHeader>

          <CardContent className="pb-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
              {product.description}
            </p>
            <div className="flex flex-wrap gap-1 mb-4">
              {product.autoTags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>

          <CardFooter className="pt-0">
            <div className="flex items-center justify-between w-full">
               <div className="flex items-center space-x-2">
                 {product.author_profile ? (
                   <img 
                     src={product.author_profile} 
                     alt={product.author_name} 
                     className="w-6 h-6 rounded-full object-cover"
                     referrerPolicy="no-referrer"
                     loading="lazy"
                   />
                 ) : (
                   <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                     <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                       {product.author_name ? product.author_name.charAt(0).toUpperCase() : 'U'}
                     </span>
                   </div>
                 )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.author_name}
                </span>
              </div> 
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <span>💬 {product.reviews}</span>
                <span>{product.createdAt}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}