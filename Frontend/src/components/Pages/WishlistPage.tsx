import React, { useState, useEffect } from 'react';
import { Heart, Edit2, Share2, Trash2, Plus, X, Save, Eye, EyeOff, Search, Filter, Grid3X3, List, Download, Copy, Check, ChevronDown, Calendar, Tag, TrendingUp, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
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

interface Wishlist {
  _id: string;
  userId: string;
  name: string;
  description: string;
  isPublic: boolean;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export function WishlistPage() {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'dateAdded' | 'name' | 'category' | 'upvotes'>('dateAdded');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const navigate = useNavigate();

  const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${url}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
        setEditName(data.name);
        setEditDescription(data.description);
        setEditIsPublic(data.isPublic);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${url}/api/wishlist/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedWishlist = await response.json();
        setWishlist(updatedWishlist);
        toast.success('Item removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item');
    }
  };

  const updateWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${url}/api/wishlist/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          isPublic: editIsPublic
        })
      });

      if (response.ok) {
        const updatedWishlist = await response.json();
        setWishlist(updatedWishlist);
        setIsEditing(false);
        toast.success('Wishlist updated successfully');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const updateItemNotes = async (productId: string, notes: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${url}/api/wishlist/item/${productId}/notes`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        const updatedWishlist = await response.json();
        setWishlist(updatedWishlist);
        setEditingNotes(prev => ({ ...prev, [productId]: '' }));
        toast.success('Notes updated');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    }
  };

  const shareWishlist = () => {
    if (wishlist?.isPublic) {
      const shareUrl = `${window.location.origin}/wishlist/public/${wishlist.userId}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Wishlist link copied to clipboard!');
    } else {
      toast.error('Make your wishlist public first to share it');
    }
  };

  // Advanced filtering and sorting
  const getFilteredAndSortedItems = () => {
    if (!wishlist) return [];
    
    let filteredItems = wishlist.items;
    
    // Filter by search query
    if (searchQuery) {
      filteredItems = filteredItems.filter(item =>
        item.productId.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productId.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productId.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      filteredItems = filteredItems.filter(item => item.productId.category === filterCategory);
    }
    
    // Sort items
    const sortedItems = [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case 'dateAdded':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case 'name':
          return a.productId.title.localeCompare(b.productId.title);
        case 'category':
          return a.productId.category.localeCompare(b.productId.category);
        case 'upvotes':
          return (b.productId.upvotes?.length || 0) - (a.productId.upvotes?.length || 0);
        default:
          return 0;
      }
    });
    
    return sortedItems;
  };

  // Get unique categories from wishlist items
  const getCategories = () => {
    if (!wishlist) return [];
    const categories = [...new Set(wishlist.items
      .filter(item => item.productId && item.productId.category)
      .map(item => item.productId.category)
    )];
    return categories;
  };

  // Bulk selection handlers
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    const filteredItems = getFilteredAndSortedItems();
    setSelectedItems(filteredItems.map(item => item._id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  // Bulk actions
  const bulkRemoveItems = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        selectedItems.map(itemId => 
          fetch(`${url}/api/wishlist/remove/${itemId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          })
        )
      );
      
      await fetchWishlist();
      setSelectedItems([]);
      toast.success(`${selectedItems.length} items removed from wishlist`);
    } catch (error) {
      toast.error('Failed to remove items');
    }
  };

  const exportWishlist = () => {
    if (!wishlist) return;
    
    const exportData = wishlist.items.map(item => ({
      title: item.productId.title,
      description: item.productId.description,
      category: item.productId.category,
      tags: item.productId.tags,
      notes: item.notes,
      addedAt: item.addedAt,
      upvotes: item.productId.upvotes?.length || 0
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `wishlist-${wishlist.name.replace(/\s+/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Wishlist exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">No Wishlist Yet</h2>
          <p className="text-gray-600 mb-4">Start adding products you love!</p>
          <Button onClick={() => navigate('/')}>
            <Plus className="w-4 h-4 mr-2" />
            Discover Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with light blue background */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Wishlist</h1>
          <p className="text-gray-600">Manage and organize your favorite products</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Advanced Search and Filter Bar */}
        <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search products by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getCategories().map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <ChevronDown className="w-4 h-4 text-gray-600" />
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateAdded">Date Added</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="upvotes">Most Upvoted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3 py-1"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3 py-1"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Bulk Selection Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowBulkActions(!showBulkActions);
              clearSelection();
            }}
            className="ml-auto"
          >
            <Check className="w-4 h-4 mr-2" />
            Bulk Select
          </Button>
        </div>

        {/* Bulk Actions Toolbar */}
        {showBulkActions && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllItems}
              >
                <Check className="w-4 h-4 mr-2" />
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <span className="text-sm text-gray-600">
                {selectedItems.length} items selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedItems.length > 0 && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={bulkRemoveItems}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Selected
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={exportWishlist}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {getFilteredAndSortedItems().length} of {wishlist.items.length} items
            {searchQuery && ` matching "${searchQuery}"`}
            {filterCategory !== 'all' && ` in ${filterCategory}`}
          </span>
          {selectedItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
            >
              Clear selection ({selectedItems.length})
            </Button>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold">
              {isEditing ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-3xl font-bold border-2 border-blue-500"
                />
              ) : (
                wishlist.name
              )}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={updateWishlist}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={shareWishlist}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Describe your wishlist..."
              className="border-2 border-blue-500"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="public"
                checked={editIsPublic}
                onChange={(e) => setEditIsPublic(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="public" className="flex items-center">
                {editIsPublic ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                Make wishlist public
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {wishlist.description && (
              <p className="text-gray-600">{wishlist.description}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{wishlist.items.length} items</span>
              <span>•</span>
              <span className="flex items-center">
                {wishlist.isPublic ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                {wishlist.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Wishlist Items */}
      {getFilteredAndSortedItems().length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery || filterCategory !== 'all' ? 'No items found' : 'Your wishlist is empty'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start adding products you love!'
            }
          </p>
          <Button onClick={() => navigate('/')}>
            <Plus className="w-4 h-4 mr-2" />
            Discover Products
          </Button>
        </div>
      ) : (
        viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getFilteredAndSortedItems().map((item) => (
              <Card key={item._id} className={`group hover:shadow-lg transition-shadow ${selectedItems.includes(item._id) ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="relative">
                    {/* Bulk Selection Checkbox */}
                    {showBulkActions && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="bg-white/90 rounded-full p-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item._id)}
                            onChange={() => toggleItemSelection(item._id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                    <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={item.productId?.media?.[0] || ''}
                        alt={item.productId?.title || 'Product image'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => item.productId?._id && removeFromWishlist(item.productId._id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 
                      className="font-semibold cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => item.productId?._id && navigate(`/product/${item.productId._id}`)}
                    >
                      {item.productId?.title || 'Untitled Product'}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.productId?.description || 'No description available'}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {item.productId?.category || 'Uncategorized'}
                    </Badge>
                    {item.productId?.tags?.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {item.productId?._id && editingNotes[item.productId._id] !== undefined ? (
                      <div className="space-y-2">
                        <Textarea
                          value={item.productId?._id ? editingNotes[item.productId._id] : ''}
                          onChange={(e) => {
                            if (item.productId?._id) {
                              setEditingNotes(prev => ({
                                ...prev,
                                [item.productId._id]: e.target.value
                              }));
                            }
                          }}
                          placeholder="Add notes..."
                          className="text-sm"
                          rows={2}
                        />
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => item.productId?._id && updateItemNotes(item.productId._id, editingNotes[item.productId._id] || '')}
                          >
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingNotes(prev => ({ 
                              ...prev, 
                              [item.productId._id]: undefined 
                            }))}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {item.notes ? (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {item.notes}
                          </p>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => item.productId?._id && setEditingNotes(prev => ({ 
                              ...prev, 
                              [item.productId._id]: item.notes || '' 
                            }))}
                            className="text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add notes
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      ❤️ {item.productId?.upvotes?.length || 0} upvotes
                    </span>
                    <span>
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        ) : (
          <div className="space-y-4">
            {getFilteredAndSortedItems().map((item) => (
              <Card key={item._id} className={`group hover:shadow-md transition-shadow ${selectedItems.includes(item._id) ? 'ring-2 ring-blue-500' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Bulk Selection Checkbox */}
                    {showBulkActions && (
                      <div className="mt-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => toggleItemSelection(item._id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>
                    )}
                    
                    {item.productId ? (
                      <>
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <ImageWithFallback
                            src={item.productId.media?.[0] || ''}
                            alt={item.productId.title || 'Product image'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <Badge variant="outline">{item.productId?.category || 'Uncategorized'}</Badge>
                          <span className="text-gray-500">
                            ❤️ {item.productId.upvotes?.length || 0} upvotes
                          </span>
                          <span className="text-gray-500">
                            Added {new Date(item.addedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500">
                        Product not found or has been removed
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
    </div>
  );
}
