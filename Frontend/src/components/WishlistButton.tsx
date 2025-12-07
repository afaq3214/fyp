import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function WishlistButton({ productId, className, size = 'md' }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";

  useEffect(() => {
    checkWishlistStatus();
  }, [productId]);

  const checkWishlistStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${url}/api/wishlist/check/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsInWishlist(data.isInWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add to wishlist');
      return;
    }

    setLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`${url}/api/wishlist/remove/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsInWishlist(false);
          toast.success('Removed from wishlist');
        }
      } else {
        // Add to wishlist
        const response = await fetch(`${url}/api/wishlist/add`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId })
        });

        if (response.ok) {
          setIsInWishlist(true);
          toast.success('Added to wishlist');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <Button
      variant={isInWishlist ? "default" : "outline"}
      size="sm"
      onClick={toggleWishlist}
      disabled={loading}
      className={`${className} ${isInWishlist ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
    >
      <Heart 
        className={`${iconSizes[size]} ${isInWishlist ? 'fill-current' : ''}`} 
      />
      {size !== 'sm' && (
        <span className="ml-2">
          {isInWishlist ? 'Saved' : 'Save'}
        </span>
      )}
    </Button>
  );
}
