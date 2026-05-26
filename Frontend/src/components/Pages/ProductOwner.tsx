import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Globe, Github, Twitter, Linkedin, Heart, MessageCircle,
  ExternalLink, Briefcase, Award, TrendingUp, Trophy, Zap
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
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
  author_id: string | { _id: string };
}

export default function ProductOwner() {
  const [user, setUser] = useState<APIUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'products' | 'portfolio'>('about');
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
      } catch { /* silent */ } finally { setIsLoading(false); }
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
      } catch { /* silent */ }
    };
    if (ownerId) fetchOwnerProducts();
  }, [ownerId]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-zinc-400">
      User not found
    </div>
  );

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'products', label: `Products (${products.length})` },
    { id: 'portfolio', label: `Portfolio (${user.portfolio?.length || 0})` },
  ] as const;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Profile Header */}
      <div className="border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-6 pt-8 pb-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Profile row */}
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar style={{ width: 96, height: 96 }} className="border-2 border-zinc-800">
                {user.profilePicture && (
                  <AvatarImage
                    src={user.profilePicture}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                )}
                <AvatarFallback className="bg-zinc-800 text-white text-3xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap capitalize">
                {user.role || 'Maker'}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
              {user.bio && (
                <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-3 mt-2 text-sm text-zinc-500 flex-wrap">
                <span className="font-mono">#{user._id?.slice(-6).toUpperCase()}</span>
                <span className="text-zinc-700">·</span>
                <span>0 followers</span>
                <span className="text-zinc-700">·</span>
                <span>0 following</span>
              </div>

              {/* Points + Streak */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="inline-flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
                  <Zap className="w-4 h-4 text-zinc-500" />
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider leading-none">All time</p>
                    <p className="font-bold text-white text-sm leading-snug">
                      {user.totalUpvotes || 0} pts
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
                  <Trophy className="w-4 h-4 text-zinc-500" />
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider leading-none">Badges</p>
                    <p className="font-bold text-white text-sm leading-snug">{user.badges?.length || 0}</p>
                  </div>
                </div>
              </div>

              {/* Social links */}
              {(user.github || user.twitter || user.linkedin || user.website) && (
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  {user.website && (
                    <a href={user.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-white hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors">
                      <Globe className="w-3.5 h-3.5" /> Website
                    </a>
                  )}
                  {user.twitter && (
                    <a href={user.twitter} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-white hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors">
                      <Twitter className="w-3.5 h-3.5" /> Twitter
                    </a>
                  )}
                  {user.linkedin && (
                    <a href={user.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-white hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors">
                      <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                    </a>
                  )}
                  {user.github && (
                    <a href={user.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-white hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors">
                      <Github className="w-3.5 h-3.5" /> GitHub
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Follow button */}
            <button className="shrink-0 border border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-white/40 px-5 py-2 rounded-full transition-colors">
              Follow
            </button>
          </div>

          {/* Tab navigation - PH underline style */}
          <div className="flex mt-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* About tab */}
        {activeTab === 'about' && (
          <div className="space-y-8 max-w-2xl">
            {user.bio && (
              <div>
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">About</h2>
                <p className="text-zinc-300 leading-relaxed">{user.bio}</p>
              </div>
            )}

            {user.makerStory && (
              <div>
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Maker Story</h2>
                <p className="text-zinc-300 leading-relaxed">{user.makerStory}</p>
              </div>
            )}

            {/* Links section - PH style list */}
            {(user.github || user.twitter || user.linkedin || user.website) && (
              <div>
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Links</h2>
                <div className="space-y-1">
                  {user.website && (
                    <a href={user.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 group transition-colors">
                      <Globe className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                      <span className="text-sm text-zinc-300 group-hover:text-white flex-1 truncate">
                        {user.website.replace(/^https?:\/\//, '')}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-500" />
                    </a>
                  )}
                  {user.twitter && (
                    <a href={user.twitter} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 group transition-colors">
                      <Twitter className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                      <span className="text-sm text-zinc-300 group-hover:text-white flex-1">Twitter</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-500" />
                    </a>
                  )}
                  {user.linkedin && (
                    <a href={user.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 group transition-colors">
                      <Linkedin className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                      <span className="text-sm text-zinc-300 group-hover:text-white flex-1">LinkedIn</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-500" />
                    </a>
                  )}
                  {user.github && (
                    <a href={user.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 group transition-colors">
                      <Github className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                      <span className="text-sm text-zinc-300 group-hover:text-white flex-1">GitHub</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-500" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Badges */}
            {user.badges && user.badges.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Badges</h2>
                <div className="flex flex-wrap gap-2">
                  {user.badges.map((badgeItem) => (
                    <div
                      key={badgeItem._id || badgeItem.badge}
                      className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2"
                    >
                      <Award className="w-4 h-4 text-zinc-500" />
                      <span className="text-sm text-zinc-300">{badgeItem.badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {user.achievements && user.achievements.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Achievements</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.achievements.map((achievement, index) => (
                    <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-white">{achievement.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {new Date(achievement.earnedAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!user.bio && !user.makerStory && (!user.badges || user.badges.length === 0) && (
              <div className="border border-dashed border-zinc-800 rounded-xl p-16 text-center">
                <p className="text-zinc-500 text-sm">No information yet</p>
              </div>
            )}
          </div>
        )}

        {/* Products tab */}
        {activeTab === 'products' && (
          <div>
            {products.length > 0 ? (
              <div className="space-y-3">
                {products.map((product, idx) => (
                  <div
                    key={product._id}
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="group flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 cursor-pointer transition-all"
                  >
                    {/* Rank */}
                    <div className="text-zinc-700 font-mono text-sm w-5 text-center shrink-0">{idx + 1}</div>

                    {/* Thumbnail */}
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                      {product.media[0] ? (
                        <img
                          src={product.media[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-zinc-700" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-white text-sm">{product.title}</h3>
                        {product.category && (
                          <span className="text-[10px] border border-zinc-800 text-zinc-600 px-1.5 py-0.5 rounded-full shrink-0">
                            {product.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-1">{product.pitch}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        {product.autoTags?.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[10px] text-zinc-600">#{tag}</span>
                        ))}
                        <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />{product.reviews.length}
                        </span>
                      </div>
                    </div>

                    {/* Upvote */}
                    <div className="shrink-0 flex flex-col items-center border border-zinc-700 rounded-lg px-3 py-2 min-w-[48px]">
                      <TrendingUp className="w-3.5 h-3.5 text-zinc-500 mb-0.5" />
                      <span className="text-xs font-bold text-white">{product.upvotes.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-zinc-800 rounded-xl p-16 text-center">
                <Briefcase className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No products yet</p>
              </div>
            )}
          </div>
        )}

        {/* Portfolio tab */}
        {activeTab === 'portfolio' && (
          <div>
            {user.portfolio && user.portfolio.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.portfolio.map((item) => (
                  <div
                    key={item._id}
                    className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden cursor-pointer transition-all"
                    onClick={() => item.demoUrl && window.open(item.demoUrl, '_blank')}
                  >
                    {item.media && item.media[0] && (
                      <div className="h-40 overflow-hidden bg-zinc-800">
                        <img
                          src={item.media[0]}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-white mb-1">{item.title}</h3>
                      {item.demoUrl && (
                        <a
                          href={item.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {item.demoUrl.replace(/^https?:\/\//, '').slice(0, 40)}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-zinc-800 rounded-xl p-16 text-center">
                <p className="text-zinc-500 text-sm">No portfolio items yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
