import React, { useState, useEffect } from 'react';
import { Gem, Star, Heart, Eye, TrendingUp, Sparkles, Award, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { WishlistButton } from '../../WishlistButton';
import type { Product } from '../../../App';

interface HiddenGemsFeedProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

interface HiddenGem extends Product {
  gemScore: number;
  discoveryReason: string;
}

export function HiddenGemsFeed({ products, onProductClick }: HiddenGemsFeedProps) {
  const [hiddenGems, setHiddenGems] = useState<HiddenGem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const identifyHiddenGems = () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const gems: HiddenGem[] = products
        .filter(product => {
          // Hidden gems criteria:
          // 1. Not trending (low visibility)
          // 2. Created at least 7 days ago (not fresh)
          // 3. Has some engagement (quality indicator)
          // 4. Good review ratio if reviews exist
          const createdAt = new Date(product.createdAt);
          const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          
          return (
            !product.trending &&
            daysSinceCreation >= 7 &&
            product.upvotes.length >= 5 &&
            product.upvotes.length <= 25 &&
            product.reviews >= 2
          );
        })
        .map(product => {
          // Calculate gem score based on various factors
          let gemScore = 0;
          let discoveryReasons = [];

          // Quality score based on upvotes to reviews ratio
          const upvoteToReviewRatio = product.reviews > 0 ? product.upvotes.length / product.reviews : product.upvotes.length;
          if (upvoteToReviewRatio > 3) {
            gemScore += 30;
            discoveryReasons.push('High engagement quality');
          }

          // Consistency score (regular activity)
          const createdAt = new Date(product.createdAt);
          const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceCreation > 14) {
            gemScore += 20;
            discoveryReasons.push('Established presence');
          }

          // Underappreciated score (good but not trending)
          if (product.upvotes.length >= 10 && !product.trending) {
            gemScore += 25;
            discoveryReasons.push('Underrated quality');
          }

          // Review quality
          if (product.reviews >= 3) {
            gemScore += 15;
            discoveryReasons.push('Community validated');
          }

          // Tag diversity (indicates comprehensive product)
          if (product.autoTags && product.autoTags.length >= 3) {
            gemScore += 10;
            discoveryReasons.push('Well-documented');
          }

          return {
            ...product,
            gemScore,
            discoveryReason: discoveryReasons.slice(0, 2).join(', ')
          };
        })
        .sort((a, b) => b.gemScore - a.gemScore)
        .slice(0, 12); // Top 12 hidden gems

      setHiddenGems(gems);
      setIsLoading(false);
    };

    identifyHiddenGems();
  }, [products]);

  const filteredGems = selectedCategory === 'all' 
    ? hiddenGems 
    : hiddenGems.filter(gem => gem.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Gem className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Discovering Hidden Gems...</h2>
          <p className="text-gray-600 dark:text-gray-400">AI is analyzing products to find hidden treasures</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (hiddenGems.length === 0) {
    return (
      <div className="text-center py-12">
        <Gem className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Hidden Gems Found</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Check back later as we discover more quality products that deserve attention
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Gem className="w-8 h-8 text-purple-500" />
          <h2 className="text-3xl font-bold">Hidden Gems</h2>
          <Badge className="bg-purple-600 text-white border-0">AI Curated</Badge>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
          Quality products that deserve more attention. Our AI identifies underrated gems 
          based on engagement quality, community validation, and growth potential.
        </p>
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category === 'all' ? 'All Categories' : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
        <div className="flex items-center justify-around">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{hiddenGems.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Gems</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {Math.round(hiddenGems.reduce((acc, gem) => acc + gem.gemScore, 0) / hiddenGems.length)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Gem Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {hiddenGems.reduce((acc, gem) => acc + gem.upvotes.length, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Upvotes</div>
          </div>
        </div>
      </div>

      {/* Hidden Gems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGems.map((gem, index) => (
          <Card 
            key={gem._id}
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700 overflow-hidden"
            onClick={() => onProductClick(gem)}
          >
            {/* Gem Badge */}
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                <Gem className="w-3 h-3 mr-1" />
                Gem #{index + 1}
              </Badge>
            </div>

            {/* Gem Score */}
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {gem.gemScore}
                </span>
              </div>
            </div>

            {/* Product Image */}
            <div className="relative h-48 overflow-hidden">
              <ImageWithFallback
                src={gem.media[0]}
                alt={gem.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold group-hover:text-purple-600 transition-colors line-clamp-1">
                  {gem.title}
                </h3>
              </div>
              <Badge variant="outline" className="w-fit">
                {gem.category}
              </Badge>
            </CardHeader>

            <CardContent className="pb-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                {gem.description}
              </p>
              
              {/* Discovery Reason */}
              <div className="mb-3">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                  Why it's a gem:
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {gem.discoveryReason}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {gem.autoTags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  {gem.author_profile ? (
                    <img 
                      src={gem.author_profile} 
                      alt={gem.author_name} 
                      className="w-6 h-6 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {gem.author_name ? gem.author_name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {gem.author_name}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {gem.upvotes.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {gem.reviews}
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {filteredGems.length >= 12 && (
        <div className="text-center">
          <Button variant="outline" className="bg-white/50">
            Load More Hidden Gems
          </Button>
        </div>
      )}
    </div>
  );
}