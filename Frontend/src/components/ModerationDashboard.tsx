import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Users, TrendingUp, Eye, Ban, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface QueueItem {
  _id: string;
  contentId: any;
  contentType: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  analysis: {
    riskLevel: string;
    flags: string[];
    score: number;
    warning?: string;
    detectedIssues: string[];
  };
  status: string;
  priority: number;
  createdAt: string;
  contentSnapshot: {
    comment?: string;
    [key: string]: any;
  };
}

interface QueueStats {
  total: number;
  highRisk: number;
  overdue: number;
  byStatus: {
    [key: string]: { count: number; avgScore: number };
  };
}

export const ModerationDashboard: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState({
    status: 'pending',
    riskLevel: 'all',
    contentType: 'all'
  });
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'warn'>('approve');
  const [actionReason, setActionReason] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [warningSeverity, setWarningSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  useEffect(() => {
    fetchQueue();
    fetchStats();
  }, [filter]);

  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
        console.error('❌ No authentication token found');
        return;
      }

      const params = new URLSearchParams();
      if (filter.status && filter.status !== 'all') params.append('status', filter.status);
      if (filter.riskLevel && filter.riskLevel !== 'all') params.append('riskLevel', filter.riskLevel);
      if (filter.contentType && filter.contentType !== 'all') params.append('contentType', filter.contentType);

      console.log('🔍 Fetching moderation queue with params:', params.toString());

      const response = await fetch(`/api/moderation/queue?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Queue response status:', response.status);
      console.log('📡 Queue response headers:', response.headers);

      // Check if response is HTML (redirect/error page)
      const contentType = response.headers.get('content-type');
      console.log('📡 Response content type:', contentType);

      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        console.error('❌ Received HTML instead of JSON:', text.substring(0, 200));
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Queue data:', data);
        setQueue(data.queue);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch queue:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/moderation/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.queueStats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleModerate = async () => {
    if (!selectedItem) return;

    setActionLoading(true);
    try {
      let endpoint = `/api/moderation/moderate/${selectedItem._id}`;
      let body: any = { action: actionType, reason: actionReason };

      if (actionType === 'warn') {
        endpoint = `/api/moderation/warn/${selectedItem._id}`;
        body = {
          warningMessage: warningMessage || selectedItem.analysis.warning,
          severity: warningSeverity
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setShowActionDialog(false);
        setSelectedItem(null);
        setActionReason('');
        setWarningMessage('');
        fetchQueue();
        fetchStats();
      }
    } catch (error) {
      console.error('Moderation action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const openActionDialog = (item: QueueItem, action: typeof actionType) => {
    setSelectedItem(item);
    setActionType(action);
    setShowActionDialog(true);
    
    if (action === 'warn') {
      setWarningMessage(item.analysis.warning || 'This content violates our community guidelines.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Content Moderation
          </h1>
          <p className="text-gray-600">Review and moderate flagged content</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Queue</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">High Risk</p>
                  <p className="text-2xl font-bold text-red-600">{stats.highRisk}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.overdue}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.byStatus.pending?.count || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Select value={filter.status} onValueChange={(value) => setFilter({...filter, status: value})}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filter.riskLevel} onValueChange={(value) => setFilter({...filter, riskLevel: value})}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filter.contentType} onValueChange={(value) => setFilter({...filter, contentType: value})}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Comment">Comments</SelectItem>
                <SelectItem value="Product">Products</SelectItem>
                <SelectItem value="User">Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Queue</CardTitle>
          <CardDescription>
            {queue.length} items found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {queue.map((item) => (
              <div key={item._id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(item.status)}
                      <span className="font-medium">{item.contentType}</span>
                      <Badge className={getRiskLevelColor(item.analysis.riskLevel)}>
                        {item.analysis.riskLevel}
                      </Badge>
                      <Badge variant="outline">Score: {item.analysis.score}</Badge>
                      <span className="text-sm text-gray-500">
                        Priority: {item.priority}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">User:</span> {item.userId.name} ({item.userId.email})
                    </div>

                    <div className="text-sm mb-2">
                      <span className="font-medium">Content:</span>
                      <div className="mt-1 p-2 bg-gray-50 rounded text-sm max-h-20 overflow-y-auto">
                        {item.contentSnapshot.comment || JSON.stringify(item.contentSnapshot)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.analysis.flags.map((flag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {flag}
                        </Badge>
                      ))}
                    </div>

                    {item.analysis.detectedIssues.length > 0 && (
                      <div className="text-xs text-red-600">
                        <span className="font-medium">Detected:</span> {item.analysis.detectedIssues.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openActionDialog(item, 'approve')}
                      disabled={item.status !== 'pending'}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openActionDialog(item, 'warn')}
                      disabled={item.status !== 'pending'}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Warn
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openActionDialog(item, 'reject')}
                      disabled={item.status !== 'pending'}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Created: {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
            ))}

            {queue.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No items found in queue
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Content'}
              {actionType === 'warn' && 'Send Warning'}
              {actionType === 'reject' && 'Reject Content'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && 'This content will be approved and visible to all users.'}
              {actionType === 'warn' && 'Send a warning to the user about this content.'}
              {actionType === 'reject' && 'This content will be removed and the user will be notified.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {(actionType === 'reject' || actionType === 'warn') && (
              <div>
                <label className="text-sm font-medium">Reason</label>
                <Textarea
                  value={actionType === 'warn' ? warningMessage : actionReason}
                  onChange={(e) => actionType === 'warn' ? setWarningMessage(e.target.value) : setActionReason(e.target.value)}
                  placeholder="Provide a reason for this action..."
                  className="mt-1"
                />
              </div>
            )}

            {actionType === 'warn' && (
              <div>
                <label className="text-sm font-medium">Warning Severity</label>
                <Select value={warningSeverity} onValueChange={(value: any) => setWarningSeverity(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleModerate} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : (
                  <>
                    {actionType === 'approve' && <CheckCircle className="h-4 w-4 mr-2" />}
                    {actionType === 'warn' && <MessageSquare className="h-4 w-4 mr-2" />}
                    {actionType === 'reject' && <XCircle className="h-4 w-4 mr-2" />}
                    {actionType === 'approve' && 'Approve'}
                    {actionType === 'warn' && 'Send Warning'}
                    {actionType === 'reject' && 'Reject'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModerationDashboard;
