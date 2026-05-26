import React, { useEffect, useState, useContext } from 'react';
import {
  ArrowLeft,
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
  Users,
  Briefcase,
  Star,
  Activity
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { UserContext } from '../../context/UserContext';
import { useParams, useNavigate } from 'react-router-dom';

interface APIUser {
  _id: string;
  name: string;
  email: string;
  badges: { badge: string; awardedAt: string; _id?: string }[];
  role: string;
  portfolio: { title: string; demoUrl: string; media: string[]; _id: string }[];
  achievements: { title: string; earnedAt: string; _id: string }[];
  bio: string;
  github: string;
  linkedin: string;
  twitter: string;
  website: string;
  makerStory: string;
  profilePicture: string;
  createdAt: string;
  totalUpvotes: number;
  totalpoints: number;
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
  author_id: string | { _id: string };
}

type TabId = 'about' | 'projects' | 'wishlist' | 'activity';

export function PublicUserProfile() {
  const { darkmode } = useContext(UserContext);
  const [user, setUser] = useState<APIUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('about');
  const { ownerId } = useParams<{ ownerId: string }>();
  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL || 'https://fyp-1ejm.vercel.app';

  useEffect(() => {
    const fetchOwnerProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/'); return; }
      try {
        setIsLoading(true);
        const response = await fetch(`${url}/api/auth/${ownerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) setUser(await response.json());
      } catch { } finally { setIsLoading(false); }
    };
    fetchOwnerProfile();
  }, [ownerId, navigate]);

  useEffect(() => {
    const fetchOwnerProducts = async () => {
      const token = localStorage.getItem('token');
      if (!token || !ownerId) return;
      try {
        const response = await fetch(`${url}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data.filter((p: Product) =>
            p.author_id === ownerId || (p as any).author_id?._id === ownerId
          ));
        }
      } catch { }
    };
    if (ownerId) fetchOwnerProducts();
  }, [ownerId]);

  useEffect(() => {
    const fetchOwnerWishlist = async () => {
      const token = localStorage.getItem('token');
      if (!token || !ownerId) return;
      try {
        const response = await fetch(`${url}/api/wishlist/public/${ownerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setWishlist(data.items || []);
        }
      } catch { }
    };
    if (ownerId) fetchOwnerWishlist();
  }, [ownerId]);

  useEffect(() => {
    const fetchUserActivity = async () => {
      const token = localStorage.getItem('token');
      if (!token || !ownerId) return;
      try {
        const response = await fetch(`${url}/api/activity/user/${ownerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || data || []);
        }
      } catch { }
    };
    if (ownerId) fetchUserActivity();
  }, [ownerId]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
    </div>
  );
  if (!user) return (
    <div className="min-h-screen bg-black text-zinc-400 flex items-center justify-center text-base">
      User not found
    </div>
  );

  const rankHex = '#' + (user._id?.slice(-6).toUpperCase() ?? '------');
  const joinYear = new Date(user.createdAt).getFullYear();

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Products', count: products.length },
    { id: 'wishlist', label: 'Wishlist', count: wishlist.length },
    { id: 'activity', label: 'Activity' },
  ];

  const activityIcon: Record<string, React.ReactNode> = {
    launch: <Zap className="w-4 h-4" />,
    update: <TrendingUp className="w-4 h-4" />,
    upvote: <Heart className="w-4 h-4" />,
    review: <MessageCircle className="w-4 h-4" />,
    comment: <MessageCircle className="w-4 h-4" />,
    badge: <Award className="w-4 h-4" />,
    collab: <Users className="w-4 h-4" />,
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── Profile header ── */}
      <div className="border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-6 py-8">

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          {/* Avatar + info row */}
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-800">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-3xl font-bold text-zinc-400">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {/* Role badge */}
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap capitalize">
                {user.role || 'Maker'}
              </span>
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white leading-tight">{user.name}</h1>
                  {user.makerStory && (
                    <p className="text-base text-zinc-400 mt-0.5">{user.makerStory}</p>
                  )}
                </div>
                {/* Follow button */}
                <button className="shrink-0 border border-zinc-700 text-zinc-300 hover:text-white hover:border-white/40 text-sm font-medium px-5 py-2 rounded-full transition-colors">
                  Follow
                </button>
              </div>

              {/* Rank + followers row */}
              <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500 flex-wrap">
                <span className="font-mono font-medium text-zinc-400">{rankHex}</span>
                <span>0 followers</span>
                <span>0 following</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" />
                  Member since {joinYear}
                </span>
              </div>

              {/* Points + badges stat cards */}
              <div className="flex flex-wrap gap-3 mt-4">
                {user.totalpoints != null && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
                    <div className="text-lg font-bold text-white leading-none">
                      {user.totalpoints.toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">Points</div>
                  </div>
                )}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
                  <div className="text-lg font-bold text-white leading-none">{products.length}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Products</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
                  <div className="text-lg font-bold text-white leading-none">{user.totalUpvotes ?? 0}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Upvotes</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
                  <div className="text-lg font-bold text-white leading-none">{user.badges?.length ?? 0}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Badges</div>
                </div>
              </div>

              {/* Social links */}
              {(user.github || user.twitter || user.linkedin || user.website) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {user.github && (
                    <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 text-sm px-3 py-1.5 rounded-full transition-colors">
                      <Github className="w-3.5 h-3.5" />GitHub
                    </a>
                  )}
                  {user.twitter && (
                    <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 text-sm px-3 py-1.5 rounded-full transition-colors">
                      <Twitter className="w-3.5 h-3.5" />Twitter
                    </a>
                  )}
                  {user.linkedin && (
                    <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 text-sm px-3 py-1.5 rounded-full transition-colors">
                      <Linkedin className="w-3.5 h-3.5" />LinkedIn
                    </a>
                  )}
                  {user.website && (
                    <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 text-sm px-3 py-1.5 rounded-full transition-colors">
                      <Globe className="w-3.5 h-3.5" />Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Underline tab nav (PH style) ── */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex border-b border-zinc-900 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
                {tab.count != null && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-zinc-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* ── About ── */}
        {activeTab === 'about' && (
          <div className="space-y-8">
            {/* Bio */}
            {user.bio && (
              <div>
                <h2 className="text-base font-semibold text-white mb-3">About</h2>
                <p className="text-base text-zinc-400 leading-relaxed">{user.bio}</p>
              </div>
            )}

            {/* Maker story */}
            {user.makerStory && (
              <div>
                <h2 className="text-base font-semibold text-white mb-3">Maker Story</h2>
                <p className="text-base text-zinc-400 leading-relaxed">{user.makerStory}</p>
              </div>
            )}

            {/* Links */}
            {(user.github || user.twitter || user.linkedin || user.website) && (
              <div>
                <h2 className="text-base font-semibold text-white mb-3">Links</h2>
                <div className="space-y-2">
                  {user.website && (
                    <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-base text-zinc-400 hover:text-white transition-colors group">
                      <Globe className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                      <span className="truncate">{user.website}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-500 shrink-0" />
                    </a>
                  )}
                  {user.github && (
                    <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-base text-zinc-400 hover:text-white transition-colors group">
                      <Github className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                      <span>github.com/{user.github}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-500 shrink-0" />
                    </a>
                  )}
                  {user.twitter && (
                    <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-base text-zinc-400 hover:text-white transition-colors group">
                      <Twitter className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                      <span>@{user.twitter}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-500 shrink-0" />
                    </a>
                  )}
                  {user.linkedin && (
                    <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-base text-zinc-400 hover:text-white transition-colors group">
                      <Linkedin className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                      <span>linkedin.com/in/{user.linkedin}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-500 shrink-0" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Badges */}
            {user.badges?.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-white mb-3">Badges</h2>
                <div className="flex flex-wrap gap-2">
                  {user.badges.map(b => (
                    <div key={b._id || b.badge}
                      className="flex items-center gap-1.5 border border-zinc-800 text-zinc-300 bg-zinc-900 text-sm px-3 py-1.5 rounded-full">
                      <Award className="w-3.5 h-3.5 text-zinc-500" />
                      {b.badge}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {user.achievements?.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-white mb-3">Achievements</h2>
                <div className="space-y-2">
                  {user.achievements.map(a => (
                    <div key={a._id}
                      className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Star className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm text-zinc-300">{a.title}</span>
                      </div>
                      <span className="text-xs text-zinc-600">
                        {new Date(a.earnedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty about */}
            {!user.bio && !user.makerStory && user.badges?.length === 0 && user.achievements?.length === 0 && (
              <div className="border border-dashed border-zinc-800 rounded-2xl py-16 text-center">
                <Users className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-base">No info added yet</p>
              </div>
            )}
          </div>
        )}

        {/* ── Products ── */}
        {activeTab === 'projects' && (
          <div>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div
                    key={product._id}
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="group relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                  >
                    {/* Image */}
                    <div className="relative h-52 bg-zinc-800 overflow-hidden">
                      <ImageWithFallback
                        src={product.media?.[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      {/* Upvote badge */}
                      <div className="absolute top-4 right-4 bg-zinc-900/90 border border-zinc-700 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                        <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-sm font-semibold text-white">{product.upvotes?.length ?? 0}</span>
                      </div>
                      {/* Category badge */}
                      {product.category && (
                        <div className="absolute top-4 left-4 bg-black/70 border border-white/10 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-sm shadow-xl">
                          {product.category}
                        </div>
                      )}
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-zinc-200 transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3 mb-4">
                        {product.pitch || product.description}
                      </p>

                      {/* Tags */}
                      {product.autoTags && product.autoTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {product.autoTags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-2.5 py-1 rounded-lg">
                              #{tag}
                            </span>
                          ))}
                          {product.autoTags.length > 3 && (
                            <span className="text-xs text-zinc-600 px-2.5 py-1">+{product.autoTags.length - 3}</span>
                          )}
                        </div>
                      )}

                      {/* Stats bar */}
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                            <Heart className="w-3.5 h-3.5" />
                            <span className="font-medium">{product.upvotes?.length ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="font-medium">{product.reviews?.length ?? 0}</span>
                          </div>
                        </div>
                        <button className="text-xs font-semibold bg-white text-black px-4 py-1.5 rounded-xl hover:bg-zinc-200 transition-colors">
                          View
                        </button>
                      </div>
                    </div>

                    {/* Top edge accent on hover */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Briefcase className="w-8 h-8 text-zinc-700" />} message="No products yet" sub="Start building and submit your first product!" />
            )}
          </div>
        )}

        {/* ── Wishlist ── */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item: any) => (
                  <div key={item._id}
                    className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2">
                    {/* Image */}
                    <div className="relative h-48 bg-zinc-800 overflow-hidden">
                      <ImageWithFallback
                        src={item.productId?.media?.[0]}
                        alt={item.productId?.title || 'Product'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        fallback="/placeholder-product.jpg"
                      />
                      {/* Heart badge */}
                      <div className="absolute top-3 right-3 bg-zinc-900/90 border border-zinc-700 rounded-full p-2 shadow-lg backdrop-blur-sm">
                        <Heart className="w-4 h-4 text-white fill-current" />
                      </div>
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-zinc-200 transition-colors">
                        {item.productId?.title || 'Untitled Product'}
                      </h3>
                      <p className="text-sm text-zinc-500 line-clamp-2 mb-4 leading-relaxed">
                        {item.productId?.description || 'No description available'}
                      </p>
                      <div className="flex items-center gap-1.5 text-sm text-zinc-600 pt-3 border-t border-zinc-800">
                        <Heart className="w-4 h-4 text-zinc-500" />
                        Added {new Date(item.addedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      {item.notes && (
                        <div className="mt-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                          <p className="text-sm text-zinc-400 italic">"{item.notes}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Heart className="w-8 h-8 text-zinc-700" />} message="No wishlist items yet" sub="Start saving products you love!" />
            )}
          </div>
        )}

        {/* ── Activity ── */}
        {activeTab === 'activity' && (
          <div>
            {activities.length > 0 ? (
              <div className="space-y-2">
                {activities.map((activity: any, index: number) => (
                  <div key={activity._id || index}
                    className="flex items-start gap-4 bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 hover:border-zinc-700 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-zinc-400">
                      {activityIcon[activity.type] ?? <Activity className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-300">
                        <span className="font-medium">{activity.action || 'Activity'}</span>
                        {activity.target && (
                          <span className="font-semibold text-white"> {activity.target}</span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        {activity.createdAt
                          ? new Date(activity.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          : 'Recently'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Activity className="w-8 h-8 text-zinc-700" />} message="No recent activity" sub="Start engaging with the community!" />
            )}
          </div>
        )}

      </div>
    </div>
  );
}

function EmptyState({ icon, message, sub }: { icon: React.ReactNode; message: string; sub: string }) {
  return (
    <div className="border border-dashed border-zinc-800 rounded-2xl py-16 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="text-zinc-500 text-base font-medium">{message}</p>
      <p className="text-zinc-700 text-sm mt-1">{sub}</p>
    </div>
  );
}
