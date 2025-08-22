'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { PRICING_TIERS } from '@/lib/pricing';

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  const handleUpgrade = async (plan: string) => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      if (response.ok) {
        // Show success message or redirect
        alert(`Successfully upgraded to ${plan} plan!`);
      } else {
        alert('Failed to upgrade plan. Please try again.');
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Navigation */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
            ← Back to Tools
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Start with our free tier and upgrade when you need more power. 
            All plans include our core features with different usage limits.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {Object.values(PRICING_TIERS).map((tier) => (
            <Card 
              key={tier.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                selectedPlan === tier.id 
                  ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                  : 'hover:scale-102'
              }`}
            >
              {tier.id === 'pro' && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tier.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${tier.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300 ml-2">
                    /month
                  </span>
                </div>
                {tier.id === 'free' && (
                  <Badge variant="secondary" className="mt-2">
                    Forever Free
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    What's included:
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">PDF Chat</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {tier.features.pdfChat.monthlyLimit} per month
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Image Generation</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {tier.features.imageGeneration.monthlyLimit} per month
                      </span>
                    </div>
                    
                                         <div className="flex items-center justify-between">
                       <span className="text-gray-700 dark:text-gray-300">Text Humanizer</span>
                       <span className="font-medium text-gray-900 dark:text-white">
                         {tier.features.textHumanizer.monthlyLimit.toLocaleString('en-US')} chars/month
                       </span>
                     </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Storage</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {tier.features.storage.limit >= 1024 * 1024 * 1024 
                          ? `${tier.features.storage.limit / (1024 * 1024 * 1024)}GB`
                          : `${tier.features.storage.limit / (1024 * 1024)}MB`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Benefits:
                  </h3>
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {tier.id === 'free' ? (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleUpgrade('free')}
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" 
                      onClick={() => handleUpgrade('pro')}
                    >
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I switch plans anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Do usage limits reset monthly?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes, all usage limits reset on the 1st of each month. Unused limits don't carry over.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What happens when I reach my limit?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                You'll receive a notification when you're close to your limit. Once reached, you can upgrade to continue using the service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
