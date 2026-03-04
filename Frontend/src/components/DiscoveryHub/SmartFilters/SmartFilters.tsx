import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Search, SlidersHorizontal, Sparkles, TrendingUp, Clock, Star, Heart, Award, Zap, X, ChevronDown } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { 
  Checkbox,
  CheckboxGroup,
  CheckboxWrapper
} from '../../ui/checkbox';
import { Slider } from '../../ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import type { Product } from '../../../App';

interface SmartFiltersProps {
  products: Product[];
  onFiltersChange: (filteredProducts: Product[]) => void;
  onSortChange?: (sortOption: string) => void;
}

interface FilterState {
  search: string;
  categories: string[];
  tags: string[];
  minUpvotes: number;
  minReviews: number;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  trending: boolean;
  fresh: boolean;
  priceRange: 'all' | 'free' | 'paid' | 'premium';
  engagement: 'all' | 'high' | 'medium' | 'low';
  sortBy: 'relevance' | 'upvotes' | 'reviews' | 'newest' | 'trending';
  aiRecommended: boolean;
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  filters: Partial<FilterState>;
  matchCount: number;
}

export function SmartFilters({ products, onFiltersChange, onSortChange }: SmartFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    tags: [],
    minUpvotes: 0,
    minReviews: 0,
    dateRange: 'all',
    trending: false,
    fresh: false,
    priceRange: 'all',
    engagement: 'all',
    sortBy: 'relevance',
    aiRecommended: false
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Extract unique categories and tags from products
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))).sort();
  }, [products]);

  const tags = useMemo(() => {
    const allTags = products.flatMap(p => p.autoTags || []);
    return Array.from(new Set(allTags)).sort();
  }, [products]);

  // AI-powered filter recommendations
  const aiRecommendations = useMemo((): AIRecommendation[] => {
    const recommendations: AIRecommendation[] = [];

    // Trending products with high engagement
    const trendingHighEngagement = products.filter(p => 
      p.trending && p.upvotes.length > 10 && p.reviews > 5
    );
    if (trendingHighEngagement.length > 0) {
      recommendations.push({
        id: 'trending-high',
        title: '🔥 Trending & Popular',
        description: 'Products that are trending with high community engagement',
        icon: <TrendingUp className="w-4 h-4" />,
        filters: { trending: true, minUpvotes: 10, minReviews: 5, sortBy: 'trending' },
        matchCount: trendingHighEngagement.length
      });
    }

    // Hidden gems (quality but low visibility)
    const hiddenGems = products.filter(p => 
      !p.trending && 
      p.upvotes.length >= 5 && 
      p.upvotes.length <= 20 &&
      p.reviews >= 3
    );
    if (hiddenGems.length > 0) {
      recommendations.push({
        id: 'hidden-gems',
        title: '💎 Hidden Gems',
        description: 'Quality products that deserve more attention',
        icon: <Star className="w-4 h-4" />,
        filters: { trending: false, minUpvotes: 5, minReviews: 3, sortBy: 'relevance' },
        matchCount: hiddenGems.length
      });
    }

    // Fresh launches with potential
    const freshPromising = products.filter(p => {
      const createdAt = new Date(p.createdAt);
      const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return p.fresh && daysSinceCreation <= 7 && p.upvotes.length >= 3;
    });
    if (freshPromising.length > 0) {
      recommendations.push({
        id: 'fresh-promising',
        title: '🚀 Fresh & Promising',
        description: 'Recently launched products showing early traction',
        icon: <Clock className="w-4 h-4" />,
        filters: { fresh: true, minUpvotes: 3, dateRange: 'week', sortBy: 'newest' },
        matchCount: freshPromising.length
      });
    }

    // Community favorites
    const communityFavorites = products.filter(p => 
      p.upvotes.length > 20 && p.reviews > 10
    );
    if (communityFavorites.length > 0) {
      recommendations.push({
        id: 'community-favorites',
        title: '❤️ Community Favorites',
        description: 'Most loved products by the community',
        icon: <Heart className="w-4 h-4" />,
        filters: { minUpvotes: 20, minReviews: 10, sortBy: 'upvotes' },
        matchCount: communityFavorites.length
      });
    }

    return recommendations.sort((a, b) => b.matchCount - a.matchCount);
  }, [products]);

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower) ||
        (p.autoTags && p.autoTags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(p => 
        p.autoTags && filters.tags.some(tag => p.autoTags!.includes(tag))
      );
    }

    // Upvotes filter
    if (filters.minUpvotes > 0) {
      filtered = filtered.filter(p => p.upvotes.length >= filters.minUpvotes);
    }

    // Reviews filter
    if (filters.minReviews > 0) {
      filtered = filtered.filter(p => p.reviews >= filters.minReviews);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      switch (filters.dateRange) {
        case 'today':
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }

      filtered = filtered.filter(p => new Date(p.createdAt) >= cutoffDate);
    }

    // Trending filter
    if (filters.trending) {
      filtered = filtered.filter(p => p.trending);
    }

    // Fresh filter
    if (filters.fresh) {
      filtered = filtered.filter(p => p.fresh);
    }

    // Engagement filter
    if (filters.engagement !== 'all') {
      filtered = filtered.filter(p => {
        const totalEngagement = p.upvotes.length + p.reviews;
        switch (filters.engagement) {
          case 'high':
            return totalEngagement > 20;
          case 'medium':
            return totalEngagement >= 5 && totalEngagement <= 20;
          case 'low':
            return totalEngagement < 5;
          default:
            return true;
        }
      });
    }

    // Sort products
    switch (filters.sortBy) {
      case 'upvotes':
        filtered.sort((a, b) => b.upvotes.length - a.upvotes.length);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'trending':
        filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
        break;
      case 'relevance':
      default:
        // Keep original order or apply relevance scoring
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered.sort((a, b) => {
            const aScore = 
              (a.title.toLowerCase().includes(searchLower) ? 3 : 0) +
              (a.description.toLowerCase().includes(searchLower) ? 2 : 0) +
              (a.category.toLowerCase().includes(searchLower) ? 1 : 0);
            const bScore = 
              (b.title.toLowerCase().includes(searchLower) ? 3 : 0) +
              (b.description.toLowerCase().includes(searchLower) ? 2 : 0) +
              (b.category.toLowerCase().includes(searchLower) ? 1 : 0);
            return bScore - aScore;
          });
        }
        break;
    }

    return filtered;
  }, [products, filters]);

  // Update parent component when filters change
  useEffect(() => {
    onFiltersChange(filteredProducts);
    onSortChange?.(filters.sortBy);
  }, [filteredProducts, onFiltersChange, onSortChange, filters.sortBy]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyAIRecommendation = (recommendation: AIRecommendation) => {
    setFilters(prev => ({ ...prev, ...recommendation.filters }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      categories: [],
      tags: [],
      minUpvotes: 0,
      minReviews: 0,
      dateRange: 'all',
      trending: false,
      fresh: false,
      priceRange: 'all',
      engagement: 'all',
      sortBy: 'relevance',
      aiRecommended: false
    });
  };

  const getActiveFilterCount = () => {
    return [
      filters.search,
      filters.categories.length,
      filters.tags.length,
      filters.minUpvotes,
      filters.minReviews,
      filters.dateRange !== 'all',
      filters.trending,
      filters.fresh,
      filters.priceRange !== 'all',
      filters.engagement !== 'all'
    ].filter(Boolean).length;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-lg">Smart Filters</CardTitle>
              {getActiveFilterCount() > 0 && (
                <Badge className="bg-blue-600 text-white border-0">
                  {getActiveFilterCount()} active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getActiveFilterCount() > 0 && (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Search Bar */}
        <CardContent className="pt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products, tags, or categories..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-base">AI Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiRecommendations.map(rec => (
                <Button
                  key={rec.id}
                  variant="outline"
                  className="h-auto p-3 justify-start"
                  onClick={() => applyAIRecommendation(rec)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 mt-1">{rec.icon}</div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{rec.title}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {rec.description}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {rec.matchCount} products
                      </Badge>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Filters */}
      {isExpanded && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                {/* Categories */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Badge
                        key={category}
                        variant={filters.categories.includes(category) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const newCategories = filters.categories.includes(category)
                            ? filters.categories.filter(c => c !== category)
                            : [...filters.categories, category];
                          handleFilterChange('categories', newCategories);
                        }}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <Select value={filters.dateRange} onValueChange={(value: any) => handleFilterChange('dateRange', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Filters */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Quick Filters</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.trending}
                        onChange={(e) => handleFilterChange('trending', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Trending Products</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.fresh}
                        onChange={(e) => handleFilterChange('fresh', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Fresh Launches</span>
                    </label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="engagement" className="space-y-4">
                {/* Upvotes Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Minimum Upvotes: {filters.minUpvotes}
                  </label>
                  <Slider
                    value={[filters.minUpvotes]}
                    onValueChange={([value]) => handleFilterChange('minUpvotes', value)}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Reviews Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Minimum Reviews: {filters.minReviews}
                  </label>
                  <Slider
                    value={[filters.minReviews]}
                    onValueChange={([value]) => handleFilterChange('minReviews', value)}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Engagement Level */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Engagement Level</label>
                  <Select value={filters.engagement} onValueChange={(value: any) => handleFilterChange('engagement', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="high">High (20+ interactions)</SelectItem>
                      <SelectItem value="medium">Medium (5-20 interactions)</SelectItem>
                      <SelectItem value="low">Low (&lt;5 interactions)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                {/* Tags */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {tags.slice(0, 20).map(tag => (
                      <Badge
                        key={tag}
                        variant={filters.tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          const newTags = filters.tags.includes(tag)
                            ? filters.tags.filter(t => t !== tag)
                            : [...filters.tags, tag];
                          handleFilterChange('tags', newTags);
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(value: any) => handleFilterChange('sortBy', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="upvotes">Most Upvotes</SelectItem>
                      <SelectItem value="reviews">Most Reviews</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="trending">Trending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          Showing {filteredProducts.length} of {products.length} products
        </span>
        {filters.search && (
          <span>
            for "{filters.search}"
          </span>
        )}
      </div>
    </div>
  );
}