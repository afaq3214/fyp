import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Flame, Clock, Grid3X3, List, ArrowUp,
  Trophy, Users, Star, Award, Zap, Sparkles, MessageSquare
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from './ui/select';
import type { Product } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { WishlistButton } from './WishlistButton';
import { HiddenGemsFeed } from './DiscoveryHub/HiddenGemsFeed/HiddenGemsFeed';
import { HoverPreview } from './DiscoveryHub/HoverPreviews/HoverPreviews';

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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('upvotes');
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [activeTab, setActiveTab] = useState<'discover' | 'trending' | 'fresh' | 'gems'>('discover');
  const url = import.meta.env.VITE_API_URL || 'https://fyp-1ejm.vercel.app';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, usersRes] = await Promise.all([
          fetch(`${url}/api/products`),
          fetch(`${url}/api/users/top-users?limit=10`),
        ]);
        if (!productsRes.ok) throw new Error('Failed to fetch products');
        const productsData = await productsRes.json();
        setProducts(productsData);
        setFilteredProducts(productsData);
        if (usersRes.ok) setTopUsers(await usersRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProductClick = (product: Product) => navigate(`/product/${product._id}`);

  const categories = ['All Categories', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const sorted = [...filteredProducts]
    .filter(p => selectedCategory === 'All Categories' || p.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'upvotes') return b.upvotes.length - a.upvotes.length;
      if (sortBy === 'trending') return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
      if (sortBy === 'fresh') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'reviews') return b.reviews - a.reviews;
      return 0;
    });

  const tabProducts = {
    discover: sorted,
    trending: sorted.filter(p => p.trending),
    fresh: sorted.filter(p => p.fresh),
    gems: sorted,
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh] bg-black">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh] bg-black text-zinc-400">
      {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Page header */}
      <div className="border-b border-zinc-900 bg-zinc-950 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Discovery Hub</h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              Ranked by genuine peer feedback
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-bold text-white">{products.length}</div>
              <div className="text-zinc-600 text-xs">Products</div>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center">
              <div className="font-bold text-white">{topUsers.length}</div>
              <div className="text-zinc-600 text-xs">Makers</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Left sidebar – Leaderboard */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Leaderboard
              </p>
              <div className="space-y-1">
                {topUsers.slice(0, 10).map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/profile/${user.id}`)}
                  >
                    <span className={`w-5 text-xs font-bold text-center shrink-0 ${
                      index === 0 ? 'text-white' :
                      index === 1 ? 'text-zinc-400' :
                      index === 2 ? 'text-zinc-500' :
                      'text-zinc-600'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="relative shrink-0">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-7 h-7 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center">
                          <span className="text-xs font-bold text-zinc-400">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-300 group-hover:text-white truncate transition-colors">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-zinc-600">{user.points} pts</p>
                    </div>
                  </div>
                ))}
                {topUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                    <p className="text-xs text-zinc-600">No contributors yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center – Product list */}
          <div className="flex-1 min-w-0">
            {/* Filter bar */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-white text-sm h-9">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-white text-sm h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="upvotes">
                    <div className="flex items-center gap-2"><ArrowUp className="w-3.5 h-3.5" />Most Upvotes</div>
                  </SelectItem>
                  <SelectItem value="trending">
                    <div className="flex items-center gap-2"><Flame className="w-3.5 h-3.5" />Trending</div>
                  </SelectItem>
                  <SelectItem value="fresh">
                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />Newest</div>
                  </SelectItem>
                  <SelectItem value="reviews">
                    <div className="flex items-center gap-2"><Star className="w-3.5 h-3.5" />Most Reviews</div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="ml-auto flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-900 mb-5">
              {([
                { id: 'discover', label: 'All' },
                { id: 'trending', label: 'Trending', icon: <Flame className="w-3.5 h-3.5" /> },
                { id: 'fresh', label: 'Newest', icon: <Clock className="w-3.5 h-3.5" /> },
                { id: 'gems', label: 'Hidden Gems', icon: <Sparkles className="w-3.5 h-3.5" /> },
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 pb-3 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === tab.id
                      ? 'border-white text-white'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab.icon}{tab.label}
                </button>
              ))}
            </div>

            {/* Product grid/list */}
            {activeTab === 'gems' ? (
              <HiddenGemsFeed products={products} onProductClick={handleProductClick} />
            ) : viewMode === 'list' ? (
              <ProductListView
                products={tabProducts[activeTab]}
                onProductClick={handleProductClick}
              />
            ) : (
              <ProductGridView
                products={tabProducts[activeTab]}
                onProductClick={handleProductClick}
              />
            )}
          </div>

          {/* Right sidebar */}
          <div className="hidden xl:block w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Stats card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Platform Stats</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />Products
                    </span>
                    <span className="text-sm font-bold text-white">{products.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />Makers
                    </span>
                    <span className="text-sm font-bold text-white">{topUsers.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />Trending
                    </span>
                    <span className="text-sm font-bold text-white">
                      {products.filter(p => p.trending).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />Fresh
                    </span>
                    <span className="text-sm font-bold text-white">
                      {products.filter(p => p.fresh).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Daily Quests teaser */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Daily Quests</p>
                <p className="text-xs text-zinc-600 mb-3">Complete quests to earn points and badges</p>
                <button
                  onClick={() => navigate('/quests')}
                  className="w-full bg-white text-black text-xs font-semibold py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  View Quests
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Product List View (PH-style rows) ─── */
function ProductListView({ products, onProductClick }: { products: Product[]; onProductClick: (p: Product) => void }) {
  if (products.length === 0) return <EmptyState />;
  return (
    <div className="space-y-2">
      {products.map((product, idx) => (
        <HoverPreview key={product._id} product={product} onProductClick={onProductClick}>
          <div
            className="group flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-4 py-3.5 cursor-pointer transition-all"
            onClick={() => onProductClick(product)}
          >
            {/* Rank */}
            <span className="text-xs text-zinc-700 font-mono w-4 text-right shrink-0">{idx + 1}</span>

            {/* Thumbnail */}
            <div className="w-20 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
              <ImageWithFallback
                src={product.media?.[0]}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-0.5">
                <h3 className="font-semibold text-white text-sm leading-snug group-hover:text-zinc-200 transition-colors">
                  {product.title}
                </h3>
                {product.trending && (
                  <span className="shrink-0 text-[10px] border border-zinc-700 text-zinc-500 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5" />Hot
                  </span>
                )}
                {product.fresh && (
                  <span className="shrink-0 text-[10px] border border-zinc-700 text-zinc-500 px-1.5 py-0.5 rounded-full">
                    New
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 line-clamp-1 mb-1.5">{product.pitch || product.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {product.category && (
                  <span className="text-[10px] font-medium border border-zinc-800 text-zinc-600 px-2 py-0.5 rounded-full">
                    {product.category}
                  </span>
                )}
                {product.autoTags?.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-[10px] text-zinc-600">#{tag}</span>
                ))}
              </div>
            </div>

            {/* Author + date */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              {product.author_profile ? (
                <img
                  src={product.author_profile}
                  alt={product.author_name}
                  className="w-5 h-5 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center">
                  <span className="text-[10px] text-zinc-400">
                    {product.author_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-xs text-zinc-500 max-w-[80px] truncate">{product.author_name}</span>
            </div>

            {/* Comments */}
            <div className="hidden sm:flex items-center gap-1 text-zinc-600 shrink-0">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-xs">{product.reviews}</span>
            </div>

            {/* Upvote button */}
            <div className="shrink-0 flex flex-col items-center border border-zinc-700 rounded-lg px-3 py-2 min-w-[48px] hover:border-zinc-500 transition-colors">
              <TrendingUp className="w-3.5 h-3.5 text-zinc-500 mb-0.5" />
              <span className="text-xs font-bold text-white">{product.upvotes.length}</span>
            </div>
          </div>
        </HoverPreview>
      ))}
    </div>
  );
}

/* ─── Product Grid View ─── */
function ProductGridView({ products, onProductClick }: { products: Product[]; onProductClick: (p: Product) => void }) {
  if (products.length === 0) return <EmptyState />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(product => (
        <HoverPreview key={product._id} product={product} onProductClick={onProductClick}>
          <div
            className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden cursor-pointer transition-all"
            onClick={() => onProductClick(product)}
          >
            {/* Thumbnail */}
            <div className="relative h-44 bg-zinc-800 overflow-hidden">
              <ImageWithFallback
                src={product.media?.[0]}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.category && (
                <span className="absolute top-3 left-3 text-[10px] font-semibold bg-black/70 text-white border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {product.category}
                </span>
              )}
              <div className="absolute top-3 right-3">
                <WishlistButton productId={product._id} size="sm" />
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-zinc-200 transition-colors line-clamp-1">
                {product.title}
              </h3>
              <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{product.pitch || product.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {product.autoTags?.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  {product.author_profile ? (
                    <img
                      src={product.author_profile}
                      alt={product.author_name}
                      className="w-5 h-5 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center">
                      <span className="text-[10px] text-zinc-400">{product.author_name?.charAt(0)}</span>
                    </div>
                  )}
                  <span className="text-xs text-zinc-500 truncate max-w-[80px]">{product.author_name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-600">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />{product.reviews}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-white">
                    <TrendingUp className="w-3 h-3 text-zinc-500" />{product.upvotes.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </HoverPreview>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-zinc-800 rounded-2xl p-16 text-center">
      <Sparkles className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
      <p className="text-zinc-500 text-sm">No products found</p>
    </div>
  );
}
