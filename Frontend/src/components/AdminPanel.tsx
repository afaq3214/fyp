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
  MoreHorizontal
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
import { toast } from 'sonner';
import type { User, Product } from '../App';

interface AdminPanelProps {
  onBack: () => void;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch users and products data
        const [usersRes, productsRes] = await Promise.all([
          fetch('https://fyp-1ejm.vercel.app//api/users'),
          fetch('https://fyp-1ejm.vercel.app//api/products')
        ]);

        if (!usersRes.ok || !productsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [usersData, productsData] = await Promise.all([
          usersRes.json(),
          productsRes.json()
        ]);

        setUsers(usersData);
        setProducts(productsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  const handleApproveProduct = (productId: string) => {
    toast.success('Product approved successfully');
  };

  const handleRejectProduct = (productId: string) => {
    toast.success('Product rejected');
  };

  const handleUserAction = (userId: string, action: string) => {
    toast.success(`User ${action} successfully`);
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
                  <p className="text-2xl font-bold">{mockStats.totalUsers}</p>
                  <p className="text-xs text-green-600">+{mockStats.todaySignups} today</p>
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
                  <p className="text-2xl font-bold">{mockStats.totalProducts}</p>
                  <p className="text-xs text-green-600">+{mockStats.todaySubmissions} today</p>
                </div>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Reviews</p>
                  <p className="text-2xl font-bold">{mockStats.pendingReviews}</p>
                  <p className="text-xs text-orange-600">Needs attention</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</p>
                  <p className="text-2xl font-bold">{mockStats.engagementRate}%</p>
                  <p className="text-xs text-green-600">+5% this week</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
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
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPendingProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          by {product.author} • {product.category} • {product.submittedAt}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={product.status === 'pending' ? 'secondary' : 'default'}
                          className={product.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                        >
                          {product.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleApproveProduct(product.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRejectProduct(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
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
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>{user.products}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'secondary'}
                            className={
                              user.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.role === 'moderator' && <Crown className="w-3 h-3 mr-1" />}
                            {user.role}
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
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'viewed')}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'promoted')}>
                                <Crown className="w-4 h-4 mr-2" />
                                Promote to Moderator
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'warned')}>
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Send Warning
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user.id, 'banned')}
                                className="text-red-600"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Ban User
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
                      <span>Daily Active Users</span>
                      <span className="font-bold">892</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Product Submissions</span>
                      <span className="font-bold">156</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>User Reviews</span>
                      <span className="font-bold">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Community Upvotes</span>
                      <span className="font-bold">8,934</span>
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
                      <span className="font-bold text-green-600">+23%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>User Retention</span>
                      <span className="font-bold text-blue-600">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Content Quality Score</span>
                      <span className="font-bold text-purple-600">9.2/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Community Health</span>
                      <span className="font-bold text-green-600">Excellent</span>
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