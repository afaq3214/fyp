import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Ban,
  Crown,
  BarChart3,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  Download,
  RefreshCw,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Clock,
  Star,
  MessageSquare,
  Activity
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import ModerationDashboard from './ModerationDashboard';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import type { User, Product } from '../App';

interface AdminPanelProps {
  onBack: () => void;
}

interface ProductStats {
  total: number;
  pending: number;
  today: number;
}

interface UserStats {
  total: number;
  active: number;
  banned: number;
  moderators: number;
  today: number;
}

interface AnalyticsData {
  dailyActiveUsers: number;
  productSubmissions: number;
  userReviews: number;
  communityUpvotes: number;
  weeklyGrowth: number;
  userRetention: number;
  contentQualityScore: number;
  communityHealth: string;
}

const mockStats = {
  totalUsers: 1247,
  totalProducts: 89,
  pendingReviews: 23,
  flaggedContent: 7,
  todaySignups: 34,
  todaySubmissions: 12,
  engagementRate: 73
};

const mockPendingProducts = [
  {
    id: '1',
    title: 'AI Code Generator',
    author: 'John Smith',
    category: 'Developer Tools',
    submittedAt: '2 hours ago',
    status: 'pending'
  },
  {
    id: '2',
    title: 'Smart Calendar',
    author: 'Sarah Johnson',
    category: 'Productivity',
    submittedAt: '5 hours ago',
    status: 'pending'
  },
  {
    id: '3',
    title: 'Design System Builder',
    author: 'Mike Chen',
    category: 'Design',
    submittedAt: '1 day ago',
    status: 'pending'
  }
];

export function AdminPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('7days');
  const [productStats, setProductStats] = useState<ProductStats>({
    total: 0,
    pending: 0,
    today: 0
  });
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    active: 0,
    banned: 0,
    moderators: 0,
    today: 0
  });
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    dailyActiveUsers: 0,
    productSubmissions: 0,
    userReviews: 0,
    communityUpvotes: 0,
    weeklyGrowth: 0,
    userRetention: 0,
    contentQualityScore: 0,
    communityHealth: 'Good'
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const [usersRes, productsRes] = await Promise.all([
        fetch(`${url}/api/auth/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${url}/api/products/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!usersRes.ok || !productsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [usersData, productsData] = await Promise.all([
        usersRes.json(),
        productsRes.json()
      ]);

      // Map API response to User interface format
      const mappedUsers = usersData.map((user: any) => ({
        ...user,
        id: user._id,
        profilePicture: user.profilePicture || '',
        bio: user.bio || '',
        badges: user.badges || [],
        projects: user.portfolio?.length || 0,
        products: user.portfolio?.length || 0,
        collaborations: user.portfolio?.length || 0,
        isAdmin: user.isAdmin || false,
        role: user.role || 'user',
        status: user.status || 'active',
        joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
        isPremium: user.isPremium || false
      }));

      setUsers(mappedUsers);
      setProducts(productsData);
      calculateStats(mappedUsers, productsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (usersData: User[], productsData: Product[]) => {
    const today = new Date().toDateString();
    
    const productStatsData: ProductStats = {
      total: productsData.length,
      pending: 0, 
      today: productsData.filter(p => new Date(p.createdAt).toDateString() === today).length
    };
    
    const userStatsData: UserStats = {
      total: usersData.length,
      active: usersData.length, // All users considered active
      banned: 0, // Remove status-based calculations
      moderators: usersData.filter(u => u.role === 'moderator' || u.isAdmin).length,
      today: usersData.filter(u => new Date(u.createdAt).toDateString() === today).length
    };
    
    const analyticsData: AnalyticsData = {
      dailyActiveUsers: Math.floor(usersData.length * 0.7),
      productSubmissions: productsData.length,
      userReviews: productsData.reduce((acc, p) => acc + (p.reviews || 0), 0),
      communityUpvotes: productsData.reduce((acc, p) => acc + (p.upvotes?.length || 0), 0),
      weeklyGrowth: 23,
      userRetention: 87,
      contentQualityScore: 9.2,
      communityHealth: 'Excellent'
    };
    
    setProductStats(productStatsData);
    setUserStats(userStatsData);
    setAnalytics(analyticsData);
  };

  const filterProducts = () => {
    let filtered = [...products];
    
    // Remove status filtering, only filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    if (searchQuery) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${url}/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('Product deleted successfully');
        setProducts(products.filter(p => p._id !== productId));
        setSelectedProducts(selectedProducts.filter(id => id !== productId));
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${url}/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('User deleted successfully');
        setUsers(users.filter(u => u.id !== userId));
        setFilteredUsers(filteredUsers.filter(u => u.id !== userId));
        setSelectedUsers(selectedUsers.filter(id => id !== userId));
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  const handleBulkProductDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error('No products selected');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const deletePromises = selectedProducts.map(productId => 
        fetch(`${url}/api/products/${productId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );
      
      const responses = await Promise.all(deletePromises);
      const allSuccessful = responses.every(res => res.ok);
      
      if (allSuccessful) {
        toast.success(`${selectedProducts.length} products deleted successfully`);
        setProducts(products.filter(p => !selectedProducts.includes(p._id)));
        setSelectedProducts([]);
      } else {
        toast.error('Some products failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting products');
    }
  };

  const handleBulkUserDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error('No users selected');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const deletePromises = selectedUsers.map(userId => 
        fetch(`${url}/api/auth/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );
      
      const responses = await Promise.all(deletePromises);
      const allSuccessful = responses.every(res => res.ok);
      
      if (allSuccessful) {
        toast.success(`${selectedUsers.length} users deleted successfully`);
        setUsers(users.filter(u => !selectedUsers.includes(u.id)));
        setFilteredUsers(filteredUsers.filter(u => !selectedUsers.includes(u.id)));
        setSelectedUsers([]);
      } else {
        toast.error('Some users failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting users');
    }
  };

  const exportData = (type: 'users' | 'products') => {
    const data = type === 'users' ? users : products;
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(item => Object.values(item).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-export.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`${type} data exported successfully`);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      Error: {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-900 bg-zinc-950 px-6 py-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handleBack} className="flex items-center gap-2 text-white hover:text-white text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
                <p className="text-zinc-500 text-sm">Manage your PeerRank community</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold border border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-full">
              <Crown className="w-3.5 h-3.5" />
              Administrator
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Users</p>
              <p className="text-2xl font-bold">{userStats.total}</p>
              <p className="text-xs text-zinc-500 mt-1">+{userStats.today} today</p>
            </div>
            <Users className="w-7 h-7 text-zinc-600" />
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Products</p>
              <p className="text-2xl font-bold">{productStats.total}</p>
              <p className="text-xs text-zinc-500 mt-1">+{productStats.today} today</p>
            </div>
            <Package className="w-7 h-7 text-zinc-600" />
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Moderators</p>
              <p className="text-2xl font-bold">{userStats.moderators}</p>
              <p className="text-xs text-zinc-500 mt-1">{userStats.banned} banned</p>
            </div>
            <Shield className="w-7 h-7 text-zinc-600" />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="flex w-fit gap-1 mb-8 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <TabsTrigger value="products" className="px-4 py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-semibold text-white">Products</TabsTrigger>
            <TabsTrigger value="users" className="px-4 py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-semibold text-white">Users</TabsTrigger>
            <TabsTrigger value="moderation" className="px-4 py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-semibold text-white">Moderation</TabsTrigger>
            <TabsTrigger value="analytics" className="px-4 py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-semibold text-white">Analytics</TabsTrigger>
          </TabsList>

          {/* Products Management */}
          <TabsContent value="products" className="mt-0">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h2 className="font-semibold text-white">Product Management</h2>
                <div className="flex items-center gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-36 bg-zinc-950 border-zinc-700 text-white text-sm h-8">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Developer Tools">Developer Tools</SelectItem>
                      <SelectItem value="Productivity">Productivity</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                  <button onClick={() => exportData('products')}
                    className="flex items-center gap-1 text-xs border border-zinc-700 text-white hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5" />Export
                  </button>
                  <button onClick={() => fetchData()}
                    className="flex items-center gap-1 text-xs border border-zinc-700 text-white hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />Refresh
                  </button>
                </div>
              </div>
              {selectedProducts.length > 0 && (
                <div className="flex items-center gap-3 px-6 py-3 bg-zinc-950 border-b border-zinc-800">
                  <span className="text-sm text-white">{selectedProducts.length} selected</span>
                  <button onClick={handleBulkProductDelete}
                    className="flex items-center gap-1 text-xs text-white hover:text-white border border-zinc-700 px-3 py-1 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5" />Delete Selected
                  </button>
                </div>
              )}
              <div className="divide-y divide-zinc-800">
                {filteredProducts.map(product => (
                  <div key={product._id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedProducts.includes(product._id)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedProducts([...selectedProducts, product._id]);
                          else setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                        }}
                      />
                      <div>
                        <h3 className="font-medium text-white text-sm">{product.title}</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          by {product.author_name} · {product.category} · {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-zinc-600 flex items-center gap-1">
                            <Star className="w-3 h-3" />{product.upvotes?.length || 0} upvotes
                          </span>
                          <span className="text-xs text-zinc-600 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />{product.reviews || 0} reviews
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/product/${product._id}`)}
                        className="flex items-center gap-1 text-xs border border-zinc-700 text-white hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                        <Eye className="w-3.5 h-3.5" />Review
                      </button>
                      <button onClick={() => handleDeleteProduct(product._id)}
                        className="flex items-center gap-1 text-xs border border-zinc-700 text-zinc-500 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users" className="mt-0">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h2 className="font-semibold text-white">User Management</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <Input placeholder="Search users..." value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-52 bg-zinc-950 border-zinc-700 text-white placeholder-zinc-600 h-8 text-sm" />
                  </div>
                  <button onClick={() => exportData('users')}
                    className="flex items-center gap-1 text-xs border border-zinc-700 text-white hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5" />Export
                  </button>
                  <button onClick={() => fetchData()}
                    className="flex items-center gap-1 text-xs border border-zinc-700 text-white hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />Refresh
                  </button>
                </div>
              </div>
              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-3 px-6 py-3 bg-zinc-950 border-b border-zinc-800">
                  <span className="text-sm text-white">{selectedUsers.length} selected</span>
                  <button onClick={handleBulkUserDelete}
                    className="flex items-center gap-1 text-xs text-white hover:text-white border border-zinc-700 px-3 py-1 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5" />Delete Selected
                  </button>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="w-12 text-zinc-500">
                      <Checkbox
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedUsers(filteredUsers.map(u => u.id));
                          else setSelectedUsers([]);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        ref={(checkbox) => {
                          if (checkbox) checkbox.indeterminate = selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length;
                        }}
                      />
                    </TableHead>
                    <TableHead className="text-zinc-500">User</TableHead>
                    <TableHead className="text-zinc-500">Join Date</TableHead>
                    <TableHead className="text-zinc-500">Products</TableHead>
                    <TableHead className="text-zinc-500">Role</TableHead>
                    <TableHead className="text-zinc-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-800/30">
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            const userId = user.id;
                            if (checked) setSelectedUsers(prev => [...prev, userId]);
                            else setSelectedUsers(prev => prev.filter(id => id !== userId));
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onMouseUp={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.profilePicture} />
                            <AvatarFallback className="bg-zinc-700 text-white text-xs">{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm text-white">{user.name}</p>
                            <p className="text-xs text-zinc-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white text-sm">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-white text-sm">{products.filter(p => p.author_id === user.id).length}</TableCell>
                      <TableCell>
                        <span className="text-[10px] font-semibold border border-zinc-700 text-white px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          {user.isAdmin && <Crown className="w-3 h-3" />}
                          {user.isAdmin ? 'Admin' : user.role || 'User'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 text-zinc-500 hover:text-white rounded-lg transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-white">
                            <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}
                              className="hover:bg-zinc-800 cursor-pointer text-zinc-300">
                              <Eye className="w-4 h-4 mr-2" />View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}
                              className="hover:bg-zinc-800 cursor-pointer text-white">
                              <Trash2 className="w-4 h-4 mr-2" />Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Content Moderation */}
          <TabsContent value="moderation" className="mt-8">
            <ModerationDashboard />
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                {
                  title: 'Engagement Metrics', icon: <BarChart3 className="w-4 h-4 text-zinc-500" />,
                  rows: [
                    { label: 'Daily Active Users', icon: <Activity className="w-3.5 h-3.5 text-zinc-500" />, value: analytics.dailyActiveUsers },
                    { label: 'Product Submissions', icon: <Package className="w-3.5 h-3.5 text-zinc-500" />, value: analytics.productSubmissions },
                    { label: 'User Reviews', icon: <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />, value: analytics.userReviews },
                    { label: 'Community Upvotes', icon: <Star className="w-3.5 h-3.5 text-zinc-500" />, value: analytics.communityUpvotes },
                  ]
                },
                {
                  title: 'Growth Trends', icon: <TrendingUp className="w-4 h-4 text-zinc-500" />,
                  rows: [
                    { label: 'Weekly Growth', value: `+${analytics.weeklyGrowth}%` },
                    { label: 'User Retention', value: `${analytics.userRetention}%` },
                    { label: 'Content Quality Score', value: `${analytics.contentQualityScore}/10` },
                    { label: 'Community Health', value: analytics.communityHealth },
                  ]
                },
                {
                  title: 'User Statistics', icon: <Users className="w-4 h-4 text-zinc-500" />,
                  rows: [
                    { label: 'Total Users', value: userStats.total },
                    { label: 'Active Users', value: userStats.active },
                    { label: 'Moderators', value: userStats.moderators },
                    { label: 'New Today', value: userStats.today },
                  ]
                },
                {
                  title: 'Product Statistics', icon: <Package className="w-4 h-4 text-zinc-500" />,
                  rows: [
                    { label: 'Total Products', value: productStats.total },
                    { label: 'New Today', value: productStats.today },
                    { label: 'Total Upvotes', value: analytics.communityUpvotes },
                    { label: 'Total Reviews', value: analytics.userReviews },
                  ]
                },
              ].map((card) => (
                <div key={card.title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-5 pb-4 border-b border-zinc-800">
                    {card.icon}
                    <h3 className="font-semibold text-sm text-white">{card.title}</h3>
                  </div>
                  <div className="space-y-3">
                    {card.rows.map((row) => (
                      <div key={row.label} className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-sm text-white">
                          {'icon' in row && row.icon}
                          {row.label}
                        </span>
                        <span className="font-semibold text-white text-sm">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}