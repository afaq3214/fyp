import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Flame, Clock, Filter, Grid3X3, List, ArrowUp } from 'lucide-react';
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

const trendingTopics = [
  { name: 'AI & Machine Learning', growth: '+24%', color: 'bg-blue-500' },
  { name: 'No-Code Tools', growth: '+18%', color: 'bg-purple-500' },
  { name: 'Remote Work', growth: '+15%', color: 'bg-green-500' },
  { name: 'Blockchain', growth: '+12%', color: 'bg-orange-500' },
  { name: 'Health Tech', growth: '+10%', color: 'bg-pink-500' }
];

export function DiscoveryHub() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('trending');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const filteredProducts = products.filter(product => 
    selectedCategory === 'All Categories' || product.category === selectedCategory
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
      case 'popular':
        return b.upvotes - a.upvotes;
      case 'fresh':
        return (b.fresh ? 1 : 0) - (a.fresh ? 1 : 0);
      default:
        return 0;
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
 
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r  from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
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

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
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
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">
                <div className="flex items-center">
                  <Flame className="w-4 h-4 mr-2" />
                  Trending
                </div>
              </SelectItem>
              <SelectItem value="popular">
                <div className="flex items-center">
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Popular
                </div>
              </SelectItem>
              <SelectItem value="fresh">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Fresh
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
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="trending">
            <Flame className="w-4 h-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="fresh">
            <Clock className="w-4 h-4 mr-2" />
            Fresh
          </TabsTrigger>
        </TabsList>

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
        {mockProducts.map(product => (
          <Card 
            key={product.id}
            className="group cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => onProductClick(product)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="w-full md:w-32 h-20 md:h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                  <ImageWithFallback
                    src={product.image}
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
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={product.author.profilePicture} />
                          <AvatarFallback>{product.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {product.author.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{product.createdAt}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>↑ {product.upvotes}</span>
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
      {mockProducts.map(product => (
        <Card 
          key={product.id}
          className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden"
          onClick={() => onProductClick(product)}
        >
          <div className="relative">
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <ImageWithFallback
                src={product.image}
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
            <div className="absolute top-3 right-3">
              <Button size="sm" variant="ghost" className="bg-white/80 hover:bg-white/90 text-gray-700">
                ↑ {product.upvotes}
              </Button>
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
              {product.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>

          <CardFooter className="pt-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={product.author.profilePicture} />
                  <AvatarFallback>{product.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.author.name}
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