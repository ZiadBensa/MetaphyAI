'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  BarChart3, 
  Settings, 
  RefreshCw, 
  Trash2, 
  Play,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  subscription: {
    plan: string;
    status: string;
  } | null;
  usageRecords: Array<{
    feature: string;
    usageCount: number;
  }>;
  _count: {
    chatSessions: number;
    billingHistory: number;
  };
}

interface Statistics {
  totalUsers: number;
  totalSubscriptions: number;
  totalUsageRecords: number;
  totalChatSessions: number;
  monthlyUsage: Array<{
    feature: string;
    _sum: {
      usageCount: number;
    };
  }>;
}

interface TestResult {
  success: boolean;
  endpoint: string;
  status: number;
  result: any;
  timestamp: string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testData, setTestData] = useState({
    message: 'Test message',
    prompt: 'A beautiful landscape',
    text: 'This is a test text for humanization.',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      
      if (data.authenticated) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        fetchDashboardData();
      } else {
        alert('Invalid password');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users);
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (action: string, userId?: string, feature?: string) => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, userId, feature }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        fetchDashboardData(); // Refresh data
      } else {
        alert('Action failed');
      }
    } catch (error) {
      console.error('Admin action error:', error);
      alert('Action failed');
    }
  };

  const testEndpoint = async (endpoint: string) => {
    try {
      const response = await fetch('/api/admin/test-endpoints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint, testData }),
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
      } else {
        alert('Test failed');
      }
    } catch (error) {
      console.error('Test endpoint error:', error);
      alert('Test failed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              Access Admin Panel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage users, monitor usage, and test API endpoints
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                try {
                  await fetch('/api/admin/logout', { method: 'POST' });
                  setIsAuthenticated(false);
                } catch (error) {
                  console.error('Logout error:', error);
                }
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="testing">API Testing</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {statistics && (
              <div className="grid md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.totalUsers}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.totalSubscriptions}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Usage Records</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.totalUsageRecords}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.totalChatSessions}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Monthly Usage Summary */}
            {statistics?.monthlyUsage && (
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Usage Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statistics.monthlyUsage.map((usage) => (
                      <div key={usage.feature} className="flex items-center justify-between">
                        <span className="font-medium capitalize">
                          {usage.feature.replace('_', ' ')}
                        </span>
                        <span className="text-gray-600">
                          {usage._sum.usageCount || 0} uses
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <Button onClick={fetchDashboardData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{user.name || 'No Name'}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={user.subscription?.plan === 'pro' ? 'default' : 'secondary'}>
                            {user.subscription?.plan || 'free'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {user._count.chatSessions} chats, {user._count.billingHistory} payments
                          </p>
                        </div>
                      </div>

                      {/* Usage Records */}
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {user.usageRecords.map((usage) => (
                          <div key={usage.feature} className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium capitalize">
                              {usage.feature.replace('_', ' ')}
                            </div>
                            <div className="text-gray-600">{usage.usageCount}</div>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAdminAction('reset_all_usage', user.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reset All Usage
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete user ${user.email}?`)) {
                              handleAdminAction('delete_user', user.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete User
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoint Testing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Test Data Inputs */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">PDF Chat Message</label>
                    <Input
                      value={testData.message}
                      onChange={(e) => setTestData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Test message"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Image Generation Prompt</label>
                    <Input
                      value={testData.prompt}
                      onChange={(e) => setTestData(prev => ({ ...prev, prompt: e.target.value }))}
                      placeholder="Test prompt"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Text Humanizer Input</label>
                    <Input
                      value={testData.text}
                      onChange={(e) => setTestData(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Test text"
                    />
                  </div>
                </div>

                {/* Test Buttons */}
                <div className="grid md:grid-cols-5 gap-2">
                  <Button onClick={() => testEndpoint('pdf_chat')} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Test PDF Chat
                  </Button>
                  <Button onClick={() => testEndpoint('image_generation')} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Test Image Gen
                  </Button>
                  <Button onClick={() => testEndpoint('text_humanizer')} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Test Humanizer
                  </Button>
                  <Button onClick={() => testEndpoint('subscription')} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Test Subscription
                  </Button>
                  <Button onClick={() => testEndpoint('usage')} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Test Usage
                  </Button>
                </div>

                {/* Test Results */}
                {testResults.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Recent Test Results</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {testResults.map((result, index) => (
                        <div key={index} className="border rounded-lg p-3 text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium capitalize">
                              {result.endpoint.replace('_', ' ')}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant={result.status === 200 ? 'default' : 'destructive'}>
                                {result.status}
                              </Badge>
                              {result.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mb-1">
                            {new Date(result.timestamp).toLocaleString()}
                          </div>
                          <div className="bg-gray-50 p-2 rounded text-xs font-mono overflow-x-auto">
                            {JSON.stringify(result.result, null, 2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
