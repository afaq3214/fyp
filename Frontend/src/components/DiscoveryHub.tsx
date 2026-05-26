import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Flame, Clock, Grid3X3, List, ArrowUp,
  Trophy, Users, Star, Award, Zap, Sparkles, MessageSquare,
  Activity, ChevronRight
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from './ui/select';
import type { Product } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { WishlistButton } from './WishlistButton';
import { HiddenGemsFeed } from './DiscoveryHub/HiddenGemsFeed/HiddenGemsFeed';
import { HoverPreview } from './DiscoveryHub/HoverPreviews/HoverPreviews';

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

  // Recent activity: last 5 products by createdAt
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh] bg-black">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh] bg-black text-white text-base">
      {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Page header */}
      <div className="border-b border-zinc-900 bg-zinc-950 px-6 py-7">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Discovery Hub</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Ranked by genuine peer feedback
            </p>
          </div>
          <div className="flex items-center gap-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{products.length}</div>
              <div className="text-zinc-500 text-xs mt-0.5">Products</div>
            </div>
            <div className="w-px h-10 bg-zinc-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{topUsers.length}</div>
              <div className="text-zinc-500 text-xs mt-0.5">Makers</div>
            </div>
            <div className="w-px h-10 bg-zinc-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{products.filter(p => p.trending).length}</div>
              <div className="text-zinc-500 text-xs mt-0.5">Trending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Leaderboard strip (visible below md) */}
      {topUsers.length > 0 && (
        <div className="md:hidden border-b border-zinc-900 bg-zinc-950 px-4 py-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" /> Top Makers
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {topUsers.slice(0, 8).map((user, index) => (
              <button
                key={user.id}
                onClick={() => navigate(`/profile/${user.id}`)}
                className="flex flex-col items-center gap-1 shrink-0"
              >
                <div className="relative">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                      referrerPolicy="no-referrer" loading="lazy" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  {index < 3 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-zinc-500 truncate w-12 text-center">{user.name?.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7">
        <div className="flex gap-7">

          {/* ── Left sidebar – Leaderboard (md+) ── */}
          <div className="hidden md:block w-60 shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">Top Makers</span>
                </div>
                <div className="p-3 space-y-0.5">
                  {topUsers.slice(0, 10).map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      {/* Rank */}
                      <span className={`w-5 text-sm font-bold text-center shrink-0 ${
                        index === 0 ? 'text-white' :
                        index === 1 ? 'text-zinc-300' :
                        index === 2 ? 'text-white' :
                        'text-zinc-600'
                      }`}>
                        {index + 1}
                      </span>
                      {/* Avatar */}
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-zinc-700"
                          referrerPolicy="no-referrer" loading="lazy" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-white">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {/* Name + points */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-300 group-hover:text-white truncate transition-colors">
                          {user.name}
                        </p>
                        <p className="text-xs text-zinc-600">{user.points ?? 0} pts</p>
                      </div>
                    </div>
                  ))}
                  {topUsers.length === 0 && (
                    <div className="text-center py-10">
                      <Users className="w-7 h-7 text-zinc-700 mx-auto mb-2" />
                      <p className="text-sm text-zinc-600">No contributors yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Platform Stats mini card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Platform Stats</p>
                <div className="space-y-3">
                  {[
                    { icon: <Zap className="w-3.5 h-3.5" />, label: 'Products', value: products.length },
                    { icon: <Users className="w-3.5 h-3.5" />, label: 'Makers', value: topUsers.length },
                    { icon: <TrendingUp className="w-3.5 h-3.5" />, label: 'Trending', value: products.filter(p => p.trending).length },
                    { icon: <Award className="w-3.5 h-3.5" />, label: 'Fresh', value: products.filter(p => p.fresh).length },
                  ].map(stat => (
                    <div key={stat.label} className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500 flex items-center gap-1.5">
                        {stat.icon}{stat.label}
                      </span>
                      <span className="text-sm font-bold text-white">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Center – Product list ── */}
          <div className="flex-1 min-w-0">
            {/* Filter bar */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-44 bg-zinc-900 border-zinc-800 text-white text-sm h-10">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {categories.map(c => (
                    <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 bg-zinc-900 border-zinc-800 text-white text-sm h-10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="upvotes" className="text-sm">
                    <div className="flex items-center gap-2"><ArrowUp className="w-3.5 h-3.5" />Most Upvotes</div>
                  </SelectItem>
                  <SelectItem value="trending" className="text-sm">
                    <div className="flex items-center gap-2"><Flame className="w-3.5 h-3.5" />Trending</div>
                  </SelectItem>
                  <SelectItem value="fresh" className="text-sm">
                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />Newest</div>
                  </SelectItem>
                  <SelectItem value="reviews" className="text-sm">
                    <div className="flex items-center gap-2"><Star className="w-3.5 h-3.5" />Most Reviews</div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="ml-auto flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-900 mb-6">
              {([
                { id: 'discover', label: 'All' },
                { id: 'trending', label: 'Trending', icon: <Flame className="w-4 h-4" /> },
                { id: 'fresh', label: 'Newest', icon: <Clock className="w-4 h-4" /> },
                { id: 'gems', label: 'Hidden Gems', icon: <Sparkles className="w-4 h-4" /> },
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

          {/* ── Right sidebar (lg+) ── */}
          <div className="hidden lg:block w-68 shrink-0" style={{ width: '17rem' }}>
            <div className="sticky top-24 space-y-4">

              {/* Recent Activity */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">Recent Activity</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  {recentProducts.length === 0 ? (
                    <p className="text-sm text-zinc-600 px-2 py-4 text-center">No recent activity</p>
                  ) : recentProducts.map(product => (
                    <div
                      key={product._id}
                      className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                        <ImageWithFallback
                          src={product.media?.[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-300 group-hover:text-white truncate transition-colors leading-snug">
                          {product.title}
                        </p>
                        <p className="text-xs text-zinc-600 mt-0.5 truncate">
                          by {product.author_name || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-zinc-700">
                            {new Date(product.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                          <span className="text-xs text-zinc-700 flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" />{product.upvotes.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Quests */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-white" />
                  <p className="text-sm font-semibold text-white">Daily Quests</p>
                </div>
                <p className="text-sm text-zinc-600 mb-4">Complete quests to earn points and badges</p>
                <div className="space-y-2 mb-4">
                  {[
                    { label: 'Review a product', done: false },
                    { label: 'Upvote 3 products', done: false },
                    { label: 'Submit a product', done: false },
                  ].map(q => (
                    <div key={q.label} className="flex items-center gap-2 text-sm text-zinc-500">
                      <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${q.done ? 'bg-white border-white' : 'border-zinc-700'}`} />
                      {q.label}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/quests')}
                  className="w-full bg-white text-black text-sm font-semibold py-2.5 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  View All Quests
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Product List View ─── */
function ProductListView({ products, onProductClick }: { products: Product[]; onProductClick: (p: Product) => void }) {
  if (products.length === 0) return <EmptyState />;
  return (
    <div className="space-y-2.5">
      {products.map((product, idx) => (
        <HoverPreview key={product._id} product={product} onProductClick={onProductClick}>
          <div
            className="group flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-5 py-4 cursor-pointer transition-all"
            onClick={() => onProductClick(product)}
          >
            {/* Rank */}
            <span className="text-sm text-zinc-600 font-mono w-5 text-right shrink-0 font-bold">{idx + 1}</span>

            {/* Thumbnail */}
            <div className="w-24 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
              <ImageWithFallback
                src={product.media?.[0]}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <h3 className="font-semibold text-white text-base leading-snug group-hover:text-zinc-200 transition-colors">
                  {product.title}
                </h3>
                {product.trending && (
                  <span className="shrink-0 text-xs border border-zinc-700 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Flame className="w-3 h-3" />Hot
                  </span>
                )}
                {product.fresh && (
                  <span className="shrink-0 text-xs border border-zinc-700 text-white px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500 line-clamp-1 mb-2">{product.pitch || product.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {product.category && (
                  <span className="text-xs font-medium border border-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
                    {product.category}
                  </span>
                )}
                {product.autoTags?.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-xs text-zinc-600">#{tag}</span>
                ))}
              </div>
            </div>

            {/* Author */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              {product.author_profile ? (
                <img
                  src={product.author_profile}
                  alt={product.author_name}
                  className="w-7 h-7 rounded-full object-cover border border-zinc-700"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {product.author_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm text-zinc-500 max-w-[90px] truncate">{product.author_name}</span>
            </div>

            {/* Comments */}
            <div className="hidden sm:flex items-center gap-1.5 text-zinc-600 shrink-0">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">{product.reviews}</span>
            </div>

            {/* Upvote box */}
            <div className="shrink-0 flex flex-col items-center border border-zinc-700 rounded-xl px-3.5 py-2.5 min-w-[52px] hover:border-zinc-500 transition-colors">
              <TrendingUp className="w-4 h-4 text-zinc-500 mb-0.5" />
              <span className="text-sm font-bold text-white">{product.upvotes.length}</span>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {products.map(product => (
        <HoverPreview key={product._id} product={product} onProductClick={onProductClick}>
          <div
            className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden cursor-pointer transition-all"
            onClick={() => onProductClick(product)}
          >
            {/* Thumbnail */}
            <div className="relative h-48 bg-zinc-800 overflow-hidden">
              <ImageWithFallback
                src={product.media?.[0]}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.category && (
                <span className="absolute top-3 left-3 text-xs font-semibold bg-black/70 text-white border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {product.category}
                </span>
              )}
              <div className="absolute top-3 right-3">
                <WishlistButton productId={product._id} size="sm" />
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-semibold text-white text-base mb-1.5 group-hover:text-zinc-200 transition-colors line-clamp-1">
                {product.title}
              </h3>
              <p className="text-sm text-zinc-500 line-clamp-2 mb-3">{product.pitch || product.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {product.autoTags?.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-xs bg-zinc-800 text-white px-2 py-0.5 rounded-full">
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
                      className="w-6 h-6 rounded-full object-cover border border-zinc-700"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{product.author_name?.charAt(0)}</span>
                    </div>
                  )}
                  <span className="text-sm text-zinc-500 truncate max-w-[90px]">{product.author_name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />{product.reviews}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-white">
                    <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />{product.upvotes.length}
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
      <Sparkles className="w-9 h-9 text-zinc-700 mx-auto mb-3" />
      <p className="text-zinc-500 text-base">No products found</p>
      <p className="text-zinc-700 text-sm mt-1">Try changing filters or check back later</p>
    </div>
  );
}
