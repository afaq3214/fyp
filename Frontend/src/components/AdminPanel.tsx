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
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your PeerRank community</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Crown className="w-4 h-4 mr-1" />
            Administrator
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold">{userStats.total}</p>
                  <p className="text-xs text-green-600">+{userStats.today} today</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                  <p className="text-2xl font-bold">{productStats.total}</p>
                  <p className="text-xs text-green-600">+{productStats.today} today</p>
                </div>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold">{userStats.total}</p>
                  <p className="text-xs text-green-600">+{userStats.today} today</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Moderators</p>
                  <p className="text-2xl font-bold">{userStats.moderators}</p>
                  <p className="text-xs text-purple-600">Team members</p>
                </div>
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Products Management */}
          <TabsContent value="products" className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Product Management</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Developer Tools">Developer Tools</SelectItem>
                        <SelectItem value="Productivity">Productivity</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => exportData('products')}>
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => fetchData()}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </div>
                {selectedProducts.length > 0 && (
                  <div className="flex items-center space-x-2 pt-2">
                    <span className="text-sm text-gray-600">
                      {selectedProducts.length} items selected
                    </span>
                    <Button 
                      size="sm" 
                      onClick={handleBulkProductDelete}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete Selected
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProducts.map(product => (
                    <div key={product._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedProducts.includes(product._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProducts([...selectedProducts, product._id]);
                            } else {
                              setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            by {product.author_name} • {product.category} • {new Date(product.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500 flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              {product.upvotes?.length || 0} upvotes
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {product.reviews || 0} reviews
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/product/${product._id}`)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users" className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => exportData('users')}>
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => fetchData()}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </div>
                {selectedUsers.length > 0 && (
                  <div className="flex items-center space-x-2 pt-2">
                    <span className="text-sm text-gray-600">
                      {selectedUsers.length} users selected
                    </span>
                    <Button 
                      size="sm" 
                      onClick={handleBulkUserDelete}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete Selected
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onCheckedChange={(checked) => {
                            console.log('Select all clicked:', checked);
                            if (checked) {
                              setSelectedUsers(filteredUsers.map(u => u.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onMouseUp={(e) => e.stopPropagation()}
                          ref={(checkbox) => {
                            if (checkbox) {
                              checkbox.indeterminate = selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length;
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) => {
                              console.log('User object:', user);
                              console.log('User ID:', user.id);
                              const userId = user.id;
                              console.log('User checkbox clicked:', userId, checked);
                              if (checked) {
                                setSelectedUsers(prev => [...prev, userId]);
                              } else {
                                setSelectedUsers(prev => prev.filter(id => id !== userId));
                              }
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onMouseUp={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={user.profilePicture} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{products.filter(p => p.author_id === user.id).length}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.isAdmin && <Crown className="w-3 h-3 mr-1" />}
                            {user.isAdmin ? 'Admin' : user.role || 'User'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-blue-600" />
                        Daily Active Users
                      </span>
                      <span className="font-bold">{analytics.dailyActiveUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Package className="w-4 h-4 mr-2 text-purple-600" />
                        Product Submissions
                      </span>
                      <span className="font-bold">{analytics.productSubmissions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
                        User Reviews
                      </span>
                      <span className="font-bold">{analytics.userReviews}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Star className="w-4 h-4 mr-2 text-yellow-600" />
                        Community Upvotes
                      </span>
                      <span className="font-bold">{analytics.communityUpvotes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Growth Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Weekly Growth</span>
                      <span className="font-bold text-green-600">+{analytics.weeklyGrowth}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>User Retention</span>
                      <span className="font-bold text-blue-600">{analytics.userRetention}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Content Quality Score</span>
                      <span className="font-bold text-purple-600">{analytics.contentQualityScore}/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Community Health</span>
                      <span className="font-bold text-green-600">{analytics.communityHealth}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    User Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Users</span>
                      <span className="font-bold">{userStats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Users</span>
                      <span className="font-bold text-green-600">{userStats.active}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Moderators</span>
                      <span className="font-bold text-purple-600">{userStats.moderators}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>New Users Today</span>
                      <span className="font-bold text-blue-600">{userStats.today}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Product Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Products</span>
                      <span className="font-bold">{productStats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>New Products Today</span>
                      <span className="font-bold text-blue-600">{productStats.today}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Upvotes</span>
                      <span className="font-bold text-green-600">{analytics.communityUpvotes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Reviews</span>
                      <span className="font-bold text-purple-600">{analytics.userReviews}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}