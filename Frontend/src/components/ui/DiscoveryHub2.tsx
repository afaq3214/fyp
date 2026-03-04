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

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><div className="text-lg">Loading...</div></div>;
  if (error) return <div className="flex justify-center items-center min-h-screen"><div className="text-lg text-red-600">Error: {error}</div></div>;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-700/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="text-center mb-10">
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4 tracking-tight">
              Discovery Hub
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Explore innovative products ranked by genuine peer feedback, not paid promotions
            </p>
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-white">{products.length}</div>
                <div className="text-xs text-slate-400">Active Products</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-white">{topUsers.length}</div>
                <div className="text-xs text-slate-400">Top Makers</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-white">12K+</div>
                <div className="text-xs text-slate-400">Community</div>
              </div>
            </div>
          </div>

          {/* About card */}
          <div className="max-w-4xl mx-auto rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8 shadow-xl shadow-black/10">
            <div className="flex items-start gap-5">
              <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-semibold text-lg mb-2">Equal Opportunity Platform</h2>
                <p className="text-slate-400 leading-relaxed mb-5">
                  A community-driven platform where students, indie makers, and entrepreneurs showcase their projects with equal opportunity.
                  Discover innovative products ranked by genuine peer feedback. Upvote products you love, write reviews,
                  and connect with makers building the future.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
                    <Award className="w-4 h-4 text-indigo-400" /> No Paid Promotions
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
                    <Zap className="w-4 h-4 text-amber-400" /> AI-Powered Discovery
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
                    <Users className="w-4 h-4 text-emerald-400" /> Peer-Driven Rankings
                  </span>
                </div>
              </div>
            </div>
          </div>
     
               
             </div>
           </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* About Section */}
        

        {/* New Layout - 3 Column: Top Makers | Products | Activity Feed */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SIDEBAR - Top Makers */}
          <div className="col-span-12 md:col-span-3">
            <div className="sticky top-6">
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/80 dark:border-slate-700 shadow-lg overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-slate-800 to-slate-700">
                  <h2 className="font-semibold text-white">Top Makers</h2>
                  <p className="text-xs text-slate-300 mt-0.5">Most active in the community</p>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {topUsers.slice(0, 8).map((user, index) => (
                    <Link key={user._id} to={`/product-owner/${user._id}`}>
                      <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={user.name}
                                className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-600 group-hover:ring-indigo-400/50 transition-all"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-600">
                                <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">{user.name.charAt(0).toUpperCase()}</span>
                              </div>
                            )}
                            <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shadow ${index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-700' : 'bg-slate-600'}`}>
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 dark:text-white truncate">{user.name}</div>
                            {user.badges && user.badges.length > 0 && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                {typeof user.badges[0] === 'string' ? user.badges[0] : (user.badges[0] as { badge?: string })?.badge || 'Badge'}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
                                {user.points || 0} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CENTER - Main Products Feed */}
          <div className="col-span-12 md:col-span-6">
            {/* Ranking with Momentum – feed tabs */}
            <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/80 dark:border-slate-700 shadow-lg p-5 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Ranking with Momentum</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Switch feeds to explore</p>
                </div>
              </div>
              <Tabs value={rankingFeed} onValueChange={(v) => setRankingFeed(v as RankingFeed)}>
                <TabsList className="grid w-full grid-cols-5 h-auto flex-wrap gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
                  <TabsTrigger value="all" className="flex items-center gap-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white">
                    <Grid3X3 className="w-4 h-4 text-slate-500" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="flex items-center gap-2 text-sm rounded-lg data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-orange-900/30 dark:data-[state=active]:text-orange-300">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Popular
                  </TabsTrigger>
                  <TabsTrigger value="fresh" className="flex items-center gap-2 text-sm rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300">
                    <Clock className="w-4 h-4 text-green-500" />
                    Fresh
                  </TabsTrigger>
                  <TabsTrigger value="smart" className="flex items-center gap-2 text-sm rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-indigo-900/30 dark:data-[state=active]:text-indigo-300">
                    <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                    Smart
                  </TabsTrigger>
                  <TabsTrigger value="hidden_gems" className="flex items-center gap-2 text-sm rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300">
                    <Gem className="w-4 h-4 text-purple-500" />
                    Hidden Gems
                  </TabsTrigger>
                </TabsList>
                {rankingFeed === 'smart' && (
                  <div className="mt-3 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Select value={smartCategory} onValueChange={setSmartCategory}>
                        <SelectTrigger className="w-[160px] h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={smartTopic} onValueChange={setSmartTopic}>
                        <SelectTrigger className="w-[160px] h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                          <SelectValue placeholder="Topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All Topics">All Topics</SelectItem>
                          {smartTags.map((tag) => (
                            <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={smartSort} onValueChange={setSmartSort}>
                        <SelectTrigger className="w-[160px] h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="popular">Popular</SelectItem>
                          <SelectItem value="fresh">Fresh</SelectItem>
                          <SelectItem value="rising_week">Rising this week</SelectItem>
                          <SelectItem value="momentum">Momentum</SelectItem>
                          <SelectItem value="hidden_gems">Hidden Gems</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smartDiversityMaker}
                        onChange={(e) => setSmartDiversityMaker(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>One per maker</span>
                      <span className="text-slate-400 text-xs">(diverse feed, one product per author)</span>
                    </label>
                  </div>
                )}
              </Tabs>
            </div>

            {/* Filters Bar (category + sort for "all" or secondary filter) */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px] h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100">
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
                  <SelectTrigger className="w-[140px] h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100">
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
              {displayLoading && (
                <div className="flex justify-center py-8 text-slate-500">Loading feed...</div>
              )}
              {!displayLoading && displayProducts.length === 0 && (
                <div className="text-center py-8 text-slate-500">No products in this feed yet.</div>
              )}
              {!displayLoading && displayProducts.map((product, index) => (
                <Card
                  key={product._id}
                  className="group cursor-pointer rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900/95 shadow-sm hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 overflow-hidden"
                  onClick={() => handleProductClick(product)}
                >
                  <CardContent className="p-0">
                    <div className="flex gap-0">
                      {/* Product Image */}
                      <div className="w-28 sm:w-32 shrink-0 rounded-l-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <ImageWithFallback
                          src={product.media && product.media[0]}
                          alt={product.title}
                          className="w-full h-full min-h-[100px] object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 p-5">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                              {product.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                          <button className="flex flex-col items-center justify-center gap-0.5 w-12 h-12 shrink-0 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200">
                            <ArrowUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{product.upvotes?.length ?? 0}</span>
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
                              <span className="text-sm text-slate-600 dark:text-slate-400">{product.author_name}</span>
                            </div>
                            <span className="text-slate-300">•</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {new Date(product.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
                            </span>
                          </div>

                          {/* Engagement Stats */}
                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{getReviewCount(product)}</span>
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

          {/* RIGHT SIDEBAR */}
          <div className="col-span-12 md:col-span-3">
            <div className="sticky top-6 space-y-5">
              {/* Community Stats */}
              {/* <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/80 dark:border-slate-700 shadow-lg overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-slate-800 to-slate-700">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-300" />
                    Community Stats
                  </h3>
                </div>
                <div className="p-5 space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Products Launched</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{products.length}</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (products.length / 20) * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Total Upvotes</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {products.reduce((sum, p) => sum + (p.upvotes?.length || 0), 0)}
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (products.reduce((s, p) => s + (p.upvotes?.length || 0), 0) / 30) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div> */}

              {/* AI Suggested for you */}
              {hasAuthToken && (
                <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/80 dark:border-slate-700 shadow-lg overflow-hidden">
                  <div className="px-5 py-4 bg-gradient-to-r from-indigo-500/90 to-purple-600/90">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Suggested for you
                    </h3>
                    <p className="text-xs text-white/80 mt-0.5">Based on your upvotes and interests</p>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-64 overflow-y-auto">
                    {suggestedLoading && <div className="p-4 text-sm text-slate-500 dark:text-slate-400">Loading...</div>}
                    {!suggestedLoading && suggestedProducts.length === 0 && <div className="p-4 text-sm text-slate-500 dark:text-slate-400">Upvote or comment on products to get suggestions.</div>}
                    {!suggestedLoading && suggestedProducts.slice(0, 6).map((p) => (
                      <div key={p._id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group" onClick={() => handleProductClick(p)}>
                        <p className="font-medium text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{p.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.upvotes?.length ?? 0} upvotes · {getReviewCount(p)} reviews</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback sentiment */}
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/80 dark:border-slate-700 shadow-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                    Feedback sentiment
                  </h3>
                </div>
                <div className="p-5">
                  {sentimentInsights ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Avg. score</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">{sentimentInsights.averageScore}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {sentimentInsights.distribution?.positive ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                          <Minus className="w-3.5 h-3.5" />
                          {sentimentInsights.distribution?.neutral ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                          <ThumbsDown className="w-3.5 h-3.5" />
                          {sentimentInsights.distribution?.negative ?? 0}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{sentimentInsights.total} comments analyzed</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading sentiment...</p>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/80 dark:border-slate-700 shadow-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {products
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((product, index) => (
                    <div key={index} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
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
                          <p className="text-sm text-slate-900 dark:text-slate-100">
                            <span className="font-medium">{product.author_name}</span>
                            {' launched '}
                            <span className="font-medium">{product.title}</span>
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(product.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Quests */}
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/80 dark:border-slate-700 shadow-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Daily Quests</h3>
                </div>
                <div className="p-5 space-y-3">
                  {dailyQuest.map((quest) => {
                    const progressPercent = (quest.progress / quest.target) * 100;
                    return (
                      <div 
                        key={quest.id} 
                        className={`p-3 rounded-lg border ${
                          quest.completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            quest.completed ? 'bg-green-600' : 'bg-blue-600'
                          }`}>
                            {quest.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            ) : (
                              quest.icon
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 text-sm">{quest.title}</h4>
                            <p className="text-xs text-slate-600">{quest.description}</p>
                          </div>
                        </div>
                        
                        {!quest.completed && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-semibold text-gray-900">
                                {quest.progress} / {quest.target}
                              </span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium ${
                            quest.completed ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {quest.reward}
                          </span>
                          <Button 
                            size="sm" 
                            className="h-6 text-xs"
                            variant={quest.completed ? "outline" : "default"}
                            disabled={quest.completed}
                          >
                            {quest.completed ? 'Completed' : 'In Progress'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {dailyQuest.length === 0 && (
                    <div className="text-center py-4 text-sm text-slate-500 dark:text-slate-400">
                      Loading quests...
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}