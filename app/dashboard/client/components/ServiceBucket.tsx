'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import type { TeamMember } from '../types/team';
import type { Responsibility, ServiceCategory } from '../types/services';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface ServiceBucketProps {
  teamMembers: TeamMember[];
  onAssignService: (memberId: string, service: Responsibility) => Promise<void>;
}

type IconName = keyof typeof Icons;

interface Service {
  name: Responsibility;
  icon: IconName;
  category: ServiceCategory;
}

const AVAILABLE_SERVICES: Service[] = [
  // Performance Marketing
  { name: 'Google Ads', icon: 'Target', category: 'Performance Marketing' },
  { name: 'Meta Ads', icon: 'Share2', category: 'Performance Marketing' },
  { name: 'LinkedIn Ads', icon: 'Users', category: 'Performance Marketing' },
  { name: 'TikTok Ads', icon: 'Video', category: 'Performance Marketing' },
  { name: 'YouTube Ads', icon: 'Video', category: 'Performance Marketing' },
  { name: 'Programmatic Advertising', icon: 'Globe', category: 'Performance Marketing' },
  { name: 'Retargeting Campaigns', icon: 'ArrowLeftRight', category: 'Performance Marketing' },
  { name: 'Conversion Rate Optimization', icon: 'TrendingUp', category: 'Performance Marketing' },
  { name: 'Bing Ads', icon: 'Search', category: 'Performance Marketing' },
  { name: 'Apple Search Ads', icon: 'Search', category: 'Performance Marketing' },
  { name: 'Spotify Ads', icon: 'Headphones', category: 'Performance Marketing' },
  { name: 'Native Advertising', icon: 'Layout', category: 'Performance Marketing' },
  { name: 'Display Advertising', icon: 'Image', category: 'Performance Marketing' },
  { name: 'Video Advertising', icon: 'Video', category: 'Performance Marketing' },

  // E-commerce & Marketplaces
  { name: 'Amazon PPC', icon: 'DollarSign', category: 'E-commerce & Marketplaces' },
  { name: 'Amazon SEO', icon: 'Search', category: 'E-commerce & Marketplaces' },
  { name: 'Amazon Listing Optimization', icon: 'FileText', category: 'E-commerce & Marketplaces' },
  { name: 'Amazon Brand Store', icon: 'ShoppingBag', category: 'E-commerce & Marketplaces' },
  { name: 'Amazon A+ Content', icon: 'Plus', category: 'E-commerce & Marketplaces' },
  { name: 'Amazon Inventory Management', icon: 'Package', category: 'E-commerce & Marketplaces' },
  { name: 'Amazon FBA Strategy', icon: 'Truck', category: 'E-commerce & Marketplaces' },
  { name: 'Walmart Marketplace', icon: 'ShoppingCart', category: 'E-commerce & Marketplaces' },
  { name: 'eBay Optimization', icon: 'Tag', category: 'E-commerce & Marketplaces' },
  { name: 'Etsy Shop Management', icon: 'Store', category: 'E-commerce & Marketplaces' },
  { name: 'Shopify Store Management', icon: 'Store', category: 'E-commerce & Marketplaces' },
  { name: 'WooCommerce Management', icon: 'Store', category: 'E-commerce & Marketplaces' },
  { name: 'BigCommerce Optimization', icon: 'Store', category: 'E-commerce & Marketplaces' },

  // Social Media Platforms
  { name: 'Pinterest Marketing', icon: 'Image', category: 'Social Media Platforms' },
  { name: 'Pinterest SEO', icon: 'Search', category: 'Social Media Platforms' },
  { name: 'Pinterest Ad Campaigns', icon: 'Target', category: 'Social Media Platforms' },
  { name: 'Pinterest Content Strategy', icon: 'FileText', category: 'Social Media Platforms' },
  { name: 'Instagram Marketing', icon: 'Image', category: 'Social Media Platforms' },
  { name: 'Instagram Content Creation', icon: 'Camera', category: 'Social Media Platforms' },
  { name: 'Instagram Story Strategy', icon: 'Film', category: 'Social Media Platforms' },
  { name: 'Instagram Reels Production', icon: 'Video', category: 'Social Media Platforms' },
  { name: 'Instagram Shop Setup', icon: 'ShoppingBag', category: 'Social Media Platforms' },
  { name: 'TikTok Content Creation', icon: 'Video', category: 'Social Media Platforms' },
  { name: 'TikTok Trend Analysis', icon: 'TrendingUp', category: 'Social Media Platforms' },
  { name: 'TikTok Shop Management', icon: 'ShoppingBag', category: 'Social Media Platforms' },
  { name: 'TikTok Live Strategy', icon: 'Video', category: 'Social Media Platforms' },
  { name: 'LinkedIn Company Page Management', icon: 'Building2', category: 'Social Media Platforms' },
  { name: 'LinkedIn Content Strategy', icon: 'FileText', category: 'Social Media Platforms' },
  { name: 'LinkedIn Lead Generation', icon: 'Users', category: 'Social Media Platforms' },
  { name: 'LinkedIn Personal Branding', icon: 'User', category: 'Social Media Platforms' },
  { name: 'LinkedIn Sales Navigator', icon: 'Target', category: 'Social Media Platforms' },
  { name: 'Facebook Page Management', icon: 'Facebook', category: 'Social Media Platforms' },
  { name: 'Facebook Group Management', icon: 'Users', category: 'Social Media Platforms' },
  { name: 'Facebook Marketplace Strategy', icon: 'ShoppingBag', category: 'Social Media Platforms' },
  { name: 'Facebook Shop Setup', icon: 'Store', category: 'Social Media Platforms' },
  { name: 'Meta Business Suite Management', icon: 'LayoutGrid', category: 'Social Media Platforms' },
  { name: 'YouTube Channel Management', icon: 'Video', category: 'Social Media Platforms' },
  { name: 'YouTube SEO', icon: 'Search', category: 'Social Media Platforms' },
  { name: 'YouTube Shorts Strategy', icon: 'Video', category: 'Social Media Platforms' },
  { name: 'YouTube Community Management', icon: 'Users', category: 'Social Media Platforms' },
  { name: 'YouTube Monetization Strategy', icon: 'DollarSign', category: 'Social Media Platforms' },
  { name: 'Twitter Marketing', icon: 'Twitter', category: 'Social Media Platforms' },
  { name: 'Twitter Ads Management', icon: 'Target', category: 'Social Media Platforms' },
  { name: 'Twitter Content Strategy', icon: 'FileText', category: 'Social Media Platforms' },
  { name: 'Twitter Community Building', icon: 'Users', category: 'Social Media Platforms' },
  { name: 'Snapchat Marketing', icon: 'Camera', category: 'Social Media Platforms' },
  { name: 'Snapchat AR Filters', icon: 'Eye', category: 'Social Media Platforms' },
  { name: 'Snapchat Ads Management', icon: 'Target', category: 'Social Media Platforms' },
  { name: 'Discord Community Management', icon: 'MessageSquare', category: 'Social Media Platforms' },
  { name: 'Twitch Channel Management', icon: 'Video', category: 'Social Media Platforms' },
  { name: 'Reddit Marketing', icon: 'MessageCircle', category: 'Social Media Platforms' },
  { name: 'Telegram Channel Management', icon: 'Send', category: 'Social Media Platforms' },

  // SEO & Organic Growth
  { name: 'On-Page SEO', icon: 'FileText', category: 'SEO & Organic Growth' },
  { name: 'Off-Page SEO', icon: 'Link', category: 'SEO & Organic Growth' },
  { name: 'Technical SEO', icon: 'Code', category: 'SEO & Organic Growth' },
  { name: 'SEO Audits', icon: 'Search', category: 'SEO & Organic Growth' },
  { name: 'Local SEO', icon: 'MapPin', category: 'SEO & Organic Growth' },
  { name: 'SEO Content Planning', icon: 'BookOpen', category: 'SEO & Organic Growth' },
  { name: 'Google Business Profile Optimization', icon: 'Map', category: 'SEO & Organic Growth' },
  { name: 'Local Citation Building', icon: 'List', category: 'SEO & Organic Growth' },
  { name: 'Review Management', icon: 'Star', category: 'SEO & Organic Growth' },

  // Analytics & Data
  { name: 'Google Analytics 4', icon: 'BarChart', category: 'Analytics & Data' },
  { name: 'Facebook Analytics', icon: 'PieChart', category: 'Analytics & Data' },
  { name: 'Data Visualization', icon: 'LineChart', category: 'Analytics & Data' },
  { name: 'Custom Dashboard Creation', icon: 'Layout', category: 'Analytics & Data' },
  { name: 'Conversion Tracking Setup', icon: 'Target', category: 'Analytics & Data' },
  { name: 'Heat Map Analysis', icon: 'Activity', category: 'Analytics & Data' },
  { name: 'User Behavior Analysis', icon: 'Users', category: 'Analytics & Data' },
  { name: 'Tag Management', icon: 'Tags', category: 'Analytics & Data' },
  { name: 'UTM Setup & Management', icon: 'Link', category: 'Analytics & Data' },
  { name: 'Pixel Implementation', icon: 'Code', category: 'Analytics & Data' },

  // Content & Copywriting
  { name: 'Blog Writing', icon: 'FileText', category: 'Content & Copywriting' },
  { name: 'Website Copywriting', icon: 'Globe', category: 'Content & Copywriting' },
  { name: 'Email Campaign Copy', icon: 'Mail', category: 'Content & Copywriting' },
  { name: 'Sales Copy', icon: 'DollarSign', category: 'Content & Copywriting' },
  { name: 'Video Scriptwriting', icon: 'Video', category: 'Content & Copywriting' },
  { name: 'Case Studies', icon: 'FileText', category: 'Content & Copywriting' },
  { name: 'Podcast Production & Strategy', icon: 'Mic', category: 'Content & Copywriting' },
  { name: 'Webinar Management', icon: 'Video', category: 'Content & Copywriting' },
  { name: 'Online Course Creation', icon: 'BookOpen', category: 'Content & Copywriting' },
  { name: 'Ebook Writing & Design', icon: 'Book', category: 'Content & Copywriting' },
  { name: 'Infographic Design', icon: 'Image', category: 'Content & Copywriting' },
  { name: 'White Paper Development', icon: 'FileText', category: 'Content & Copywriting' },
  { name: 'Product Documentation', icon: 'FileText', category: 'Content & Copywriting' },

  // Design & Creative
  { name: 'Brand Identity', icon: 'Palette', category: 'Design & Creative' },
  { name: 'Ad Creative', icon: 'Image', category: 'Design & Creative' },
  { name: 'Web Design', icon: 'Layout', category: 'Design & Creative' },
  { name: 'Social Media Design', icon: 'Share2', category: 'Design & Creative' },
  { name: 'Pitch Deck Design', icon: 'FileText', category: 'Design & Creative' },
  { name: 'Print Design', icon: 'Printer', category: 'Design & Creative' },
  { name: 'Product Photography', icon: 'Camera', category: 'Design & Creative' },
  { name: 'Motion Graphics', icon: 'Film', category: 'Design & Creative' },
  { name: 'UI/UX Design', icon: 'Smartphone', category: 'Design & Creative' },
  { name: 'App Design', icon: 'Smartphone', category: 'Design & Creative' },

  // Video & Audio
  { name: 'Video Production', icon: 'Video', category: 'Video & Audio' },
  { name: 'Animation', icon: 'Film', category: 'Video & Audio' },
  { name: 'Podcast Production', icon: 'Mic', category: 'Video & Audio' },
  { name: 'Voiceover Work', icon: 'Mic', category: 'Video & Audio' },
  { name: 'Video Editing', icon: 'Video', category: 'Video & Audio' },
  { name: 'Audio Editing', icon: 'Music', category: 'Video & Audio' },
  { name: 'Live Streaming', icon: 'Video', category: 'Video & Audio' },
  { name: 'Sound Design', icon: 'Volume2', category: 'Video & Audio' },

  // Email Marketing
  { name: 'Newsletter Creation', icon: 'Mail', category: 'Email Marketing' },
  { name: 'Email Funnels', icon: 'ArrowDown', category: 'Email Marketing' },
  { name: 'Campaign Strategy', icon: 'Target', category: 'Email Marketing' },
  { name: 'List Growth Strategy', icon: 'Users', category: 'Email Marketing' },
  { name: 'Email Automation', icon: 'Clock', category: 'Email Marketing' },
  { name: 'Email Template Design', icon: 'Layout', category: 'Email Marketing' },
  { name: 'Email Deliverability', icon: 'CheckCircle', category: 'Email Marketing' },
  { name: 'A/B Testing', icon: 'Split', category: 'Email Marketing' },

  // Web & Tech
  { name: 'Website Development', icon: 'Code', category: 'Web & Tech' },
  { name: 'Landing Page Creation', icon: 'Layout', category: 'Web & Tech' },
  { name: 'Analytics Setup', icon: 'Target', category: 'Web & Tech' },
  { name: 'CRM Integration', icon: 'Database', category: 'Web & Tech' },
  { name: 'Funnel Building', icon: 'ArrowDown', category: 'Web & Tech' },
  { name: 'API Integration', icon: 'Code', category: 'Web & Tech' },
  { name: 'Marketing Automation', icon: 'Zap', category: 'Web & Tech' },
  { name: 'App Store Optimization (ASO)', icon: 'Smartphone', category: 'Web & Tech' },
  { name: 'Mobile App Marketing', icon: 'Smartphone', category: 'Web & Tech' },

  // Strategy & Analytics
  { name: 'Marketing Strategy', icon: 'Target', category: 'Strategy & Analytics' },
  { name: 'Growth Hacking', icon: 'Rocket', category: 'Strategy & Analytics' },
  { name: 'Marketing Audits', icon: 'Search', category: 'Strategy & Analytics' },
  { name: 'Attribution Modeling', icon: 'PieChart', category: 'Strategy & Analytics' },
  { name: 'Competitor Research', icon: 'Search', category: 'Strategy & Analytics' },
  { name: 'Media Planning', icon: 'Calendar', category: 'Strategy & Analytics' },
  { name: 'SaaS Marketing', icon: 'Box', category: 'Strategy & Analytics' },
  { name: 'B2B Lead Generation', icon: 'Users', category: 'Strategy & Analytics' },
  { name: 'Account-Based Marketing (ABM)', icon: 'Target', category: 'Strategy & Analytics' },
  { name: 'Influencer Marketing Strategy', icon: 'Star', category: 'Strategy & Analytics' },
  { name: 'Affiliate Program Management', icon: 'Share2', category: 'Strategy & Analytics' },

  // E-commerce Operations
  { name: 'Shopping Feed Optimization', icon: 'ShoppingCart', category: 'E-commerce Operations' },
  { name: 'Marketplace Integration', icon: 'Grid', category: 'E-commerce Operations' },
  { name: 'Order Management', icon: 'Package', category: 'E-commerce Operations' },
  { name: 'Inventory Sync', icon: 'RefreshCw', category: 'E-commerce Operations' },
  { name: 'Customer Service Setup', icon: 'Headphones', category: 'E-commerce Operations' },
  { name: 'Returns Management', icon: 'RotateCcw', category: 'E-commerce Operations' },
  { name: 'Cart Abandonment Strategy', icon: 'ShoppingCart', category: 'E-commerce Operations' },
  { name: 'Cross-sell Strategy', icon: 'Shuffle', category: 'E-commerce Operations' },
  { name: 'Upsell Implementation', icon: 'TrendingUp', category: 'E-commerce Operations' },
  { name: 'Customer Loyalty Programs', icon: 'Heart', category: 'E-commerce Operations' },
  { name: 'Gift Card Programs', icon: 'Gift', category: 'E-commerce Operations' },
  { name: 'Review Generation Strategy', icon: 'MessageSquare', category: 'E-commerce Operations' }
];

export default function ServiceBucket({ teamMembers, onAssignService }: ServiceBucketProps) {
  const [selectedService, setSelectedService] = useState<Responsibility | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [assignmentTab, setAssignmentTab] = useState<"team" | "network">("team");

  const categories = Array.from(new Set(AVAILABLE_SERVICES.map(service => service.category)));
  const filteredServices = selectedCategory
    ? AVAILABLE_SERVICES.filter(service => service.category === selectedCategory)
    : AVAILABLE_SERVICES;

  const renderService = (service: Service) => {
    const Icon = Icons[service.icon] as LucideIcon;
    const assignedMembers = teamMembers.filter(member =>
      member.responsibilities?.includes(service.name)
    );

    return (
      <div
        key={service.name}
        className="bg-white rounded-lg border border-slate-200 p-3 group hover:shadow-sm transition-shadow duration-200"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <div className="p-1.5 rounded-md bg-blue-50 text-lysio-blue shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-sm text-slate-900 truncate">{service.name}</h3>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500 truncate">{service.category}</p>
                <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                  {assignedMembers.length} {assignedMembers.length === 1 ? 'member' : 'members'}
                </Badge>
              </div>
            </div>
          </div>
          {assignedMembers.length === 0 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedService(service.name);
                setIsAssignDialogOpen(true);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 h-auto"
            >
              Assign
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedService(service.name);
                setIsAssignDialogOpen(true);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 h-auto"
            >
              Manage
            </Button>
          )}
        </div>
      </div>
    );
  };

  const assignServiceToTeamMember = async (memberId: string, service: Responsibility) => {
    try {
      // First check if the responsibility already exists
      const { data: existingResponsibility, error: checkError } = await supabase
        .from('team_member_responsibilities')
        .select('*')
        .eq('team_member_id', memberId)
        .eq('responsibility', service)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw checkError;
      }

      if (existingResponsibility) {
        toast.error('This service is already assigned to the team member');
        return;
      }

      // If no existing responsibility, proceed with the assignment
      const { error: insertError } = await supabase
        .from('team_member_responsibilities')
        .insert([
          {
            team_member_id: memberId,
            responsibility: service,
          },
        ]);

      if (insertError) throw insertError;

      toast.success('Service assigned successfully');
      onAssignService(memberId, service);
    } catch (error) {
      console.error('Error assigning service:', error);
      toast.error('Failed to assign service');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">All Services</h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-2 -mb-2">
          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            onClick={() => setSelectedCategory(null)}
            className={`text-sm px-3 py-1.5 h-auto rounded-full whitespace-nowrap
              ${selectedCategory === null 
                ? 'bg-lysio-blue text-white hover:bg-blue-600' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "ghost"}
              onClick={() => setSelectedCategory(category as ServiceCategory)}
              className={`text-sm px-3 py-1.5 h-auto rounded-full whitespace-nowrap
                ${selectedCategory === category 
                  ? 'bg-lysio-blue text-white hover:bg-blue-600' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredServices.map(renderService)}
      </div>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-900">
              Assign {selectedService}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Choose from your team members or find the perfect match from the Lysio network.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={assignmentTab} onValueChange={(value) => setAssignmentTab(value as "team" | "network")} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Icons.Users className="w-4 h-4" />
                Team Members
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-2">
                <Icons.Sparkles className="w-4 h-4" />
                Lysio Network
              </TabsTrigger>
            </TabsList>

            <TabsContent value="team" className="mt-0">
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer
                      ${selectedMember === member.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedMember(member.id)}
                  >
                    <Checkbox
                      id={member.id}
                      checked={selectedMember === member.id}
                      onCheckedChange={() => setSelectedMember(member.id)}
                    />
                    <div className="flex flex-col">
                      <label
                        htmlFor={member.id}
                        className="text-sm font-medium text-slate-900 cursor-pointer"
                      >
                        {member.name}
                      </label>
                      <span className="text-xs text-slate-500">{member.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="network" className="mt-0">
              <Card className="border border-blue-100 bg-blue-50/50 p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Icons.Sparkles className="w-5 h-5 text-lysio-blue shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-1">Find your perfect match</h4>
                    <p className="text-sm text-slate-600">
                      We'll match you with verified professionals from our network of 10,000+ agencies and freelancers based on:
                    </p>
                    <ul className="mt-2 space-y-1">
                      <li className="text-sm text-slate-600 flex items-center gap-2">
                        <Icons.Building2 className="w-4 h-4 text-lysio-blue" />
                        Industry experience in your sector
                      </li>
                      <li className="text-sm text-slate-600 flex items-center gap-2">
                        <Icons.MapPin className="w-4 h-4 text-lysio-blue" />
                        Location and timezone alignment
                      </li>
                      <li className="text-sm text-slate-600 flex items-center gap-2">
                        <Icons.DollarSign className="w-4 h-4 text-lysio-blue" />
                        Budget compatibility
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Button 
                className="w-full bg-lysio-blue text-white hover:bg-blue-600 flex items-center justify-center gap-2 h-12"
                onClick={() => {
                  // Handle network search - you can implement this later
                  console.log('Search network');
                }}
              >
                <Icons.Search className="w-4 h-4" />
                Find Matches in Lysio Network
              </Button>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignDialogOpen(false);
                setAssignmentTab("team");
              }}
              className="text-sm text-slate-700"
            >
              Cancel
            </Button>
            {assignmentTab === "team" && (
              <Button
                onClick={async () => {
                  if (selectedMember && selectedService) {
                    await assignServiceToTeamMember(selectedMember, selectedService as Responsibility);
                    setIsAssignDialogOpen(false);
                    setSelectedMember(null);
                    setSelectedService(null);
                    setAssignmentTab("team");
                  }
                }}
                disabled={!selectedMember}
                className="text-sm bg-lysio-blue text-white hover:bg-blue-600"
              >
                Assign Service
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 