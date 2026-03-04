import React, { useState, useRef, useEffect } from 'react';
import { Eye, Heart, MessageCircle, ExternalLink, Star, TrendingUp, Clock, Award, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { WishlistButton } from '../../WishlistButton';
import type { Product } from '../../../App';

interface HoverPreviewsProps {
  product: Product;
  children: React.ReactNode;
  onProductClick?: (product: Product) => void;
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface PreviewMetrics {
  engagementScore: number;
  trendIndicator: 'rising' | 'stable' | 'declining';
  qualityScore: number;
  recommendationScore: number;
}

export function HoverPreview({ 
  product, 
  children, 
  onProductClick,
  delay = 300,
  position = 'top'
}: HoverPreviewsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<PreviewMetrics | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateMetrics = () => {
      // Calculate engagement score based on upvotes, reviews, and freshness
      const upvotes = product.upvotes.length;
      const reviews = product.reviews;
      const createdAt = new Date(product.createdAt);
      const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      
      // Engagement score (0-100)
      const engagementScore = Math.min(100, 
        (upvotes * 2) + (reviews * 5) + (daysSinceCreation < 7 ? 20 : 0)
      );

      // Trend indicator based on recent activity
      let trendIndicator: 'rising' | 'stable' | 'declining' = 'stable';
      if (product.trending) {
        trendIndicator = 'rising';
      } else if (daysSinceCreation > 30 && upvotes < 5) {
        trendIndicator = 'declining';
      }

      // Quality score based on reviews and tags
      const qualityScore = Math.min(100, 
        (reviews * 10) + (product.autoTags?.length || 0 * 5) + (upvotes > 10 ? 15 : 0)
      );

      // Recommendation score (AI-like calculation)
      const recommendationScore = Math.round(
        (engagementScore * 0.4) + 
        (qualityScore * 0.4) + 
        (trendIndicator === 'rising' ? 20 : trendIndicator === 'stable' ? 10 : 0)
      );

      setMetrics({
        engagementScore,
        trendIndicator,
        qualityScore,
        recommendationScore
      });
    };

    if (isVisible && !metrics) {
      setIsLoading(true);
      // Simulate API call delay
      const timer = setTimeout(() => {
        calculateMetrics();
        setIsLoading(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isVisible, product, metrics]);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'text-green-600 dark:text-green-400';
      case 'stable': return 'text-blue-600 dark:text-blue-400';
      case 'declining': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-3 h-3" />;
      case 'stable': return <Clock className="w-3 h-3" />;
      case 'declining': return <TrendingUp className="w-3 h-3 rotate-180" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div className={`absolute z-50 ${getPositionClasses()} w-80`}>
          <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
            {/* Header */}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm line-clamp-2 flex-1 mr-2">
                  {product.title}
                </h3>
                <div className="flex items-center gap-1">
                  {product.trending && (
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                  {product.fresh && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      New
                    </Badge>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="w-fit text-xs">
                {product.category}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Product Image */}
              <div className="relative h-32 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={product.media[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="text-xs text-white font-medium">
                      {metrics?.recommendationScore || 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {product.description}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-red-500">
                    <Heart className="w-3 h-3" />
                    <span className="text-xs font-bold">{product.upvotes.length}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Upvotes</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-blue-500">
                    <MessageCircle className="w-3 h-3" />
                    <span className="text-xs font-bold">{product.reviews}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Reviews</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className={`flex items-center justify-center gap-1 ${getTrendColor(metrics?.trendIndicator || 'stable')}`}>
                    {getTrendIcon(metrics?.trendIndicator || 'stable')}
                    <span className="text-xs font-bold capitalize">
                      {metrics?.trendIndicator || 'stable'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Trend</p>
                </div>
              </div>

              {/* AI Insights */}
              {metrics && !isLoading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Engagement</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${metrics.engagementScore}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${getScoreColor(metrics.engagementScore)}`}>
                        {metrics.engagementScore}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Quality</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${metrics.qualityScore}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${getScoreColor(metrics.qualityScore)}`}>
                        {metrics.qualityScore}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {product.autoTags && product.autoTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.autoTags.slice(0, 4).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {product.autoTags.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{product.autoTags.length - 4}
                    </Badge>
                  )}
                </div>
              )}

              {/* Author Info */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
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
                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {product.author_name ? product.author_name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {product.author_name}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProductClick?.(product);
                  }}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Details
                </Button>
                <div onClick={(e) => e.stopPropagation()}>
                  <WishlistButton productId={product._id} size="sm" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Higher-order component for easy wrapping
export function withHoverPreview<P extends object>(
  Component: React.ComponentType<P>,
  getPreviewProps: (props: P) => { product: Product; onProductClick?: (product: Product) => void }
) {
  return function HoverPreviewWrapper(props: P) {
    const { product, onProductClick } = getPreviewProps(props);
    
    return (
      <HoverPreview product={product} onProductClick={onProductClick}>
        <Component {...props} />
      </HoverPreview>
    );
  };
}