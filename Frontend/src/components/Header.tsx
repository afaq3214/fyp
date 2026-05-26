import React, { useState, useEffect, useRef, useContext } from 'react';
import { Search, Zap, User, Menu, X, Plus, Bell, Heart, Trash2, DollarSign, Sparkles, Network } from 'lucide-react';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User as UserType } from '../App';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '@/context/UserContext';

interface HeaderProps {
  currentUser: UserType | null;
  onProfileClick: () => void;
  onSubmitProduct: () => void;
  onHomeClick: () => void;
  onAuthClick: () => void;
  onLogout: () => void;
  onAdminClick: () => void;
}

export function Header({ 
  currentUser, 
  onProfileClick, 
  onSubmitProduct, 
  onHomeClick,
  onAuthClick,
  onLogout,
  onAdminClick 
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const userContext = useContext(UserContext);
  const [notifications, setNotifications] = useState(userContext?.notification || []);
  const navigate = useNavigate();

  // Update local state when context updates
  useEffect(() => {
    if (userContext?.notification) {
      setNotifications(userContext.notification);
    }
  }, [userContext?.notification]);

  const deleteNotification = async (notificationId: string) => {
    if (!notificationId) return;
    
    setIsDeleting(notificationId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notification/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        // Remove the notification from local state
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        // Update the context if needed
        if (userContext?.refreshNotifications) {
          userContext.refreshNotifications();
        }
      } else {
        console.error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch wishlist count
  useEffect(() => {
    if (currentUser) {
      fetchWishlistCount();
    }
  }, [currentUser]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    setIsSearching(true);
    try {
      const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";
      const response = await fetch(`${url}/api/products/search?q=${encodeURIComponent(query)}&limit=10`);
      
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        setIsSearchOpen(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const fetchWishlistCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";
      const response = await fetch(`${url}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistCount(data.items?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
    }
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-zinc-950 border-b border-zinc-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <button onClick={onHomeClick} className="flex items-center space-x-2 group focus:outline-none">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
                <Zap className="w-4 h-4 text-black" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">PRS</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <Input
                placeholder="Search products, makers..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
                onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
                className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-white/30 h-9 text-sm"
              />
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]); setIsSearchOpen(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {isSearchOpen && (
                <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center">
                      <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs text-zinc-500">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-1">
                      {searchResults.map((product: any) => (
                        <div key={product._id}
                          onMouseDown={e => { e.stopPropagation(); e.preventDefault(); handleProductClick(product._id); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 cursor-pointer border-b border-zinc-900 last:border-b-0 transition-colors"
                          style={{ pointerEvents: 'auto', userSelect: 'none' }}
                        >
                          {product.media?.[0] && (
                            <img src={product.media[0]} alt={product.title} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">{product.title}</h4>
                            <p className="text-xs text-zinc-500 truncate">{product.category} · {product.upvotesCount || 0} upvotes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-xs text-zinc-600">No products found</p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Module Nav Links */}
            <nav className="flex items-center space-x-1">
              <Link
                to="/investor-connect"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                <span>Investors</span>
              </Link>
              <Link
                to="/problem-discovery"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Discover</span>
              </Link>
              <Link
                to="/community"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <Network className="w-4 h-4" />
                <span>Community</span>
              </Link>
            </nav>

            <button
              onClick={onSubmitProduct}
              className="flex items-center bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Submit
            </button>
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="relative" ref={notificationRef}>
                  <button
                    className="relative p-2 text-zinc-400 hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/notifications');
                      userContext?.refreshNotifications();
                    }}
                  >
                    <Bell className="w-4 h-4" />
                    {Array.isArray(notifications) && notifications.filter(n => !n.viewed).length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                        {notifications.filter(n => !n.viewed).length}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 top-10 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-zinc-800">
                        <h3 className="font-semibold text-sm text-white">Notifications</h3>
                      </div>
                      {!Array.isArray(notifications) || notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <Bell className="w-7 h-7 mx-auto mb-2 text-zinc-600" />
                          <p className="text-sm text-zinc-500">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 border-b border-zinc-800 last:border-b-0 transition-colors ${
                              !notification.viewed ? 'bg-zinc-800/60' : 'hover:bg-zinc-800/30'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-start gap-2 flex-1">
                                {!notification.viewed && <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />}
                                <span className="text-sm text-zinc-300">{notification.description}</span>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteNotification(notification._id); }}
                                disabled={isDeleting === notification._id}
                                className="text-zinc-600 hover:text-white p-1 shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-xs text-zinc-600 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <button
                  className="relative p-2 text-zinc-400 hover:text-white transition-colors"
                  onClick={() => navigate('/wishlist')}
                >
                  <Heart className="w-4 h-4" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </button>
                <div className="relative" ref={userMenuRef}>
                  <button
                    className="rounded-full focus:outline-none"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    style={{ height: '40px', width: '40px' }}
                  >
                    <Avatar style={{ height: '40px', width: '40px' }}>
                      <AvatarImage
                        src={currentUser.profilePicture}
                        alt={currentUser.name}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <AvatarFallback className="bg-zinc-700 text-white text-sm">{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-14 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="flex flex-col px-4 py-3 border-b border-zinc-800">
                        <p className="font-semibold text-sm text-white">{currentUser.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{currentUser.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => { onProfileClick(); setIsUserMenuOpen(false); }}
                          className="flex items-center w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </button>
                        <Link
                          to="/quests"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                          Challenge Quests
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                          <Heart className="mr-2 h-4 w-4" />
                          Wishlist
                        </Link>
                        {currentUser?.isAdmin && (
                          <>
                            <div className="border-t border-zinc-800 my-1" />
                            <button
                              onClick={() => { onAdminClick(); setIsUserMenuOpen(false); }}
                              className="flex items-center w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                            >
                              <span className="mr-2">👑</span>
                              Admin Panel
                            </button>
                          </>
                        )}
                        <div className="border-t border-zinc-800 my-1" />
                        <button
                          onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                          className="flex items-center w-full px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="text-sm font-semibold border border-zinc-700 text-zinc-300 hover:text-white hover:border-white/40 px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              className="p-2 text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
              onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
              className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-white/30 h-9 text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSearchResults([]); setIsSearchOpen(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {isSearchOpen && (
              <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center">
                    <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-zinc-500">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-1">
                    {searchResults.map((product: any) => (
                      <button
                        key={product._id}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleProductClick(product._id); }}
                        className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-900 last:border-b-0 flex items-center gap-3"
                      >
                        {product.media?.[0] && (
                          <img src={product.media[0]} alt={product.title} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{product.title}</h4>
                          <p className="text-xs text-zinc-500 truncate">{product.upvotesCount || 0} upvotes</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-xs text-zinc-600">No products found</p>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-zinc-900 py-4">
            <div className="flex flex-col space-y-1">
              <Link to="/investor-connect" onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
                <DollarSign className="w-4 h-4" />Investor Connect
              </Link>
              <Link to="/problem-discovery" onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
                <Sparkles className="w-4 h-4" />AI Discovery
              </Link>
              <Link to="/community" onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
                <Network className="w-4 h-4" />Community
              </Link>
              <div className="pt-2">
                <button
                  onClick={onSubmitProduct}
                  className="w-full flex items-center justify-center bg-white text-black text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Submit Product
                </button>
              </div>
              {currentUser ? (
                <>
                  <div className="border-t border-zinc-900 my-1" />
                  <button onClick={() => { onProfileClick(); setIsMenuOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors w-full text-left">
                    <User className="w-4 h-4" />Profile
                  </button>
                  <button onClick={() => { navigate('/notifications'); setIsMenuOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors w-full text-left">
                    <Bell className="w-4 h-4" />Notifications
                  </button>
                  <Link to="/quests" onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
                    Challenge Quests
                  </Link>
                  {currentUser?.isAdmin && (
                    <button onClick={() => { onAdminClick(); setIsMenuOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors w-full text-left">
                      <span>👑</span>Admin Panel
                    </button>
                  )}
                  <button onClick={() => { onLogout(); setIsMenuOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors w-full text-left">
                    Logout
                  </button>
                </>
              ) : (
                <div className="pt-2">
                  <button onClick={onAuthClick}
                    className="w-full border border-zinc-700 text-zinc-300 hover:text-white hover:border-white/40 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}