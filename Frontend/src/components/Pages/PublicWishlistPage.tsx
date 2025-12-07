import React, { useState, useEffect } from 'react';
import { Heart, Eye, Calendar, User, ArrowLeft, Share2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface Product {
  _id: string;
  title: string;
  description: string;
  media: string[];
  upvotes: string[];
  category: string;
  tags: string[];
  createdAt: string;
}

interface WishlistItem {
  _id: string;
  productId: Product;
  addedAt: string;
  notes: string;
}

interface PublicWishlist {
  _id: string;
  userId: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  name: string;
  description: string;
  isPublic: boolean;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export function PublicWishlistPage() {
  const [wishlist, setWishlist] = useState<PublicWishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";

  useEffect(() => {
    if (userId) {
      fetchPublicWishlist();
    }
  }, [userId]);

  const fetchPublicWishlist = async () => {
    try {
      const response = await fetch(`${url}/api/wishlist/public/${userId}`);
      
      if (response.status === 404) {
        setError('Public wishlist not found or not available');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }

      const data = await response.json();
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching public wishlist:', error);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const shareWishlist = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Wishlist link copied to clipboard!');
  };

  const viewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (error || !wishlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Wishlist Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'This wishlist is not public or does not exist.'}
          </p>
          <Button onClick={() => navigate('/')} className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discover
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={shareWishlist} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wishlist Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center mb-2">
                <Eye className="w-5 h-5 text-blue-600 mr-2" />
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Public Wishlist
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{wishlist.name}</h1>
              <p className="text-gray-600 text-lg">{wishlist.description}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center">
              <Avatar className="w-10 h-10 mr-3">
                <AvatarImage src={wishlist.userId.profilePicture} />
                <AvatarFallback>
                  {wishlist.userId.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">{wishlist.userId.name}</p>
                <p className="text-sm text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Created {new Date(wishlist.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{wishlist.items.length}</p>
              <p className="text-sm text-gray-500">Items</p>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlist.items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No items yet</h3>
            <p className="text-gray-600">This wishlist is empty</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {wishlist.items.map((item) => (
              <Card key={item._id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="relative">
                    <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                         onClick={() => viewProduct(item.productId._id)}>
                      <ImageWithFallback
                        src={item.productId.media?.[0] || ''}
                        alt={item.productId.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs font-medium">
                      <Heart className="w-3 h-3 inline mr-1 text-red-500" />
                      {item.productId.upvotes?.length || 0}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 
                        className="font-semibold cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => viewProduct(item.productId._id)}
                      >
                        {item.productId.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.productId.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.productId.category}
                      </Badge>
                      {item.productId.tags?.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {item.notes && (
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-sm text-gray-600 italic">
                          "{item.notes}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        <Heart className="w-3 h-3 inline mr-1" />
                        {item.productId.upvotes?.length || 0} upvotes
                      </span>
                      <span>
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => viewProduct(item.productId._id)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Product
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
