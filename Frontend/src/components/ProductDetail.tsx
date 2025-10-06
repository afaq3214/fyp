import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  ExternalLink, 
  Github, 
  Star,
  Flag,
  Bookmark,
  TrendingUp,
  Users,
  Calendar,
  Eye,
  Sparkles,
  Send
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { Product, User } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useParams, useNavigate } from 'react-router-dom';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  currentUser: User | null;
}

const mockReviews = [
  {
    id: '1',
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2143c5f?w=150&h=150&fit=crop&crop=face',
      role: 'Product Designer'
    },
    rating: 5,
    content: 'This tool has completely transformed my writing workflow. The AI suggestions are incredibly accurate and contextual. Highly recommended for content creators!',
    date: '2 days ago',
    helpful: 12,
    emoji: '🚀'
  },
  {
    id: '2',
    author: {
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      role: 'Developer'
    },
    rating: 4,
    content: 'Great concept and execution. The interface is clean and intuitive. Would love to see more customization options in future updates.',
    date: '5 days ago',
    helpful: 8,
    emoji: '👍'
  },
  {
    id: '3',
    author: {
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      role: 'Marketing Manager'
    },
    rating: 5,
    content: 'Been using this for my team\'s content creation. The collaboration features work seamlessly. Definitely a game-changer!',
    date: '1 week ago',
    helpful: 15,
    emoji: '💎'
  }
];

const relatedProducts = [
  {
    id: '4',
    title: 'Grammar Pro',
    author: 'John Doe',
    upvotes: 78,
    category: 'AI Tools'
  },
  {
    id: '5',
    title: 'Content Planner',
    author: 'Lisa Smith',
    upvotes: 134,
    category: 'Productivity'
  },
  {
    id: '6',
    title: 'AI Copywriter',
    author: 'Tom Wilson',
    upvotes: 92,
    category: 'AI Tools'
  }
];

export function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');

  const emojiOptions = ['🚀', '💎', '👍', '🔥', '💡', '⭐', '🎯', '💯'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch product details
        const productRes = await fetch(`http://localhost:5000/api/products/${productId}`);
        if (!productRes.ok) throw new Error('Failed to fetch product');
        const productData = await productRes.json();
        setProduct(productData);

        // Get current user from localStorage
        const userJson = localStorage.getItem('user');
        if (userJson) {
          setCurrentUser(JSON.parse(userJson));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId]);

  const handleBack = () => {
    navigate('/');
  };

  const handleUpvote = () => {
    setIsUpvoted(!isUpvoted);
    toast.success(isUpvoted ? 'Upvote removed' : 'Product upvoted!');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleSubmitReview = () => {
    if (!currentUser) {
      toast.error('Please sign in to leave a review');
      return;
    }
    
    if (!reviewText.trim()) {
      toast.error('Please write a review');
      return;
    }

    toast.success('Review submitted successfully!');
    setReviewText('');
    setSelectedEmoji('');
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Discovery
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Header */}
            <Card>
              <CardContent className="p-8">
                {/* Product Image */}
                <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-6">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title and Badges */}
                <div className="flex flex-wrap items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-3">{product.title}</h1>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">{product.category}</Badge>
                      {product.trending && (
                        <Badge className="bg-orange-500 hover:bg-orange-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      {product.fresh && (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Fresh
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pitch */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
                  <p className="text-lg font-medium text-blue-900 dark:text-blue-100">
                    "{product.pitch}"
                  </p>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">About this product</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleUpvote}
                    variant={isUpvoted ? "default" : "outline"}
                    className={isUpvoted ? "bg-red-500 hover:bg-red-600" : ""}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isUpvoted ? 'fill-current' : ''}`} />
                    {isUpvoted ? 'Upvoted' : 'Upvote'} ({product.upvotes + (isUpvoted ? 1 : 0)})
                  </Button>
                  
                  <Button variant="outline" onClick={handleBookmark}>
                    <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Button>
                  
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>

                  {product.demoUrl && (
                    <Button asChild>
                      <a href={product.demoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Try Demo
                      </a>
                    </Button>
                  )}

                  {product.githubUrl && (
                    <Button variant="outline" asChild>
                      <a href={product.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        View Code
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Reviews ({mockReviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="reviews" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="reviews">All Reviews</TabsTrigger>
                    <TabsTrigger value="write">Write Review</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="reviews" className="mt-6">
                    <div className="space-y-6">
                      {mockReviews.map(review => (
                        <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                          <div className="flex items-start space-x-4">
                            <Avatar>
                              <AvatarImage src={review.author.avatar} />
                              <AvatarFallback>{review.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-medium">{review.author.name}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{review.author.role}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-2xl">{review.emoji}</span>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 mb-3">{review.content}</p>
                              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>{review.date}</span>
                                <Button variant="ghost" size="sm">
                                  👍 Helpful ({review.helpful})
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="write" className="mt-6">
                    {currentUser ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4 mb-4">
                          <Avatar>
                            <AvatarImage src={currentUser.avatar} />
                            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{currentUser.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Writing as yourself</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Choose an emoji tag</label>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {emojiOptions.map(emoji => (
                              <Button
                                key={emoji}
                                variant={selectedEmoji === emoji ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedEmoji(emoji)}
                                className="text-lg"
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <Textarea
                          placeholder="Share your thoughts about this product... (50 words max for micro-review)"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="min-h-[100px]"
                        />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {reviewText.length}/280 characters
                          </span>
                          <Button onClick={handleSubmitReview} disabled={!reviewText.trim() || !selectedEmoji}>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Review
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Please sign in to write a review
                        </p>
                        <Button>Sign In</Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Maker Info */}
            <Card>
              <CardHeader>
                <CardTitle>Made by</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar>
                    <AvatarImage src={product.author.avatar} />
                    <AvatarFallback>{product.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{product.author.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.author.projects} projects</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Connect & Collaborate
                </Button>
              </CardContent>
            </Card>

            {/* Product Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Product Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Upvotes</span>
                  <span className="font-medium">{product.upvotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reviews</span>
                  <span className="font-medium">{product.reviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Views</span>
                  <span className="font-medium">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created</span>
                  <span className="font-medium">{product.createdAt}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Community Score</span>
                    <span>87/100</span>
                  </div>
                  <Progress value={87} />
                </div>
              </CardContent>
            </Card>

            {/* Related Products */}
            <Card>
              <CardHeader>
                <CardTitle>Related Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {relatedProducts.map(related => (
                  <div key={related.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <div>
                      <h4 className="font-medium text-sm">{related.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">by {related.author}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">↑ {related.upvotes}</div>
                      <Badge variant="secondary" className="text-xs">{related.category}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Report */}
            <Card>
              <CardContent className="p-4">
                <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Flag className="w-4 h-4 mr-2" />
                  Report Product
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}