import React, { useState, useEffect, useRef } from 'react';
import { Search, Zap, User, Menu, X, Plus, Home, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import { User as UserType } from '../App';

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
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={onHomeClick}
              className="flex items-center space-x-2 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PRS
              </span>
            </button>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products, makers, or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              onClick={onSubmitProduct}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Submit Product
            </Button>

            {currentUser ? (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="relative"
                >
                  <Bell className="w-4 h-4" />
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
                    3
                  </Badge>
                </Button>

                <div className="relative" ref={userMenuRef}>
                  <Button 
                    variant="ghost" 
                    className="relative rounded-full"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} style={{ height: '50px', width: '50px' }}
                  >
                    <Avatar  style={{ height: '50px', width: '50px' }}>
                      <AvatarImage src={currentUser.profilePicture} alt={currentUser.name} />
                      
                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-10 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                      <div className="flex flex-col space-y-1 p-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-medium text-sm">{currentUser.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{currentUser.email}</p>
                      </div>
                      
                      <div className="py-1">
                        <button
                          onClick={() => { onProfileClick(); setIsUserMenuOpen(false); }}
                          className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </button>
                        
                        <button
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Zap className="mr-2 h-4 w-4" />
                          My Products
                        </button>
                        
                        {currentUser?.isAdmin && (
                          <>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                            <button
                              onClick={() => { onAdminClick(); setIsUserMenuOpen(false); }}
                              className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <span className="mr-2">👑</span>
                              Admin Panel
                            </button>
                          </>
                        )}
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                        <button
                          onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                          className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Button onClick={onAuthClick} variant="outline">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-0"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={onSubmitProduct}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit Product
              </Button>
              
              {currentUser ? (
                <>
                  <Button variant="ghost" onClick={onProfileClick} className="justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </Button>
                  {currentUser?.isAdmin && (
                    <Button variant="ghost" onClick={onAdminClick} className="justify-start">
                      <span className="mr-2">👑</span>
                      Admin Panel
                    </Button>
                  )}
                  <Button variant="ghost" onClick={onLogout} className="justify-start">
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={onAuthClick} variant="outline" className="w-full">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}