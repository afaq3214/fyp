import React, { useState, useEffect } from 'react';
import { Heart, Edit2, Share2, Trash2, Plus, X, Save, Eye, EyeOff, Search, Filter, Grid3X3, List, Download, Check, ChevronDown } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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

  const url = import.meta.env.VITE_API_URL || 'https://fyp-1ejm.vercel.app';

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${url}/api/wishlist`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
        setEditName(data.name);
        setEditDescription(data.description);
        setEditIsPublic(data.isPublic);
      }
    } catch (error) {
      toast.error('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${url}/api/wishlist/remove/${productId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setWishlist(await response.json());
        toast.success('Item removed from wishlist');
      }
    } catch { toast.error('Failed to remove item'); }
  };

  const updateWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${url}/api/wishlist/update`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, description: editDescription, isPublic: editIsPublic }),
      });
      if (response.ok) {
        setWishlist(await response.json());
        setIsEditing(false);
        toast.success('Wishlist updated');
      }
    } catch { toast.error('Failed to update wishlist'); }
  };

  const updateItemNotes = async (productId: string, notes: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${url}/api/wishlist/item/${productId}/notes`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (response.ok) {
        setWishlist(await response.json());
        setEditingNotes(prev => ({ ...prev, [productId]: '' }));
        toast.success('Notes updated');
      }
    } catch { toast.error('Failed to update notes'); }
  };

  const shareWishlist = () => {
    if (wishlist?.isPublic) {
      navigator.clipboard.writeText(`${window.location.origin}/wishlist/public/${wishlist.userId}`);
      toast.success('Wishlist link copied!');
    } else {
      toast.error('Make your wishlist public first');
    }
  };

  const exportWishlist = () => {
    if (!wishlist) return;
    const data = wishlist.items.map(item => ({
      title: item.productId.title, description: item.productId.description,
      category: item.productId.category, notes: item.notes, addedAt: item.addedAt,
    }));
    const uri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', `wishlist-${wishlist.name.replace(/\s+/g, '-')}.json`);
    link.click();
    toast.success('Wishlist exported');
  };

  const getFilteredAndSortedItems = () => {
    if (!wishlist) return [];
    let items = wishlist.items;
    if (searchQuery) items = items.filter(i =>
      i.productId.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.productId.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.productId.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (filterCategory !== 'all') items = items.filter(i => i.productId.category === filterCategory);
    return [...items].sort((a, b) => {
      if (sortBy === 'dateAdded') return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      if (sortBy === 'name') return a.productId.title.localeCompare(b.productId.title);
      if (sortBy === 'category') return a.productId.category.localeCompare(b.productId.category);
      if (sortBy === 'upvotes') return (b.productId.upvotes?.length || 0) - (a.productId.upvotes?.length || 0);
      return 0;
    });
  };

  const getCategories = () => {
    if (!wishlist) return [];
    return [...new Set(wishlist.items.filter(i => i.productId?.category).map(i => i.productId.category))];
  };

  const toggleItemSelection = (id: string) =>
    setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const bulkRemoveItems = async () => {
    if (!selectedItems.length) return;
    const token = localStorage.getItem('token');
    await Promise.all(selectedItems.map(id =>
      fetch(`${url}/api/wishlist/remove/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    ));
    await fetchWishlist();
    setSelectedItems([]);
    toast.success(`${selectedItems.length} items removed`);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!wishlist) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <Heart className="w-12 h-12 text-zinc-700" />
      <h2 className="text-xl font-semibold">No Wishlist Yet</h2>
      <p className="text-zinc-500 text-sm">Start adding products you love!</p>
      <button onClick={() => navigate('/')}
        className="bg-white text-black text-sm font-semibold px-5 py-2 rounded-lg hover:bg-zinc-200 transition-colors">
        <Plus className="w-4 h-4 inline mr-1.5" />Discover Products
      </button>
    </div>
  );

  const filtered = getFilteredAndSortedItems();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-900 bg-zinc-950 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-white" />
              {isEditing ? (
                <Input value={editName} onChange={e => setEditName(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white h-8 text-xl font-bold w-48" />
              ) : (
                <h1 className="text-2xl font-bold tracking-tight">{wishlist.name}</h1>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button onClick={updateWishlist}
                    className="flex items-center gap-1.5 text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors">
                    <Save className="w-3.5 h-3.5" />Save
                  </button>
                  <button onClick={() => setIsEditing(false)}
                    className="text-xs border border-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />Edit
                  </button>
                  <button onClick={shareWishlist}
                    className="flex items-center gap-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                    <Share2 className="w-3.5 h-3.5" />Share
                  </button>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3 mt-4">
              <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)}
                placeholder="Describe your wishlist..." rows={2}
                className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-600 resize-none text-sm" />
              <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={editIsPublic} onChange={e => setEditIsPublic(e.target.checked)}
                  className="rounded border-zinc-600 bg-zinc-800 text-white" />
                {editIsPublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                Make wishlist public
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
              {wishlist.description && <span>{wishlist.description}</span>}
              <span>{wishlist.items.length} items</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                {wishlist.isPublic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {wishlist.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input placeholder="Search by name, description, or tags..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-white/30" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-600" />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-36 h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-300">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="all">All Categories</SelectItem>
                  {getCategories().map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-36 h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-300">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="dateAdded">Date Added</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="upvotes">Most Upvoted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
              <button onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button onClick={exportWishlist}
                className="flex items-center gap-1.5 text-xs border border-zinc-800 text-zinc-500 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                <Download className="w-3.5 h-3.5" />Export
              </button>
              <button onClick={() => { setShowBulkActions(!showBulkActions); setSelectedItems([]); }}
                className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-lg transition-colors ${showBulkActions ? 'border-white text-white' : 'border-zinc-800 text-zinc-500 hover:text-white'}`}>
                <Check className="w-3.5 h-3.5" />Bulk Select
              </button>
            </div>
          </div>

          {showBulkActions && (
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedItems(filtered.map(i => i._id))}
                  className="text-xs border border-zinc-700 text-zinc-400 hover:text-white px-3 py-1 rounded-lg transition-colors">
                  Select All
                </button>
                <button onClick={() => setSelectedItems([])}
                  className="text-xs border border-zinc-700 text-zinc-400 hover:text-white px-3 py-1 rounded-lg transition-colors">
                  Clear
                </button>
                <span className="text-xs text-zinc-600">{selectedItems.length} selected</span>
              </div>
              {selectedItems.length > 0 && (
                <button onClick={bulkRemoveItems}
                  className="flex items-center gap-1.5 text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />Remove Selected
                </button>
              )}
            </div>
          )}

          <p className="text-xs text-zinc-600">
            {filtered.length} of {wishlist.items.length} items
            {searchQuery && ` matching "${searchQuery}"`}
            {filterCategory !== 'all' && ` in ${filterCategory}`}
          </p>
        </div>

        {/* Items */}
        {filtered.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-xl p-16 text-center">
            <Heart className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
            <p className="text-zinc-500 text-sm font-medium">
              {searchQuery || filterCategory !== 'all' ? 'No items found' : 'Your wishlist is empty'}
            </p>
            <p className="text-zinc-700 text-xs mt-1">
              {searchQuery || filterCategory !== 'all' ? 'Try adjusting your filters' : 'Start adding products you love!'}
            </p>
            {!(searchQuery || filterCategory !== 'all') && (
              <button onClick={() => navigate('/')}
                className="mt-5 bg-white text-black text-xs font-semibold px-5 py-2 rounded-lg hover:bg-zinc-200 transition-colors">
                <Plus className="w-3.5 h-3.5 inline mr-1.5" />Discover Products
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(item => (
              <div key={item._id}
                className={`group bg-zinc-900 border rounded-xl overflow-hidden transition-all ${selectedItems.includes(item._id) ? 'border-white' : 'border-zinc-800 hover:border-zinc-700'}`}>
                <div className="relative h-44 bg-zinc-800 overflow-hidden">
                  {showBulkActions && (
                    <div className="absolute top-2 left-2 z-10">
                      <input type="checkbox" checked={selectedItems.includes(item._id)}
                        onChange={() => toggleItemSelection(item._id)}
                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-800" />
                    </div>
                  )}
                  <ImageWithFallback src={item.productId?.media?.[0] || ''} alt={item.productId?.title || ''}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <button
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-zinc-900/80 text-white rounded-lg transition-all hover:bg-zinc-900"
                    onClick={() => item.productId?._id && removeFromWishlist(item.productId._id)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1 cursor-pointer hover:text-zinc-300 transition-colors"
                    onClick={() => item.productId?._id && navigate(`/product/${item.productId._id}`)}>
                    {item.productId?.title || 'Untitled Product'}
                  </h3>
                  <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{item.productId?.description}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-[10px] border border-zinc-700 text-zinc-500 px-2 py-0.5 rounded-full">
                      {item.productId?.category || 'Uncategorized'}
                    </span>
                  </div>

                  {item.productId?._id && editingNotes[item.productId._id] !== undefined ? (
                    <div className="space-y-2">
                      <Textarea rows={2} value={editingNotes[item.productId._id] || ''}
                        onChange={e => item.productId?._id && setEditingNotes(prev => ({ ...prev, [item.productId._id]: e.target.value }))}
                        placeholder="Add notes..." className="text-xs bg-zinc-800 border-zinc-700 text-white resize-none" />
                      <div className="flex gap-2">
                        <button className="text-xs bg-white text-black px-3 py-1 rounded-lg"
                          onClick={() => item.productId?._id && updateItemNotes(item.productId._id, editingNotes[item.productId._id] || '')}>Save</button>
                        <button className="text-xs border border-zinc-700 text-zinc-400 px-3 py-1 rounded-lg"
                          onClick={() => setEditingNotes(prev => { const n = {...prev}; if (item.productId?._id) delete n[item.productId._id]; return n; })}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {item.notes ? (
                        <p className="text-xs text-zinc-500 bg-zinc-800 p-2 rounded-lg">{item.notes}</p>
                      ) : (
                        <button className="text-xs text-zinc-600 hover:text-white flex items-center gap-1 transition-colors"
                          onClick={() => item.productId?._id && setEditingNotes(prev => ({ ...prev, [item.productId._id]: item.notes || '' }))}>
                          <Plus className="w-3 h-3" />Add notes
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 text-[10px] text-zinc-600">
                    <span>♥ {item.productId?.upvotes?.length || 0}</span>
                    <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <div key={item._id}
                className={`group bg-zinc-900 border rounded-xl p-4 flex items-start gap-4 transition-all ${selectedItems.includes(item._id) ? 'border-white' : 'border-zinc-800 hover:border-zinc-700'}`}>
                {showBulkActions && (
                  <input type="checkbox" checked={selectedItems.includes(item._id)}
                    onChange={() => toggleItemSelection(item._id)}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 mt-1 shrink-0" />
                )}
                {item.productId?.media?.[0] && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    <ImageWithFallback src={item.productId.media[0]} alt={item.productId.title}
                      className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-0.5 cursor-pointer hover:text-zinc-300 transition-colors"
                    onClick={() => item.productId?._id && navigate(`/product/${item.productId._id}`)}>
                    {item.productId?.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="border border-zinc-700 px-2 py-0.5 rounded-full">{item.productId?.category || 'Uncategorized'}</span>
                    <span>♥ {item.productId?.upvotes?.length || 0}</span>
                    <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button className="shrink-0 text-zinc-700 hover:text-white transition-colors"
                  onClick={() => item.productId?._id && removeFromWishlist(item.productId._id)}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
