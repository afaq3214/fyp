import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Heart, Eye, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface Product {
  _id: string;
  title: string;
  description: string;
  pitch: string;
  category: string;
  media: string[];
  author_name: string;
  author_profile: string;
  upvotesCount: number;
  reviewsCount: number;
  createdAt: string;
  autoTags: string[];
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const navigate = useNavigate();

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    setLoading(true);
    try {
      const url = import.meta.env.VITE_API_URL || 'https://fyp-1ejm.vercel.app';
      const response = await fetch(
        `${url}/api/products/search?q=${encodeURIComponent(query)}&limit=50`
      );
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Search header */}
      <div className="border-b border-zinc-900 bg-zinc-950 py-10 px-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search products, makers, or technologies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl pl-11 pr-24 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mb-4" />
            <p className="text-zinc-600 text-sm">Searching...</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-zinc-600 uppercase tracking-wider mb-6">
              {searchResults.length > 0
                ? `${searchResults.length} result${searchResults.length === 1 ? '' : 's'} for "${searchQuery}"`
                : `No results for "${searchQuery}"`}
            </p>

            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map(product => (
                  <div
                    key={product._id}
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="bg-zinc-900 border border-zinc-800 hover:border-white/20 rounded-xl p-5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {product.media && product.media.length > 0 && (
                        <img
                          src={product.media[0]}
                          alt={product.title}
                          className="w-14 h-14 rounded-lg object-cover shrink-0 bg-zinc-800"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 className="font-semibold text-white text-sm leading-tight group-hover:underline underline-offset-2">
                            {product.title}
                          </h3>
                          <div className="flex items-center gap-1 text-zinc-500 text-xs shrink-0">
                            <Heart className="w-3.5 h-3.5" />
                            <span>{product.upvotesCount || 0}</span>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-500 mb-2 line-clamp-2 leading-relaxed">
                          {product.pitch || product.description}
                        </p>

                        {product.autoTags && product.autoTags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {product.autoTags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-white/5 border border-white/10 text-zinc-400 px-2 py-0.5 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {product.autoTags.length > 3 && (
                              <span className="text-[10px] text-zinc-600">
                                +{product.autoTags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-zinc-600">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={product.author_profile} />
                              <AvatarFallback className="bg-zinc-800 text-[8px] text-white">
                                {product.author_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{product.author_name}</span>
                            <span>·</span>
                            <span>{product.category}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{product.reviewsCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(product.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-zinc-800 rounded-xl p-16 text-center">
                <Search className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
                <p className="text-zinc-500 text-sm font-medium mb-1">No products found</p>
                <p className="text-zinc-700 text-xs mb-6">
                  Try adjusting your search terms or browse popular products
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-white text-black text-xs font-semibold px-5 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Browse All Products
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
