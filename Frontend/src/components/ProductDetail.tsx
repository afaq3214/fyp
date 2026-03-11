import React, { useState, useEffect, useContext } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  ExternalLink, 
  Github, 
  Star,Bookmark,
  TrendingUp,
  Users,
  Calendar,
  Eye,
  Sparkles,
  Send,
  ChevronLeft,
  ChevronRight,
  BarChart3
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
import { WishlistButton } from './WishlistButton';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '@/context/UserContext';
import ContentWarning, { ContentChecker, useContentChecker } from './ContentWarning';
import { Flag } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  currentUser: User | null;
}
interface MongoId {
  $oid: string;
}

interface MongoDate {
  $date: string;
}

export interface ProductCommentRaw {
  _id: MongoId;
  productId: MongoId;
  userId: MongoId;
  profilePicture: string;
  username: string;
  comment: string;
  rating:number;
  createdAt: MongoDate;
  updatedAt: MongoDate;
  __v: number;
  emoji:string;
}


;

export function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const {userId,SendComments,darkmode}=useContext(UserContext);
  const [product, setProduct] = useState<Product | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [productUpvotes,setProductUpvotes]=useState(0);
  const [productComments, setProductComments] = useState<ProductCommentRaw[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [contentWarning, setContentWarning] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const { checkContent, isChecking } = useContentChecker();

  const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";
  const emojiOptions = ['🚀', '💎', '👍', '🔥', '💡', '⭐', '🎯', '💯'];

  useEffect(()=>{
    const GetProductComments=async()=>{
        try {
            const commentsRes = await fetch(`${url}/api/comments/product/${productId}`);
            if (!commentsRes.ok) throw new Error('Failed to fetch comments');
            const commentsData = await commentsRes.json(); // this is already an array
            setProductComments(Array.isArray(commentsData) ? commentsData : []);
        } catch (err) {
            console.error(err);
        }
    }
    GetProductComments();
    const FetchUpvotes=async()=>{
        try {
            const upvoteRes = await fetch(`${url}/api/upvotes/getproductupvotes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId })
            });
            if (!upvoteRes.ok) throw new Error('Failed to fetch upvotes');
            const upvoteData = await upvoteRes.json();
            setProductUpvotes(upvoteData.upvote.userIds.length);
        } catch (err) {
            console.error(err);
        }
    }
    FetchUpvotes();
  },[])
  useEffect(() => {
    

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch product details
        const productRes = await fetch(`${url}/api/products/${productId}`);
        if (!productRes.ok) throw new Error('Failed to fetch product');
        const productData = await productRes.json();
        setProduct(productData);

        // Get current user from localStorage
        const userJson = localStorage.getItem('token');
        if (userJson) {
          setCurrentUser(userJson);
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

    const checkUpvote = axios.get(`${url}/api/upvotes/check-upvote`, {
      params: {
        userIds: userId,
        productId: productId
      }
    });
    checkUpvote.then(response => {
      setIsUpvoted(response.data.upvote);
    });
  }, [productId]);

  const handleBack = () => {
    navigate('/');
  };

  const userContext = useContext(UserContext);
  
  const handleUpvote = async () => {
  if (!userId) {
    toast.error('Please log in to upvote');
    return;
  }

  const endpoint = isUpvoted 
    ? 'http://localhost:5000/api/upvotes/remove-upvote' 
    : 'http://localhost:5000/api/upvotes/upvote';

  try {
    const response = await axios.post(endpoint, {
      userIds: userId,
      productId: productId 
    });
    
    console.log(response.data);
    setIsUpvoted(!isUpvoted);
    toast.success(isUpvoted ? 'Upvote removed!' : 'Product upvoted!');
    
    // Refresh notifications after upvoting
    if (userContext?.refreshNotifications) {
      await userContext.refreshNotifications();
    }
  } catch (error) {
    console.error('Error updating vote:', error);
    toast.error(error.response?.data?.message || 'Failed to update vote. Please try again.');
  }
};

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleSubmitReview = async () => {
  if (!userId) {
    toast.error('Please sign in to leave a review');
    return;
  }

  if (!reviewText.trim()) {
    toast.error('Please write a review');
    return;
  }

  if (!SendComments) {
    toast.error('Cannot send comment right now');
    return;
  }

  // Check content before submitting
  setIsSubmitting(true);
  try {
    const analysisResult = await checkContent(reviewText, 'comment');
    
    if (analysisResult && analysisResult.analysis.requiresModeration) {
      toast.warning('Your comment has been flagged for review and will be moderated before being posted.');
    }

    await SendComments(reviewText, product._id, selectedEmoji, rating);
    
    if (analysisResult && analysisResult.analysis.requiresModeration) {
      toast.success('Review submitted and is under review.');
    } else {
      toast.success('Review submitted successfully!');
    }
    
    setReviewText('');
    setSelectedEmoji('');
    setRating(0);
    setContentWarning(null);
    
    // Refresh notifications after submitting comment
    if (userContext?.refreshNotifications) {
      await userContext.refreshNotifications();
    }
  } catch (err: any) {
    // Handle specific error for commenting on own product
    if (err.message === 'You cannot comment on your own product') {
      toast.error('You cannot comment on your own product');
    } else {
      toast.error('Failed to submit review. Please try again.');
    }
  } finally {
    setIsSubmitting(false);
  }
};

const handleReportComment = async () => {
  if (!selectedComment || !reportReason) {
    toast.error('Please select a reason for reporting');
    return;
  }

  console.log('🚨 Reporting comment:', selectedComment);
  console.log('📝 Report reason:', reportReason);
  console.log('📄 Report description:', reportDescription);

  const payload = {
    contentId: selectedComment._id?.toString() || selectedComment._id,
    contentType: 'Comment',
    reason: reportReason,
    description: reportDescription
  };

  console.log('📦 Sending payload:', payload);

  try {
    const response = await fetch('/api/moderation/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });

    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      toast.success('Comment reported successfully');
      setShowReportDialog(false);
      setSelectedComment(null);
      setReportReason('');
      setReportDescription('');
    } else {
      const errorData = await response.json();
      console.error('❌ Error response:', errorData);
      toast.error(errorData.message || 'Failed to report comment');
    }
  } catch (error) {
    toast.error('Error reporting comment');
  }
};

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      darkmode 
        ? 'bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/30' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-20 ${
          darkmode ? 'bg-blue-500' : 'bg-purple-300'
        } animate-pulse`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          darkmode ? 'bg-purple-500' : 'bg-blue-300'
        } animate-pulse delay-1000`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10 ${
          darkmode ? 'bg-indigo-500' : 'bg-indigo-200'
        } animate-pulse delay-2000`}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Back Button */}
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className={`mb-8 group backdrop-blur-md border ${
            darkmode 
              ? 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white' 
              : 'bg-white/50 border-gray-200/50 text-gray-600 hover:bg-white/70 hover:text-gray-900'
          } transition-all duration-300`}
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Discovery
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Product Header */}
            <div className={`relative rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border transition-all duration-500 hover:shadow-3xl ${
              darkmode 
                ? 'bg-gradient-to-br from-slate-800/90 to-blue-900/70 border-slate-700/50' 
                : 'bg-gradient-to-br from-white/90 to-blue-50/80 border-white/50'
            }`}>
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${
                darkmode 
                  ? 'from-blue-600/10 via-purple-600/10 to-pink-600/10' 
                  : 'from-indigo-500/5 via-purple-500/5 to-pink-500/5'
              } opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
              
              <div className="relative p-8">
                {/* Product Media Carousel */}
                <div className="relative w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden mb-8 group shadow-inner">
                  {product.media && product.media.length > 0 ? (
                    <>
                      {/* Current Media Display */}
                      <div className="w-full h-full">
                        {product.media[currentMediaIndex]?.endsWith('.mp4') || 
                         product.media[currentMediaIndex]?.endsWith('.webm') || 
                         product.media[currentMediaIndex]?.endsWith('.mov') ? (
                          <video
                            src={product.media[currentMediaIndex]}
                            className="w-full h-full object-cover"
                            controls
                            key={currentMediaIndex}
                          />
                        ) : (
                          <ImageWithFallback
                            src={product.media[currentMediaIndex]}
                            alt={`${product.title} - ${currentMediaIndex + 1}`}
                            className="w-full h-full object-contain bg-white/50"
                          />
                        )}
                      </div>

                      {/* Enhanced Navigation Arrows */}
                      {product.media.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentMediaIndex(prev => 
                              prev === 0 ? product.media.length - 1 : prev - 1
                            )}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-black/70 to-black/50 hover:from-black/80 hover:to-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 shadow-lg"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={() => setCurrentMediaIndex(prev => 
                              prev === product.media.length - 1 ? 0 : prev + 1
                            )}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-black/50 to-black/70 hover:from-black/60 hover:to-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 shadow-lg"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>

                          {/* Enhanced Dots Indicator */}
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full">
                            {product.media.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentMediaIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                  index === currentMediaIndex 
                                    ? 'bg-white w-8 shadow-lg' 
                                    : 'bg-white/50 hover:bg-white/75 hover:scale-125'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Enhanced Counter */}
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                            {currentMediaIndex + 1} / {product.media.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                          darkmode ? 'bg-gray-800' : 'bg-gray-200'
                        }`}>
                          <Eye className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No media available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Thumbnail Gallery */}
                {product.media && product.media.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
                    {product.media.map((mediaUrl, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentMediaIndex(index)}
                        className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${
                          index === currentMediaIndex
                            ? 'border-blue-500 ring-4 ring-blue-200/50 shadow-lg scale-105'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {mediaUrl.endsWith('.mp4') || 
                         mediaUrl.endsWith('.webm') || 
                         mediaUrl.endsWith('.mov') ? (
                          <div className="relative w-full h-full bg-gray-900">
                            <video
                              src={mediaUrl}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <ImageWithFallback
                            src={mediaUrl}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        {index === currentMediaIndex && (
                          <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Enhanced Title and Badges */}
                <div className="flex flex-wrap items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className={`text-4xl font-bold mb-4 bg-gradient-to-r ${
                      darkmode 
                        ? 'from-blue-400 via-purple-400 to-pink-400' 
                        : 'from-blue-600 via-purple-600 to-pink-600'
                    } bg-clip-text text-transparent transition-all duration-300 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500`}>
                      {product.title}
                    </h1>
                    <div className="flex flex-wrap gap-3">
                      <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border ${
                        darkmode 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-400/30' 
                          : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-indigo-400/30'
                      }`}>
                        {product.category}
                      </div>
                      {product.trending && (
                        <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-md flex items-center gap-2 ${
                          darkmode 
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-400/30' 
                            : 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-200/30'
                        }`}>
                          <TrendingUp className="w-4 h-4" />
                          Trending
                        </div>
                      )}
                      {product.fresh && (
                        <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-md flex items-center gap-2 ${
                          darkmode 
                            ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white border-emerald-400/30' 
                            : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-emerald-200/30'
                        }`}>
                          <Sparkles className="w-4 h-4" />
                          Fresh
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Pitch */}
                <div className={`relative rounded-2xl p-6 mb-8 backdrop-blur-md border shadow-lg ${
                  darkmode 
                    ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-700/50' 
                    : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200/50'
                }`}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl"></div>
                  <p className={`text-xl font-medium leading-relaxed ${
                    darkmode ? 'text-blue-100' : 'text-blue-900'
                  }`}>
                    "{product.pitch}"
                  </p>
                </div>

                {/* Enhanced Description */}
                <div className="mb-8">
                  <h3 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${
                    darkmode 
                      ? 'from-gray-200 to-gray-400' 
                      : 'from-gray-700 to-gray-900'
                  } bg-clip-text text-transparent`}>
                    About this product
                  </h3>
                  <div className={`rounded-2xl p-6 backdrop-blur-md border ${
                    darkmode 
                      ? 'bg-gray-800/50 border-gray-700/50' 
                      : 'bg-white/50 border-gray-200/50'
                  }`}>
                    <p className={`text-lg leading-relaxed ${
                      darkmode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Enhanced Tags */}
                <div className="mb-8">
                  <h3 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${
                    darkmode 
                      ? 'from-gray-200 to-gray-400' 
                      : 'from-gray-700 to-gray-900'
                  } bg-clip-text text-transparent`}>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.autoTags.map((tag, index) => (
                      <div
                        key={tag}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md backdrop-blur-sm border ${
                          darkmode 
                            ? 'bg-blue-700/50 text-blue-300 border-blue-600/30 hover:bg-blue-600/50' 
                            : 'bg-indigo-100/70 text-indigo-700 border-indigo-200/50 hover:bg-indigo-100'
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        #{tag}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {/* <div className="mb-6">
                  <h3 className="font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.autoTags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div> */}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleUpvote}
                    variant={isUpvoted ? "default" : "outline"}
                    className={isUpvoted ? "bg-red-500 hover:bg-red-600" : ""}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isUpvoted ? 'fill-current' : ''}`} />
                    {isUpvoted ? 'Upvoted' : 'Upvote'} 
                  </Button>
                  
                  <WishlistButton productId={product._id} size="md" />
                  
                  {/* <Button variant="outline" onClick={handleBookmark}>
                    <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Button> */}
                  
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
              </div>
            </div>

            {/* Reviews Section - Redesigned */}
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <CardTitle className="text-white flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Community Feedback ({productComments.length})
                </CardTitle>
              </div>
              <CardContent className="p-6">
                <Tabs defaultValue="reviews" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
                    <TabsTrigger value="reviews" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md transition-all duration-300">
                      <Eye className="w-4 h-4 mr-2" />
                      All Reviews
                    </TabsTrigger>
                    <TabsTrigger value="write" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md transition-all duration-300">
                      <Send className="w-4 h-4 mr-2" />
                      Write Review
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="reviews" className="mt-6">
                    <div className="space-y-4">
                      {productComments.length === 0 ? (
                        <div className="text-center py-12 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/20">
                          <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-600 dark:text-gray-400 font-medium">No reviews yet.</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Be the first to share your thoughts!</p>
                        </div>
                      ) : (
                        productComments.map(review => (
                          <div key={review._id.$oid} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/20 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                            <div className="flex items-start space-x-4">
                              <div className="relative">
                                <Avatar className="h-12 w-12 ring-2 ring-white/30 dark:ring-gray-700/30">
                                  <AvatarImage src={review.profilePicture} />
                                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold">
                                    {review.username?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white dark:border-gray-800"></div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{review.username || 'Anonymous User'}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Verified Reviewer</p>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <div className="text-3xl bg-white/70 dark:bg-gray-700/70 px-3 py-1 rounded-lg border border-white/30 dark:border-gray-600/30">
                                      {review.emoji}
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{review.rating}/5</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white/30 dark:bg-gray-700/30 rounded-lg p-4 mb-4 border border-white/20 dark:border-gray-600/20">
                                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{review.comment}</p>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <span>{new Date(review.createdAt.$date).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric"
                                    })}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedComment(review);
                                      setShowReportDialog(true);
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                                  >
                                    <Flag className="w-3 h-3 mr-1" />
                                    Report
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="write" className="mt-6">
                    {currentUser ? (
                      <div className="space-y-6">
                        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/20">
                          <div className="flex items-center space-x-4 mb-6">
                            <Avatar className="h-12 w-12 ring-2 ring-white/30 dark:ring-gray-700/30">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                                {currentUser?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white">{currentUser?.name || 'Anonymous User'}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Writing your review
                              </p>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                                <span className="flex items-center">
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Choose your emoji tag
                                </span>
                              </label>
                              <div className="flex flex-wrap gap-3">
                                {emojiOptions.map(emoji => (
                                  <Button
                                    key={emoji}
                                    variant={selectedEmoji === emoji ? "default" : "outline"}
                                    size="lg"
                                    onClick={() => setSelectedEmoji(emoji)}
                                    className={`text-2xl transition-all duration-300 ${
                                      selectedEmoji === emoji 
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg scale-110' 
                                        : 'hover:scale-105 hover:shadow-md'
                                    }`}
                                  >
                                    {emoji}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                                <span className="flex items-center">
                                  <Star className="w-4 h-4 mr-2" />
                                  Your rating
                                </span>
                              </label>
                              <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((starValue) => (
                                  <button
                                    key={starValue}
                                    type="button"
                                    onClick={() => setRating(starValue)}
                                    onMouseEnter={() => setHoverRating(starValue)}
                                    onMouseLeave={() => setHoverRating(null)}
                                    className="focus:outline-none transition-all duration-200 hover:scale-110"
                                  >
                                    <Star
                                      className={`w-8 h-8 ${
                                        (hoverRating ?? rating) >= starValue
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                                {rating > 0 && (
                                  <span className="ml-3 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-700/50 px-3 py-1 rounded-full border border-white/20 dark:border-gray-600/20">
                                    {rating} / 5 stars
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                                <span className="flex items-center">
                                  <Send className="w-4 h-4 mr-2" />
                                  Your review
                                </span>
                              </label>
                              <Textarea
                                placeholder="Share your thoughts about this product... What did you love? What could be improved?"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                className="min-h-[120px] bg-white/30 dark:bg-gray-700/30 border-white/20 dark:border-gray-600/20 resize-none focus:ring-2 focus:ring-green-500/50"
                              />
                              
                              <div className="flex justify-between items-center mt-3">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {reviewText.length}/280 characters
                                </span>
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                  💡 Be specific and helpful
                                </div>
                              </div>
                            </div>
                            
                            {/* Real-time content checking */}
                            <ContentChecker 
                              content={reviewText}
                              contentType="comment"
                              onWarning={(warning) => setContentWarning(warning)}
                            />
                            
                            {/* Show content warning if any */}
                            {contentWarning && (
                              <div className="mt-2">
                                <ContentWarning
                                  warning={contentWarning}
                                  variant="inline"
                                  showDismiss={false}
                                />
                              </div>
                            )}
                            
                            <Button 
                              onClick={handleSubmitReview} 
                              disabled={!reviewText.trim() || !selectedEmoji || isSubmitting || isChecking}
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg transition-all duration-300 hover:scale-[1.02]"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/20">
                        <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">
                          Please sign in to write a review
                        </p>
                        <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                          Sign In to Review
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Maker Info - Redesigned */}
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Creator Profile
                </CardTitle>
              </div>
              <CardContent className="p-6">
                <div 
                  className="group cursor-pointer"
                  onClick={() => navigate(`/product-owner/${product.author_id}`)}
                >
                  <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                    <div className="relative">
                      <Avatar className="h-16 w-16 ring-4 ring-white/30 dark:ring-gray-700/30">
                        {product.author_profile ? (
                          <img
                            src={product.author_profile}
                            alt={product.author_name}
                            className="object-cover w-full h-full"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-bold">
                            {product.author_name?.charAt(0) || 'A'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.author_name || 'Anonymous Creator'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Full Profile
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
                  onClick={() => navigate(`/product-owner/${product.author_id}`)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Connect & Collaborate
                </Button>
              </CardContent>
            </Card>

            {/* Product Stats - Redesigned */}
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-800 dark:to-gray-900">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Product Analytics
                </CardTitle>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20">
                    <div className="flex items-center justify-between mb-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">TOTAL</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {productUpvotes}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Upvotes
                    </div>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20">
                    <div className="flex items-center justify-between mb-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">SINCE</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {new Date(product.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(product.createdAt).getFullYear()}
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Performance</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < 3 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Products */}
            {/* <Card>
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
            </Card> */}

            {/* Report */}
            {/* <Card>
              <CardContent className="p-4">
                <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Flag className="w-4 h-4 mr-2" />
                  Report Product
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Report Dialog */}
          <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Comment</DialogTitle>
                <DialogDescription>
                  Help us keep the community safe by reporting inappropriate content.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for Report</label>
                  <Select value={reportReason} onValueChange={setReportReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="harassment">Harassment</SelectItem>
                      <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                      <SelectItem value="hate_speech">Hate Speech</SelectItem>
                      <SelectItem value="violence">Violence</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Details (Optional)</label>
                  <Textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Please provide any additional context..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleReportComment}
                    disabled={!reportReason}
                  >
                    Submit Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  </div>
  );
};