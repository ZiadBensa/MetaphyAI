'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Calendar,
  FileText,
  Image,
  Type
} from 'lucide-react';
import { PRICING_TIERS } from '@/lib/pricing';
import { useRouter } from "next/navigation"
import { useToast } from '@/components/ui/use-toast';

interface UsageInfo {
  feature: string;
  currentUsage: number;
  limit: number;
  remaining: number;
  allowed: boolean;
}

interface SubscriptionInfo {
  plan: string;
  status: string;
  startDate: string;
  endDate?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [usage, setUsage] = useState<UsageInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.userId) {
      fetchProfileData();
    }
  }, [session]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        setUsage(data.usage);
      }
    } catch (error) {
      // Silent error handling for profile data fetch
    } finally {
      setLoading(false);
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'pdf_chat':
        return <FileText className="h-4 w-4" />;
      case 'image_generation':
        return <Image className="h-4 w-4" />;
      case 'text_humanizer':
        return <Type className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'pdf_chat':
        return 'PDF Chat';
      case 'image_generation':
        return 'Image Generation';
      case 'text_humanizer':
        return 'Text Humanizer';
      default:
        return feature;
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'free';
  const planDetails = PRICING_TIERS[currentPlan];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Navigation */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 mb-4"
        >
          ← Back to Tools
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Profile & Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account, subscription, and usage
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Account Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Member since</span>
                  <span className="font-medium">
                    {subscription?.startDate 
                      ? new Date(subscription.startDate).toLocaleDateString()
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Current Plan</span>
                <Badge variant={currentPlan === 'pro' ? 'default' : 'secondary'}>
                  {currentPlan === 'pro' ? 'Pro' : 'Free'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Status</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {subscription?.status || 'Active'}
                </Badge>
              </div>
              
              <div className="pt-4">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => router.push('/pricing')}
                >
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Usage Statistics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Usage Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Usage This Month
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your usage resets on the 1st of each month
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {usage.map((usageInfo) => {
                  const percentage = getUsagePercentage(usageInfo.currentUsage, usageInfo.limit);
                  const color = getUsageColor(percentage);
                  
                  return (
                    <div key={usageInfo.feature} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getFeatureIcon(usageInfo.feature)}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {getFeatureName(usageInfo.feature)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {usageInfo.currentUsage} / {usageInfo.limit}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({usageInfo.remaining} remaining)
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{Math.round(percentage)}% used</span>
                          <span>
                            {usageInfo.allowed ? 'Available' : 'Limit reached'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Plan Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Plan Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {planDetails.name} Plan
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      ${planDetails.price}/month
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/pricing')}
                  >
                    {currentPlan === 'free' ? 'Upgrade' : 'Change Plan'}
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(planDetails.features).map(([key, feature]) => (
                    <div key={key} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {key === 'pdfChat' ? 'PDF Chat' : 
                         key === 'imageGeneration' ? 'Image Generation' :
                         key === 'textHumanizer' ? 'Text Humanizer' : 'Storage'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                                                 {key === 'storage' 
                           ? feature.limit >= 1024 * 1024 * 1024 
                             ? `${feature.limit / (1024 * 1024 * 1024)}GB`
                             : `${feature.limit / (1024 * 1024)}MB`
                           : key === 'textHumanizer'
                           ? `${feature.monthlyLimit.toLocaleString('en-US')} characters`
                           : `${feature.monthlyLimit} per month`
                         }
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
