import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Flame, Clock, Filter, Grid3X3, List, ArrowUp, Star, Sparkles, Zap, Users, Award, Activity, MessageSquare, Heart, Bookmark, Share2, BarChart3, CheckCircle2, Gem, Rocket, SlidersHorizontal, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
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
import { Progress } from './progress';
import type { Product } from '@/App';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { UserContext } from '@/context/UserContext';
import axios from 'axios';

interface TopUser {
  _id:string;
  id: string;
  name: string;
  profilePicture: string;
  points: number;
  badges: string[];
  projects?: number;
  engagementScore?: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  type: 'daily' | 'weekly' | 'achievement';
  icon: React.ReactNode;
  xp: number;
  completed: boolean;
}

interface UserProgressProps {
  dailyQuests: {
    upvotesToday: number;
    commentsToday: number;
    upvotesRemaining: number;
    commentsRemaining: number;
    completed: boolean;
    reward: number;
  };
  userStats: {
    points: number;
    badges: any[];
  };
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
  const { user ,darkmode,ToggleDarkMode} = useContext(UserContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('upvotes');
  const [userProgress, setProgress] = useState<UserProgressProps>();
  const [dailyQuest, setDailyQuest] = useState<Quest[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);

  // Ranking with Momentum feeds
  type RankingFeed = 'all' | 'popular' | 'fresh' | 'hidden_gems' | 'smart';
  const [rankingFeed, setRankingFeed] = useState<RankingFeed>('all');
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [freshProducts, setFreshProducts] = useState<Product[]>([]);
  const [hiddenGemsProducts, setHiddenGemsProducts] = useState<Product[]>([]);
  const [smartProducts, setSmartProducts] = useState<Product[]>([]);
  const [smartCategory, setSmartCategory] = useState('All Categories');
  const [smartSort, setSmartSort] = useState('popular');
  const [smartTopic, setSmartTopic] = useState<string>('All Topics');
  const [smartDiversityMaker, setSmartDiversityMaker] = useState(false);
  const [smartTags, setSmartTags] = useState<string[]>([]);
  const [rankingLoading, setRankingLoading] = useState<Record<RankingFeed, boolean>>({
    all: false, popular: false, fresh: false, hidden_gems: false, smart: false,
  });

  // AI Recommendations: suggested products + sentiment insights
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  const [sentimentInsights, setSentimentInsights] = useState<{ total: number; averageScore: number; distribution: { positive: number; negative: number; neutral: number }; recentSample?: { comment: string; sentimentLabel: string; sentimentScore: number }[] } | null>(null);
  const [categorySuggestions, setCategorySuggestions] = useState<{ category: string; recommendations: Product[]; userInteractions: number; preferredTags: string[] } | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

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

  // Fetch Ranking with Momentum feeds
  useEffect(() => {
    const limit = 30;
    const fetchPopular = async () => {
      setRankingLoading((prev) => ({ ...prev, popular: true }));
      try {
        const res = await fetch(`${url}/api/products/ranking/popular?limit=${limit}`);
        if (res.ok) {
          const data = await res.json();
          setPopularProducts(Array.isArray(data) ? data : []);
        }
      } finally {
        setRankingLoading((prev) => ({ ...prev, popular: false }));
      }
    };
    const fetchFresh = async () => {
      setRankingLoading((prev) => ({ ...prev, fresh: true }));
      try {
        const res = await fetch(`${url}/api/products/ranking/fresh?limit=${limit}&days=30`);
        if (res.ok) {
          const data = await res.json();
          setFreshProducts(Array.isArray(data) ? data : []);
        }
      } finally {
        setRankingLoading((prev) => ({ ...prev, fresh: false }));
      }
    };
    const fetchHiddenGems = async () => {
      setRankingLoading((prev) => ({ ...prev, hidden_gems: true }));
      try {
        const res = await fetch(`${url}/api/products/ranking/hidden-gems?limit=${limit}`);
        if (res.ok) {
          const data = await res.json();
          setHiddenGemsProducts(Array.isArray(data) ? data : []);
        }
      } finally {
        setRankingLoading((prev) => ({ ...prev, hidden_gems: false }));
      }
    };
    const fetchSmart = async () => {
      setRankingLoading((prev) => ({ ...prev, smart: true }));
      try {
        const params = new URLSearchParams();
        params.set('limit', String(limit));
        params.set('sort', smartSort);
        if (smartCategory !== 'All Categories') params.set('category', smartCategory);
        if (smartTopic !== 'All Topics' && smartTopic) params.set('tags', smartTopic);
        if (smartDiversityMaker) params.set('diversity', 'maker');
        const res = await fetch(`${url}/api/products/ranking/smart?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setSmartProducts(Array.isArray(data) ? data : []);
        }
      } finally {
        setRankingLoading((prev) => ({ ...prev, smart: false }));
      }
    };
    if (rankingFeed === 'popular') fetchPopular();
    else if (rankingFeed === 'fresh') fetchFresh();
    else if (rankingFeed === 'hidden_gems') fetchHiddenGems();
    else if (rankingFeed === 'smart') fetchSmart();
  }, [url, rankingFeed, smartCategory, smartSort, smartTopic, smartDiversityMaker]);

  // Fetch distinct tags for Smart Filters Topic dropdown
  useEffect(() => {
    if (rankingFeed !== 'smart') return;
    fetch(`${url}/api/products/tags`)
      .then((r) => r.ok ? r.json() : [])
      .then((list: string[]) => setSmartTags(Array.isArray(list) ? list : []))
      .catch(() => setSmartTags([]));
  }, [url, rankingFeed]);

  // AI Recommendations: suggested products (logged-in only)
  const userIdForRecommendations = user?.id || (user as { _id?: string })?._id;
  const hasAuthToken = typeof localStorage !== 'undefined' && !!localStorage.getItem('token');
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setSuggestedProducts([]); return; }
    setSuggestedLoading(true);
    fetch(`${url}/api/recommendations/suggested?limit=6`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data: Product[]) => setSuggestedProducts(Array.isArray(data) ? data : []))
      .catch(() => setSuggestedProducts([]))
      .finally(() => setSuggestedLoading(false));
  }, [url, userIdForRecommendations, hasAuthToken]);

  // AI Recommendations: feedback sentiment insights (global)
  useEffect(() => {
    fetch(`${url}/api/recommendations/sentiment?limit=50`)
      .then((r) => r.ok ? r.json() : null)
      .then(setSentimentInsights)
      .catch(() => setSentimentInsights(null));
  }, [url]);

  // AI Recommendations: category-based suggestions (when category is selected)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || selectedCategory === 'All Categories') { 
      setCategorySuggestions(null); 
      return; 
    }
    
    setCategoryLoading(true);
    fetch(`${url}/api/recommendations/category-suggestions?category=${encodeURIComponent(selectedCategory)}&limit=6`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then(setCategorySuggestions)
      .catch(() => setCategorySuggestions(null))
      .finally(() => setCategoryLoading(false));
  }, [url, selectedCategory, hasAuthToken]);

  // Fetch quest progress
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      axios.get(`${url}/api/quest`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        const questData = response.data.quests[0];
        setUserPoints(response.data.userPoints);
        setProgress(response.data);
        
        if (questData) {
          setDailyQuest([
            {
              id: 'q1',
              title: 'Share the Love',
              description: 'Give emoji reactions to 3 products',
              progress: questData.commentsToday || 0,
              target: 3,
              reward: '2.5 pts',
              type: 'daily',
              icon: <Heart className="w-5 h-5" />,
              xp: 30,
              completed: (questData.commentsToday || 0) >= 3
            },
            {
              id: 'q2',
              title: 'Upvote Champion',
              description: 'Upvote 2 products',
              progress: questData?.upvotesToday || 0,
              target: 2,
              reward: '2.5 pts',
              type: 'daily',
              icon: <TrendingUp className="w-5 h-5" />,
              xp: 100,
              completed: (questData?.upvotesToday || 0) >= 2 
            }
          ]);
        }
      })
      .catch(error => {
        console.error('Error fetching quest progress:', error);
      });
    }
  }, [user]);

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product._id}`);
  };

  const getReviewCount = (p: Product): number => {
    const r = (p as Product & { reviews?: number | unknown[]; totalcomments?: number }).reviews;
    if (typeof r === 'number') return r;
    const t = (p as Product & { totalcomments?: number }).totalcomments;
    if (typeof t === 'number') return t;
    return Array.isArray(r) ? (r as unknown[]).length : 0;
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
        return getReviewCount(b) - getReviewCount(a);
      default:
        return 0;
    }
  });

  const calculateHiddenGemsScore = (products: Product[]) => {
    if (!products.length) return [];
    const maxUpvotes = Math.max(...products.map(p => (p.upvotes?.length ?? 0) || 1));
    const maxComments = Math.max(...products.map(p => getReviewCount(p)), 1);
    return products
      .map((product) => {
        const upvotesScore = (product.upvotes?.length ?? 0) / maxUpvotes;
        const commentsScore = getReviewCount(product) / maxComments;
        const hiddenGemScore = (upvotesScore + commentsScore) / 2;
        return { ...product, hiddenGemScore };
      })
      .filter((p) => (p as Product & { hiddenGemScore: number }).hiddenGemScore > 0.5);
  };

  const hiddenGems = calculateHiddenGemsScore(products);

  // Display list: use ranking feed when selected, else main sorted list
  const displayProducts: Product[] =
    rankingFeed === 'popular'
      ? popularProducts
      : rankingFeed === 'fresh'
        ? freshProducts
        : rankingFeed === 'hidden_gems'
          ? hiddenGemsProducts
          : rankingFeed === 'smart'
            ? smartProducts
            : sortedProducts;
  const displayLoading =
    rankingFeed === 'all' ? false : rankingLoading[rankingFeed];

  if (isLoading) return <div className="flex justify-center items-center min-h-screen bg-black"><div className="w-6 h-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin" /></div>;
  if (error) return <div className="flex justify-center items-center min-h-screen bg-black"><p className="text-zinc-400 text-sm">Error: {error}</p></div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}


      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SIDEBAR - TOP MAKERS */}
          <div className="col-span-12 md:col-span-3">
            <div className="sticky top-6">
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
                <div className="px-4 py-2 border-b border-zinc-800">
                  <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Top Makers</h2>
                </div>
                <div className="divide-y divide-zinc-900">
                  {topUsers.slice(0, 6).map((user, index) => (
                    <Link key={user._id} to={`/product-owner/${user._id}`}>
                      <div className="p-2.5 hover:bg-zinc-800/50 transition-colors cursor-pointer group flex items-center gap-2.5">
                        <div className="relative shrink-0">
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.name}
                              className="w-9 h-9 rounded-lg object-cover ring-1 ring-zinc-700"
                              referrerPolicy="no-referrer" loading="lazy" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                              <span className="text-xs font-semibold text-white">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-950 border border-zinc-700 flex items-center justify-center text-[8px] font-bold text-zinc-300">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-white truncate group-hover:text-zinc-200">{user.name}</div>
                          <div className="text-[10px] text-zinc-600">{user.points || 0} pts</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CENTER - Products Feed */}
          <div className="col-span-12 md:col-span-6">
            {/* Ranking tabs */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-white">Ranking with Momentum</span>
              </div>
              <Tabs value={rankingFeed} onValueChange={(v) => setRankingFeed(v as RankingFeed)}>
                <TabsList className="grid w-full grid-cols-5 h-auto gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  {[
                    { value: 'all', icon: <Grid3X3 className="w-4 h-4" />, label: 'All' },
                    { value: 'popular', icon: <Flame className="w-4 h-4" />, label: 'Popular' },
                    { value: 'fresh', icon: <Clock className="w-4 h-4" />, label: 'Fresh' },
                    { value: 'smart', icon: <SlidersHorizontal className="w-4 h-4" />, label: 'Smart' },
                    { value: 'hidden_gems', icon: <Gem className="w-4 h-4" />, label: 'Gems' },
                  ].map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}
                      className="flex items-center gap-1.5 text-xs rounded-lg text-zinc-500 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-semibold">
                      {tab.icon}{tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {rankingFeed === 'smart' && (
                  <div className="mt-3 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Select value={smartCategory} onValueChange={setSmartCategory}>
                        <SelectTrigger className="w-[150px] h-8 bg-zinc-950 border-zinc-700 text-zinc-300 text-xs">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700">
                          {categories.map((cat) => <SelectItem key={cat} value={cat} className="text-zinc-300 focus:bg-zinc-800 focus:text-white">{cat}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={smartTopic} onValueChange={setSmartTopic}>
                        <SelectTrigger className="w-[150px] h-8 bg-zinc-950 border-zinc-700 text-zinc-300 text-xs">
                          <SelectValue placeholder="Topic" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700">
                          <SelectItem value="All Topics" className="text-zinc-300 focus:bg-zinc-800 focus:text-white">All Topics</SelectItem>
                          {smartTags.map((tag) => <SelectItem key={tag} value={tag} className="text-zinc-300 focus:bg-zinc-800 focus:text-white">{tag}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={smartSort} onValueChange={setSmartSort}>
                        <SelectTrigger className="w-[140px] h-8 bg-zinc-950 border-zinc-700 text-zinc-300 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700">
                          {['popular','fresh','rising_week','momentum','hidden_gems'].map(v => (
                            <SelectItem key={v} value={v} className="text-zinc-300 focus:bg-zinc-800 focus:text-white capitalize">{v.replace('_',' ')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer">
                      <input type="checkbox" checked={smartDiversityMaker} onChange={(e) => setSmartDiversityMaker(e.target.checked)} className="rounded border-zinc-700 bg-zinc-900" />
                      One per maker
                    </label>
                  </div>
                )}
              </Tabs>
            </div>

            {/* Filters */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-5 flex flex-wrap items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px] h-8 bg-zinc-950 border-zinc-700 text-zinc-300 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {categories.map(c => <SelectItem key={c} value={c} className="text-zinc-300 focus:bg-zinc-800 focus:text-white">{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px] h-8 bg-zinc-950 border-zinc-700 text-zinc-300 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {[['upvotes','Most Upvotes'],['popular','Popular'],['fresh','Fresh'],['reviews','Most Reviews']].map(([v,l]) => (
                    <SelectItem key={v} value={v} className="text-zinc-300 focus:bg-zinc-800 focus:text-white">{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1" />
              <div className="flex items-center gap-0.5 bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg">
                <Button variant="ghost" size="sm" onClick={() => setViewMode('grid')}
                  className={`h-7 px-2 text-sm ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setViewMode('list')}
                  className={`h-7 px-2 text-sm ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Product Cards */}
            <div className="space-y-4">
              {displayLoading && <div className="py-10 text-center text-zinc-600 text-sm">Loading feed...</div>}
              {!displayLoading && displayProducts.length === 0 && (
                <div className="py-10 text-center text-zinc-600 text-sm border border-dashed border-zinc-800 rounded-2xl">No products in this feed yet.</div>
              )}
              {!displayLoading && displayProducts.map((product) => (
                <div key={product._id}
                  className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 flex hover:shadow-xl hover:shadow-white/10"
                  onClick={() => handleProductClick(product)}>
                  {/* Image */}
                  <div className="relative w-56 sm:w-64 shrink-0 overflow-hidden bg-zinc-800">
                    <ImageWithFallback
                      src={product.media && product.media[0]}
                      alt={product.title}
                      className="w-full h-full min-h-[200px] object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    {product.category && (
                      <div className="absolute top-3 left-3">
                        <span className="text-xs font-semibold uppercase tracking-wider bg-black/80 text-zinc-300 border border-zinc-700 px-3 py-1 rounded-md">
                          {product.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-white mb-2 group-hover:text-zinc-200 line-clamp-2">{product.title}</h3>
                          <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{product.description}</p>
                        </div>
                        <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 border border-zinc-800 hover:border-white/30 rounded-xl transition-colors bg-zinc-950">
                          <ArrowUp className="w-5 h-5 text-zinc-400" />
                          <span className="text-sm font-bold text-white mt-1">{product.upvotes?.length ?? 0}</span>
                        </div>
                      </div>

                      {product.autoTags && product.autoTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {product.autoTags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs text-zinc-500 border border-zinc-800 px-2 py-1 rounded-lg">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                      <div className="flex items-center gap-3">
                        {product.author_profile ? (
                          <img src={product.author_profile} alt={product.author_name}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-700"
                            referrerPolicy="no-referrer" loading="lazy" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{product.author_name?.charAt(0)?.toUpperCase()}</span>
                          </div>
                        )}
                        <span className="text-sm text-zinc-400">{product.author_name}</span>
                        <span className="text-zinc-700">·</span>
                        <span className="text-xs text-zinc-600">{new Date(product.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                          <MessageSquare className="w-4 h-4" />{getReviewCount(product)}
                        </span>
                        {product.trending && <span className="text-xs border border-zinc-700 text-zinc-500 px-2.5 py-1 rounded-lg">Trending</span>}
                        {product.fresh && <span className="text-xs border border-zinc-700 text-zinc-500 px-2.5 py-1 rounded-lg">Fresh</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="col-span-12 md:col-span-3">
            <div className="sticky top-6 space-y-4">
              {/* AI Suggested */}
              {hasAuthToken && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Suggested</h3>
                  </div>
                  <div className="divide-y divide-zinc-900 max-h-56 overflow-y-auto">
                    {suggestedLoading && <p className="p-4 text-xs text-zinc-600">Loading...</p>}
                    {!suggestedLoading && suggestedProducts.length === 0 && <p className="p-4 text-xs text-zinc-600">Upvote products to get suggestions.</p>}
                    {!suggestedLoading && suggestedProducts.slice(0, 5).map((p) => (
                      <div key={p._id} onClick={() => handleProductClick(p)}
                        className="p-3 hover:bg-zinc-800/50 cursor-pointer transition-colors group">
                        <p className="text-xs font-medium text-white truncate group-hover:text-zinc-200">{p.title}</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">{p.upvotes?.length ?? 0} upvotes</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sentiment */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Feedback Sentiment</h3>
                </div>
                <div className="p-4">
                  {sentimentInsights ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-600">Avg. score</span>
                        <span className="text-sm font-bold text-white">{sentimentInsights.averageScore}</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-800 text-zinc-400 text-[10px]">
                          <ThumbsUp className="w-3 h-3" />{sentimentInsights.distribution?.positive ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-800 text-zinc-500 text-[10px]">
                          <Minus className="w-3 h-3" />{sentimentInsights.distribution?.neutral ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-800 text-zinc-600 text-[10px]">
                          <ThumbsDown className="w-3 h-3" />{sentimentInsights.distribution?.negative ?? 0}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-700">{sentimentInsights.total} comments analyzed</p>
                    </div>
                  ) : <p className="text-xs text-zinc-600">Loading...</p>}
                </div>
              </div>

              {/* Category suggestions */}
              {hasAuthToken && selectedCategory !== 'All Categories' && categorySuggestions && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                      <Gem className="w-4 h-4" />{selectedCategory}
                    </h3>
                  </div>
                  <div className="divide-y divide-zinc-900 max-h-56 overflow-y-auto">
                    {categoryLoading && <p className="p-4 text-xs text-zinc-600">Loading...</p>}
                    {!categoryLoading && categorySuggestions.recommendations.map((p) => (
                      <div key={p._id} onClick={() => handleProductClick(p)}
                        className="p-3 hover:bg-zinc-800/50 cursor-pointer transition-colors group">
                        <p className="text-xs font-medium text-white truncate group-hover:text-zinc-200">{p.title}</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">{p.upvotes?.length ?? 0} upvotes</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Recent Activity</h3>
                </div>
                <div className="divide-y divide-zinc-900">
                  {products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5).map((product, index) => (
                    <div key={index} className="p-3 hover:bg-zinc-800/50 transition-colors">
                      <div className="flex items-start gap-2">
                        {product.author_profile ? (
                          <img src={product.author_profile} alt={product.author_name}
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                            referrerPolicy="no-referrer" loading="lazy" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-[9px] font-bold text-white">{product.author_name?.charAt(0)?.toUpperCase()}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-zinc-400 leading-snug">
                            <span className="text-white font-medium">{product.author_name}</span>
                            {' launched '}
                            <span className="text-zinc-300">{product.title}</span>
                          </p>
                          <p className="text-[10px] text-zinc-700 mt-0.5">{new Date(product.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Quests */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Daily Quests</h3>
                </div>
                <div className="p-4 space-y-3">
                  {dailyQuest.length === 0 && <p className="text-xs text-zinc-600 text-center py-2">Sign in to see quests</p>}
                  {dailyQuest.map((quest) => (
                    <div key={quest.id} className={`p-3 rounded-xl border ${quest.completed ? 'border-white/20 bg-white/5' : 'border-zinc-800 bg-zinc-950'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${quest.completed ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                          {quest.completed ? <CheckCircle2 className="w-4 h-4" /> : quest.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-white">{quest.title}</h4>
                          <p className="text-[10px] text-zinc-600">{quest.description}</p>
                        </div>
                      </div>
                      {!quest.completed && (
                        <div className="mb-2">
                          <div className="flex justify-between text-[10px] text-zinc-600 mb-1">
                            <span>Progress</span><span>{quest.progress}/{quest.target}</span>
                          </div>
                          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${(quest.progress / quest.target) * 100}%` }} />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500">{quest.reward}</span>
                        <span className={`text-[10px] border px-2 py-0.5 rounded-full ${quest.completed ? 'border-white/20 text-white' : 'border-zinc-800 text-zinc-600'}`}>
                          {quest.completed ? 'Done' : 'In Progress'}
                        </span>
                      </div>
                    </div>
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