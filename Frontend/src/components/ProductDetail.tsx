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
    const response = await fetch(`${url}/api/moderation/report`, {
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

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
    </div>
  );
  if (error) return <div className="min-h-screen bg-black text-zinc-400 flex items-center justify-center">Error: {error}</div>;
  if (!product) return <div className="min-h-screen bg-black text-zinc-400 flex items-center justify-center">Product not found</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* PH-style product header bar */}
      <div className="border-b border-zinc-900 bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Discovery
          </button>

          {/* Product identity row */}
          <div className="flex items-start gap-5">
            {/* Product logo / thumbnail */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
              {product.media?.[0] ? (
                <ImageWithFallback
                  src={product.media[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-zinc-600" />
                </div>
              )}
            </div>

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-white leading-tight">{product.title}</h1>
                {product.fresh && (
                  <span className="text-xs font-semibold bg-zinc-800 border border-zinc-700 text-zinc-300 px-2.5 py-1 rounded-full">
                    Launching today
                  </span>
                )}
                {product.trending && (
                  <span className="text-xs font-semibold bg-zinc-800 border border-zinc-700 text-zinc-300 px-2.5 py-1 flex items-center gap-1 rounded-full">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </span>
                )}
              </div>
              {/* Category tags row (PH style: Productivity · Unified API · LLM Memory) */}
              <div className="flex items-center gap-2 text-sm text-zinc-500 flex-wrap">
                {product.category && <span>{product.category}</span>}
                {product.autoTags?.slice(0, 3).map((tag, i) => (
                  <React.Fragment key={tag}>
                    <span className="text-zinc-700">·</span>
                    <span>{tag}</span>
                  </React.Fragment>
                ))}
              </div>
              {product.pitch && (
                <p className="text-sm text-zinc-400 mt-2 max-w-2xl line-clamp-2">{product.pitch}</p>
              )}
            </div>

            {/* Visit website button */}
            {product.demoUrl && (
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-2 border border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-white/40 px-4 py-2 rounded-xl transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Visit website
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media + Content card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-6">
                {/* Media Carousel */}
                <div className="relative w-full h-80 bg-zinc-800 rounded-xl overflow-hidden mb-4 group">
                  {product.media && product.media.length > 0 ? (
                    <>
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
                            className="w-full h-full object-contain bg-zinc-900"
                          />
                        )}
                      </div>

                      {product.media.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentMediaIndex(prev =>
                              prev === 0 ? product.media.length - 1 : prev - 1
                            )}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setCurrentMediaIndex(prev =>
                              prev === product.media.length - 1 ? 0 : prev + 1
                            )}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 px-3 py-1.5 rounded-full">
                            {product.media.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentMediaIndex(index)}
                                className={`h-1.5 rounded-full transition-all ${index === currentMediaIndex ? 'bg-white w-6' : 'bg-white/40 w-1.5 hover:bg-white/70'}`}
                              />
                            ))}
                          </div>
                          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                            {currentMediaIndex + 1} / {product.media.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Eye className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                        <p className="text-zinc-600 text-sm">No media available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {product.media && product.media.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                    {product.media.map((mediaUrl, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentMediaIndex(index)}
                        className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          index === currentMediaIndex ? 'border-white' : 'border-zinc-700 hover:border-zinc-500'
                        }`}
                      >
                        {mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm') || mediaUrl.endsWith('.mov') ? (
                          <div className="relative w-full h-full bg-zinc-800">
                            <video src={mediaUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <ImageWithFallback src={mediaUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">About</h3>
                  <p className="text-zinc-300 leading-relaxed">{product.description}</p>
                </div>

                {/* Tags */}
                {product.autoTags?.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-1.5">
                      {product.autoTags.map(tag => (
                        <span key={tag} className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 px-2.5 py-1 rounded-full hover:border-zinc-600 transition-colors">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-800">
                  <button
                    onClick={handleUpvote}
                    className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors ${
                      isUpvoted
                        ? 'bg-white text-black border-white'
                        : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-white/30'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-current' : ''}`} />
                    {isUpvoted ? 'Upvoted' : 'Upvote'}
                  </button>

                  <WishlistButton productId={product._id} size="md" />

                  <button onClick={handleShare}
                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-white/30 transition-colors">
                    <Share2 className="w-3.5 h-3.5" />Share
                  </button>

                  {product.demoUrl && (
                    <a href={product.demoUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />Try Demo
                    </a>
                  )}
                  {product.githubUrl && (
                    <a href={product.githubUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-white/30 transition-colors">
                      <Github className="w-3.5 h-3.5" />View Code
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="border-b border-zinc-800 px-6 py-4 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-semibold">Community Feedback ({productComments.length})</span>
              </div>
              <div className="p-6">
                <Tabs defaultValue="reviews" className="w-full">
                  <TabsList className="flex gap-1 bg-zinc-800 border border-zinc-700 rounded-xl p-1 mb-6 w-fit">
                    <TabsTrigger value="reviews" className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-semibold transition-all">
                      <Eye className="w-3.5 h-3.5" />All Reviews
                    </TabsTrigger>
                    <TabsTrigger value="write" className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-semibold transition-all">
                      <Send className="w-3.5 h-3.5" />Write Review
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="reviews">
                    <div className="space-y-4">
                      {productComments.length === 0 ? (
                        <div className="border border-dashed border-zinc-800 rounded-xl py-12 text-center">
                          <MessageCircle className="w-8 h-8 mx-auto text-zinc-700 mb-3" />
                          <p className="text-zinc-500 text-sm">No reviews yet.</p>
                          <p className="text-xs text-zinc-700 mt-1">Be the first to share your thoughts!</p>
                        </div>
                      ) : (
                        productComments.map(review => (
                          <div key={review._id.$oid} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage src={review.profilePicture} />
                                <AvatarFallback className="bg-zinc-800 text-white text-sm">
                                  {review.username?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold text-sm text-white">{review.username || 'Anonymous User'}</h4>
                                    <p className="text-xs text-zinc-600 mt-0.5">Verified Reviewer</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-2xl">{review.emoji}</div>
                                    <div className="flex flex-col items-end">
                                      <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-white fill-current' : 'text-zinc-700'}`} />
                                        ))}
                                      </div>
                                      <span className="text-xs text-zinc-600 mt-0.5">{review.rating}/5</span>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm text-zinc-300 leading-relaxed mb-3">{review.comment}</p>
                                <div className="flex items-center justify-between text-xs text-zinc-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(review.createdAt.$date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                  </div>
                                  <button
                                    onClick={() => { setSelectedComment(review); setShowReportDialog(true); }}
                                    className="flex items-center gap-1 text-zinc-700 hover:text-white transition-colors"
                                  >
                                    <Flag className="w-3 h-3" />Report
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="write">
                    {currentUser ? (
                      <div className="space-y-5">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                            Choose your emoji tag
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {emojiOptions.map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => setSelectedEmoji(emoji)}
                                className={`text-xl p-2 rounded-lg border transition-all ${
                                  selectedEmoji === emoji
                                    ? 'bg-white border-white scale-110'
                                    : 'border-zinc-700 hover:border-zinc-500'
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Rating</label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map(starValue => (
                              <button key={starValue} type="button"
                                onClick={() => setRating(starValue)}
                                onMouseEnter={() => setHoverRating(starValue)}
                                onMouseLeave={() => setHoverRating(null)}
                                className="focus:outline-none hover:scale-110 transition-transform"
                              >
                                <Star className={`w-7 h-7 ${(hoverRating ?? rating) >= starValue ? 'text-white fill-current' : 'text-zinc-700'}`} />
                              </button>
                            ))}
                            {rating > 0 && <span className="ml-2 text-xs text-zinc-500">{rating}/5</span>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Your review</label>
                          <Textarea
                            placeholder="Share your thoughts about this product..."
                            value={reviewText}
                            onChange={e => setReviewText(e.target.value)}
                            className="min-h-[100px] bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 resize-none focus:border-white/30"
                          />
                          <div className="flex justify-between mt-2 text-xs text-zinc-600">
                            <span>{reviewText.length}/280 characters</span>
                            <span>Be specific and helpful</span>
                          </div>
                        </div>

                        <ContentChecker content={reviewText} contentType="comment" onWarning={w => setContentWarning(w)} />
                        {contentWarning && <ContentWarning warning={contentWarning} variant="inline" showDismiss={false} />}

                        <button
                          onClick={handleSubmitReview}
                          disabled={!reviewText.trim() || !selectedEmoji || isSubmitting || isChecking}
                          className="w-full bg-white text-black text-sm font-semibold py-2.5 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5 inline mr-2" />
                          {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </div>
                    ) : (
                      <div className="border border-dashed border-zinc-800 rounded-xl py-12 text-center">
                        <Users className="w-8 h-8 mx-auto text-zinc-700 mb-3" />
                        <p className="text-zinc-500 text-sm mb-4">Sign in to write a review</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Creator Profile */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="border-b border-zinc-800 px-5 py-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Creator Profile</span>
              </div>
              <div className="p-5">
                <div
                  className="group flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all mb-4"
                  onClick={() => navigate(`/product-owner/${product.author_id}`)}
                >
                  <Avatar className="h-12 w-12 shrink-0">
                    {product.author_profile ? (
                      <img src={product.author_profile} alt={product.author_name}
                        className="object-cover w-full h-full" referrerPolicy="no-referrer" loading="lazy" />
                    ) : (
                      <AvatarFallback className="bg-zinc-800 text-white text-lg font-bold">
                        {product.author_name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-white group-hover:text-zinc-300 transition-colors truncate">
                      {product.author_name || 'Anonymous Creator'}
                    </h4>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                      <ExternalLink className="w-3 h-3" />View Full Profile
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                </div>
                <button
                  onClick={() => navigate(`/product-owner/${product.author_id}`)}
                  className="w-full text-sm border border-zinc-700 text-zinc-400 hover:text-white hover:border-white/30 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Users className="w-3.5 h-3.5" />Connect & Collaborate
                </button>
              </div>
            </div>

            {/* Product Analytics */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="border-b border-zinc-800 px-5 py-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Analytics</span>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <Heart className="w-4 h-4 text-zinc-400" />
                      <span className="text-[10px] text-zinc-600 font-medium uppercase">Total</span>
                    </div>
                    <div className="text-2xl font-bold">{productUpvotes}</div>
                    <div className="text-xs text-zinc-500">Upvotes</div>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      <span className="text-[10px] text-zinc-600 font-medium uppercase">Since</span>
                    </div>
                    <div className="text-lg font-bold">
                      {new Date(product.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </div>
                    <div className="text-xs text-zinc-500">{new Date(product.createdAt).getFullYear()}</div>
                  </div>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <TrendingUp className="w-3.5 h-3.5" />Performance
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < 3 ? 'text-white fill-current' : 'text-zinc-700'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="bg-zinc-900 border border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Report Comment</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Help us keep the community safe by reporting inappropriate content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Reason for Report</label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
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
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Additional Details (Optional)</label>
              <Textarea
                value={reportDescription}
                onChange={e => setReportDescription(e.target.value)}
                placeholder="Please provide any additional context..."
                className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-600 min-h-[80px] resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button className="text-xs border border-zinc-700 text-zinc-400 hover:text-white px-4 py-2 rounded-lg transition-colors"
                onClick={() => setShowReportDialog(false)}>Cancel</button>
              <button className="text-xs bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
                onClick={handleReportComment} disabled={!reportReason}>Submit Report</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};