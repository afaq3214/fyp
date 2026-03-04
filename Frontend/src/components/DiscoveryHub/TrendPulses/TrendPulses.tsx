import React, { useState, useEffect } from 'react';
import { TrendingUp, Flame, Clock, Activity, Award, Zap, Users, Target, Rocket, Gem } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Card, CardContent } from '../../ui/card';
import type { Product } from '../../../App';

interface TrendPulsesProps {
  products: Product[];
}

interface TrendMetrics {
  trendingNow: number;
  freshLaunches: number;
  hiddenGems: number;
  risingStars: number;
  trendingProducts: Product[];
  freshProducts: Product[];
  hiddenGemsProducts: Product[];
  risingProducts: Product[];
}

export function TrendPulses({ products }: TrendPulsesProps) {
  const [metrics, setMetrics] = useState<TrendMetrics>({
    trendingNow: 0,
    freshLaunches: 0,
    hiddenGems: 0,
    risingStars: 0,
    trendingProducts: [],
    freshProducts: [],
    hiddenGemsProducts: [],
    risingProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateMetrics = () => {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const trendingProducts = products.filter(p => p.trending);
      const freshProducts = products.filter(p => 
        new Date(p.createdAt) > twentyFourHoursAgo
      );
      
      // Hidden gems: High quality (upvotes > 5) but low visibility (not trending, created > 7 days ago)
      const hiddenGemsProducts = products.filter(p => 
        !p.trending && 
        p.upvotes.length > 5 && 
        p.upvotes.length < 20 &&
        new Date(p.createdAt) < sevenDaysAgo &&
        p.reviews >= 3
      );

      // Rising stars: Products gaining momentum (upvotes 10-50, recent growth)
      const risingProducts = products.filter(p => 
        p.upvotes.length >= 10 && 
        p.upvotes.length <= 50 &&
        new Date(p.createdAt) > sevenDaysAgo &&
        !p.trending
      );

      setMetrics({
        trendingNow: trendingProducts.length,
        freshLaunches: freshProducts.length,
        hiddenGems: hiddenGemsProducts.length,
        risingStars: risingProducts.length,
        trendingProducts,
        freshProducts,
        hiddenGemsProducts,
        risingProducts
      });
      setIsLoading(false);
    };

    calculateMetrics();
  }, [products]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-5">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Trending Now */}
        <Card className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-sm border-orange-500/30 hover:shadow-lg transition-all duration-300 group cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-orange-200">Trending Now</span>
              <Badge className="bg-orange-600 text-white border-0 ml-auto">Live</Badge>
            </div>
            <div className="text-3xl text-white mb-2 font-bold">{metrics.trendingNow}</div>
            <div className="text-sm text-orange-200">
              {products.length > 0 && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {Math.round(metrics.trendingNow / products.length * 100)}% of total
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fresh Launches */}
        <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border-green-500/30 hover:shadow-lg transition-all duration-300 group cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-green-200">Fresh Launches</span>
              <Badge className="bg-green-600 text-white border-0 ml-auto">New</Badge>
            </div>
            <div className="text-3xl text-white mb-2 font-bold">{metrics.freshLaunches}</div>
            <div className="text-sm text-green-200">Last 24 hours</div>
          </CardContent>
        </Card>

        {/* Hidden Gems */}
        <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border-purple-500/30 hover:shadow-lg transition-all duration-300 group cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Gem className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-purple-200">Hidden Gems</span>
              <Badge className="bg-purple-600 text-white border-0 ml-auto">AI</Badge>
            </div>
            <div className="text-3xl text-white mb-2 font-bold">{metrics.hiddenGems}</div>
            <div className="text-sm text-purple-200">Quality with low visibility</div>
          </CardContent>
        </Card>

        {/* Rising Stars */}
        <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border-blue-500/30 hover:shadow-lg transition-all duration-300 group cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-blue-200">Rising Stars</span>
              <Badge className="bg-blue-600 text-white border-0 ml-auto">Hot</Badge>
            </div>
            <div className="text-3xl text-white mb-2 font-bold">{metrics.risingStars}</div>
            <div className="text-sm text-blue-200">Gaining momentum</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Preview Section */}
      {(metrics.trendingProducts.length > 0 || metrics.freshProducts.length > 0 || metrics.hiddenGemsProducts.length > 0 || metrics.risingProducts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Trending Products */}
          {metrics.trendingProducts.length > 0 && (
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100">🔥 Trending Products</h4>
                </div>
                <div className="space-y-2">
                  {metrics.trendingProducts.slice(0, 3).map((product, index) => (
                    <div key={product._id} className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                          {product.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          ↑ {product.upvotes.length} upvotes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fresh Launches */}
          {metrics.freshProducts.length > 0 && (
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Rocket className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-green-900 dark:text-green-100">🚀 Fresh Launches</h4>
                </div>
                <div className="space-y-2">
                  {metrics.freshProducts.slice(0, 3).map((product, index) => (
                    <div key={product._id} className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                      <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                          {product.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}