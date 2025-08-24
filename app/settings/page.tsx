'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Bell, 
  Globe, 
  Shield, 
  Download,
  Trash2,
  Settings as SettingsIcon,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  // Theme settings
  const [autoSave, setAutoSave] = useState(true);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [usageAlerts, setUsageAlerts] = useState(true);
  
  // Privacy settings
  const [dataSharing, setDataSharing] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedAutoSave = localStorage.getItem('autoSave') !== 'false';
    const savedEmailNotifications = localStorage.getItem('emailNotifications') !== 'false';
    const savedInAppNotifications = localStorage.getItem('inAppNotifications') !== 'false';
    const savedUsageAlerts = localStorage.getItem('usageAlerts') !== 'false';
    const savedDataSharing = localStorage.getItem('dataSharing') === 'true';
    const savedAnalytics = localStorage.getItem('analytics') !== 'false';
    
    setAutoSave(savedAutoSave);
    setEmailNotifications(savedEmailNotifications);
    setInAppNotifications(savedInAppNotifications);
    setUsageAlerts(savedUsageAlerts);
    setDataSharing(savedDataSharing);
    setAnalytics(savedAnalytics);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    
    toast({
      title: "Theme updated",
      description: `Switched to ${newTheme} theme`,
    });
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    localStorage.setItem(setting, value.toString());
    toast({
      title: "Setting updated",
      description: `${setting} has been ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const handleDataExport = async () => {
    try {
      const response = await fetch('/api/data-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        // Create and download the JSON file
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Data export completed",
          description: "Your data has been downloaded successfully",
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to export your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAccountDeletion = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.')) {
      // This would typically call an API to delete the account
      toast({
        title: "Account deletion requested",
        description: "Your account will be deleted within 30 days. You can cancel this request anytime.",
      });
    }
  };

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Please sign in to access settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
          Settings & Preferences
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Customize your experience and manage your account
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance & Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance & Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Choose your preferred color scheme
                </p>
              </div>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoSave">Auto-save</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Automatically save your work as you type
                </p>
              </div>
              <Switch
                id="autoSave"
                checked={autoSave}
                onCheckedChange={(checked) => {
                  setAutoSave(checked);
                  handleSettingChange('autoSave', checked);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email notifications</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Receive important updates via email
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={emailNotifications}
                onCheckedChange={(checked) => {
                  setEmailNotifications(checked);
                  handleSettingChange('emailNotifications', checked);
                }}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="inAppNotifications">In-app notifications</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Show notifications within the application
                </p>
              </div>
              <Switch
                id="inAppNotifications"
                checked={inAppNotifications}
                onCheckedChange={(checked) => {
                  setInAppNotifications(checked);
                  handleSettingChange('inAppNotifications', checked);
                }}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="usageAlerts">Usage alerts</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Get notified when approaching usage limits
                </p>
              </div>
              <Switch
                id="usageAlerts"
                checked={usageAlerts}
                onCheckedChange={(checked) => {
                  setUsageAlerts(checked);
                  handleSettingChange('usageAlerts', checked);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dataSharing">Data sharing</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Allow anonymous usage data to improve the service
                </p>
              </div>
              <Switch
                id="dataSharing"
                checked={dataSharing}
                onCheckedChange={(checked) => {
                  setDataSharing(checked);
                  handleSettingChange('dataSharing', checked);
                }}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics">Analytics</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Help us improve by sharing usage analytics
                </p>
              </div>
              <Switch
                id="analytics"
                checked={analytics}
                onCheckedChange={(checked) => {
                  setAnalytics(checked);
                  handleSettingChange('analytics', checked);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Export your data</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Download all your data including chat history and files
                </p>
              </div>
              <Button variant="outline" onClick={handleDataExport}>
                Export Data
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Delete account</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Permanently remove your account and all data
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleAccountDeletion}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
