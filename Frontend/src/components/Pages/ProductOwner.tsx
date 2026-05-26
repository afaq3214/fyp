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
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Profile Header Card - Gradient */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar style={{ width: 100, height: 100 }} className="border-4 border-white">
                {user.profilePicture && (
                  <AvatarImage
                    src={user.profilePicture}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                )}
                <AvatarFallback className="bg-purple-700 text-white text-3xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-green-400 border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                ✓
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{user.name}</h1>
                <span className="bg-white/30 backdrop-blur text-xs font-bold px-3 py-1 rounded-full">PRO</span>
              </div>
              {user.bio && (
                <p className="text-white/90 mb-4">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-4xl font-bold">{products.length}</p>
                  <p className="text-white/80 text-sm">Projects</p>
                </div>
                <div>
                  <p className="text-4xl font-bold">{user.totalUpvotes || 0}</p>
                  <p className="text-white/80 text-sm">Upvotes</p>
                </div>
                <div>
                  <p className="text-4xl font-bold">{user.badges?.length || 0}</p>
                  <p className="text-white/80 text-sm">Badges</p>
                </div>
              </div>
            </div>

            {/* Badge indicator */}
            <div className="shrink-0">
              <span className="bg-white/30 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">
                🏆 firstLogin
              </span>
            </div>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Upvotes Given */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-5xl font-bold">{user.totalUpvotes || 0}</p>
                <p className="text-blue-100 text-sm mt-2">Upvotes Given</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          {/* Projects */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-5xl font-bold">{products.length}</p>
                <p className="text-purple-100 text-sm mt-2">Projects</p>
              </div>
              <Briefcase className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          {/* Badges Earned */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-white md:col-span-2">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-5xl font-bold">{user.badges?.length || 0}</p>
                <p className="text-orange-100 text-sm mt-2">Badges Earned</p>
              </div>
              <Award className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8 border-b border-gray-200 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 -mb-px'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* About tab */}
        {activeTab === 'about' && (
          <div className="space-y-8 max-w-3xl">
            {user.bio && (
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">About</h2>
                <p className="text-base text-gray-700 leading-relaxed">{user.bio}</p>
              </div>
            )}

            {user.makerStory && (
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Maker Story</h2>
                <p className="text-base text-gray-700 leading-relaxed">{user.makerStory}</p>
              </div>
            )}

            {/* Links section */}
            {(user.github || user.twitter || user.linkedin || user.website) && (
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Links</h2>
                <div className="space-y-3">
                  {user.website && (
                    <a href={user.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 group transition-colors">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-600" />
                        <span className="text-base text-gray-700">
                          {user.website.replace(/^https?:\/\//, '').slice(0, 50)}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </a>
                  )}
                  {user.twitter && (
                    <a href={user.twitter} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 group transition-colors">
                      <div className="flex items-center gap-3">
                        <Twitter className="w-5 h-5 text-gray-600" />
                        <span className="text-base text-gray-700">Twitter</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </a>
                  )}
                  {user.linkedin && (
                    <a href={user.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 group transition-colors">
                      <div className="flex items-center gap-3">
                        <Linkedin className="w-5 h-5 text-gray-600" />
                        <span className="text-base text-gray-700">LinkedIn</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </a>
                  )}
                  {user.github && (
                    <a href={user.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 group transition-colors">
                      <div className="flex items-center gap-3">
                        <Github className="w-5 h-5 text-gray-600" />
                        <span className="text-base text-gray-700">GitHub</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Badges */}
            {user.badges && user.badges.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Badges</h2>
                <div className="flex flex-wrap gap-3">
                  {user.badges.map((badgeItem) => (
                    <div
                      key={badgeItem._id || badgeItem.badge}
                      className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg px-4 py-2.5"
                    >
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-medium">{badgeItem.badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {user.achievements && user.achievements.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Achievements</h2>
                <div className="space-y-3">
                  {user.achievements.map((achievement, index) => (
                    <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg p-4 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{achievement.title}</p>
                        <p className="text-sm text-gray-600 mt-1">
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
              <div className="border border-dashed border-gray-300 rounded-lg p-16 text-center">
                <p className="text-gray-500 text-base">No information yet</p>
              </div>
            )}
          </div>
        )}

        {/* Products tab */}
        {activeTab === 'products' && (
          <div>
            {products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product, idx) => (
                  <div
                    key={product._id}
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="group flex items-start gap-5 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md rounded-xl p-5 cursor-pointer transition-all"
                  >
                    {/* Rank */}
                    <div className="text-gray-400 font-mono text-lg font-bold w-6 shrink-0 pt-1">{idx + 1}</div>

                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {product.media[0] ? (
                        <img
                          src={product.media[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <h3 className="font-bold text-base text-gray-900 group-hover:text-gray-700">{product.title}</h3>
                        {product.category && (
                          <span className="text-xs border border-blue-200 bg-blue-50 text-blue-700 px-2 py-1 rounded-full shrink-0">
                            {product.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-2">{product.pitch || product.description}</p>
                      <div className="flex items-center gap-4">
                        {product.autoTags?.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs text-gray-500">#{tag}</span>
                        ))}
                        <span className="text-xs text-gray-500 flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5" />{product.reviews.length}
                        </span>
                      </div>
                    </div>

                    {/* Upvote */}
                    <div className="shrink-0 flex flex-col items-center justify-center border border-purple-200 rounded-lg px-4 py-3 min-w-[60px] bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100">
                      <TrendingUp className="w-4 h-4 text-purple-600 mb-1" />
                      <span className="text-lg font-bold text-purple-600">{product.upvotes.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-lg p-16 text-center">
                <Briefcase className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-base">No products yet</p>
              </div>
            )}
          </div>
        )}

        {/* Portfolio tab */}
        {activeTab === 'portfolio' && (
          <div>
            {user.portfolio && user.portfolio.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.portfolio.map((item) => (
                  <div
                    key={item._id}
                    className="group bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg rounded-xl overflow-hidden cursor-pointer transition-all"
                    onClick={() => item.demoUrl && window.open(item.demoUrl, '_blank')}
                  >
                    {item.media && item.media[0] && (
                      <div className="h-48 overflow-hidden bg-gray-100">
                        <img
                          src={item.media[0]}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-bold text-base text-gray-900 mb-3">{item.title}</h3>
                      {item.demoUrl && (
                        <a
                          href={item.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {item.demoUrl.replace(/^https?:\/\//, '').slice(0, 50)}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-lg p-16 text-center">
                <p className="text-gray-500 text-base">No portfolio items yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
