'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Download, 
  Plus,
  Calendar,
  DollarSign,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { useToast } from '@/components/ui/use-toast';

interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

export default function BillingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.userId) {
      fetchBillingData();
    }
  }, [session]);

  const fetchBillingData = async () => {
    try {
      // Mock billing history data - in real app, this would come from API
      const mockHistory: BillingHistoryItem[] = [
        {
          id: '1',
          date: '2025-08-24',
          amount: 29.99,
          description: 'Pro Plan - August 2025',
          status: 'paid',
          invoiceUrl: '#'
        },
        {
          id: '2',
          date: '2025-07-24',
          amount: 29.99,
          description: 'Pro Plan - July 2025',
          status: 'paid',
          invoiceUrl: '#'
        }
      ];
      
      setBillingHistory(mockHistory);
    } catch (error) {
      // Silent error handling for billing data fetch
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    toast({
      title: "Payment method",
      description: "This feature will be available soon",
    });
  };

  const handleDownloadInvoice = (invoiceUrl: string) => {
    toast({
      title: "Invoice download",
      description: "Invoice download will be available soon",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Please sign in to access billing</p>
        </div>
      </div>
    );
  }

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
          Billing & Payment
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your payment methods and view billing history
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Payment Methods */}
        <div className="space-y-6">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  No payment methods added yet
                </p>
                <Button onClick={handleAddPaymentMethod} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Payment Method
                </Button>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <p>• Secure payment processing</p>
                <p>• Multiple payment options</p>
                <p>• Automatic billing</p>
              </div>
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Billing cycle</span>
                <span className="font-medium">Monthly</span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Next billing date</span>
                <span className="font-medium">September 24, 2025</span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Tax ID</span>
                <span className="font-medium">Not provided</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Billing History */}
        <div className="space-y-6">
          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {billingHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No billing history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {billingHistory.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">${item.amount}</span>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                        
                        {item.invoiceUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(item.invoiceUrl!)}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-3 w-3" />
                            Invoice
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Having trouble with billing? Our support team is here to help.
              </p>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  View FAQ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
