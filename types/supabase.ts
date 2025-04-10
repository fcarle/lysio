export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      case_studies: {
        Row: {
          business_type: Database["public"]["Enums"]["business_type"]
          city: string
          client_description: string
          client_industry: string
          client_name: string
          client_size: Database["public"]["Enums"]["client_size"]
          country: string
          created_at: string
          id: string
          logo_url: string | null
          overview: string
          provider_id: string | null
          results: string
          service: string
          target_audience: string | null
          target_company_size:
            | Database["public"]["Enums"]["target_company_size"]
            | null
          target_industry: string | null
          target_location: string | null
          updated_at: string
        }
        Insert: {
          business_type: Database["public"]["Enums"]["business_type"]
          city: string
          client_description: string
          client_industry: string
          client_name: string
          client_size: Database["public"]["Enums"]["client_size"]
          country: string
          created_at?: string
          id?: string
          logo_url?: string | null
          overview: string
          provider_id?: string | null
          results: string
          service: string
          target_audience?: string | null
          target_company_size?:
            | Database["public"]["Enums"]["target_company_size"]
            | null
          target_industry?: string | null
          target_location?: string | null
          updated_at?: string
        }
        Update: {
          business_type?: Database["public"]["Enums"]["business_type"]
          city?: string
          client_description?: string
          client_industry?: string
          client_name?: string
          client_size?: Database["public"]["Enums"]["client_size"]
          country?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          overview?: string
          provider_id?: string | null
          results?: string
          service?: string
          target_audience?: string | null
          target_company_size?:
            | Database["public"]["Enums"]["target_company_size"]
            | null
          target_industry?: string | null
          target_location?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          about: string | null
          budget: number | null
          budget_frequency: string | null
          created_at: string
          currency: string | null
          email: string
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          marketing_goal: string | null
          name: string
          targeting: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          about?: string | null
          budget?: number | null
          budget_frequency?: string | null
          created_at?: string
          currency?: string | null
          email: string
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          marketing_goal?: string | null
          name: string
          targeting?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          about?: string | null
          budget?: number | null
          budget_frequency?: string | null
          created_at?: string
          currency?: string | null
          email?: string
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          marketing_goal?: string | null
          name?: string
          targeting?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accept_success_fee: boolean | null
          allow_promotion: boolean | null
          avoided_countries: string[] | null
          avoided_industries: string[] | null
          based_city: string | null
          based_country: string | null
          company_size: string | null
          created_at: string
          id: string
          interested_in_paid_promotion: boolean | null
          logo_url: string | null
          payment_terms: string | null
          preferred_currency: string | null
          pricing_models: string[] | null
          profile_photo_url: string | null
          provider_type: string | null
          required_client_language: string | null
          role: string
          services: Json | null
          show_logo: boolean | null
          specialized_industries: string[] | null
          spoken_languages: string[] | null
          typical_clients: string[] | null
          updated_at: string | null
          user_id: string
          website_url: string | null
          working_countries: string[] | null
          years_of_experience: number | null
        }
        Insert: {
          accept_success_fee?: boolean | null
          allow_promotion?: boolean | null
          avoided_countries?: string[] | null
          avoided_industries?: string[] | null
          based_city?: string | null
          based_country?: string | null
          company_size?: string | null
          created_at?: string
          id?: string
          interested_in_paid_promotion?: boolean | null
          logo_url?: string | null
          payment_terms?: string | null
          preferred_currency?: string | null
          pricing_models?: string[] | null
          profile_photo_url?: string | null
          provider_type?: string | null
          required_client_language?: string | null
          role: string
          services?: Json | null
          show_logo?: boolean | null
          specialized_industries?: string[] | null
          spoken_languages?: string[] | null
          typical_clients?: string[] | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
          working_countries?: string[] | null
          years_of_experience?: number | null
        }
        Update: {
          accept_success_fee?: boolean | null
          allow_promotion?: boolean | null
          avoided_countries?: string[] | null
          avoided_industries?: string[] | null
          based_city?: string | null
          based_country?: string | null
          company_size?: string | null
          created_at?: string
          id?: string
          interested_in_paid_promotion?: boolean | null
          logo_url?: string | null
          payment_terms?: string | null
          preferred_currency?: string | null
          pricing_models?: string[] | null
          profile_photo_url?: string | null
          provider_type?: string | null
          required_client_language?: string | null
          role?: string
          services?: Json | null
          show_logo?: boolean | null
          specialized_industries?: string[] | null
          spoken_languages?: string[] | null
          typical_clients?: string[] | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
          working_countries?: string[] | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      project_budget_breakdown: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          project_id: string | null
          spent: number
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          id?: string
          project_id?: string | null
          spent?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          project_id?: string | null
          spent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_budget_breakdown_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["project_priority"]
          project_id: string | null
          required_service: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["project_priority"]
          project_id?: string | null
          required_service?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["project_priority"]
          project_id?: string | null
          required_service?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_team_members: {
        Row: {
          created_at: string
          id: string
          project_id: string | null
          role: string
          team_member_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string | null
          role: string
          team_member_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string | null
          role?: string
          team_member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_team_members_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      project_timeline_events: {
        Row: {
          created_at: string
          date: string
          description: string | null
          id: string
          project_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          id?: string
          project_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          project_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_timeline_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget_spent: number
          budget_total: number
          category: string
          company_id: string | null
          created_at: string
          currency: string
          deadline: string | null
          description: string | null
          id: string
          is_recurring: boolean
          name: string
          priority: Database["public"]["Enums"]["project_priority"]
          progress: number
          repeat_interval: string | null
          status: Database["public"]["Enums"]["project_status"]
          team_size: number
          updated_at: string
        }
        Insert: {
          budget_spent?: number
          budget_total?: number
          category: string
          company_id?: string | null
          created_at?: string
          currency?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_recurring?: boolean
          name: string
          priority?: Database["public"]["Enums"]["project_priority"]
          progress?: number
          repeat_interval?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          team_size?: number
          updated_at?: string
        }
        Update: {
          budget_spent?: number
          budget_total?: number
          category?: string
          company_id?: string | null
          created_at?: string
          currency?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_recurring?: boolean
          name?: string
          priority?: Database["public"]["Enums"]["project_priority"]
          progress?: number
          repeat_interval?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          team_size?: number
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          team_member_id: string | null
          token: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          team_member_id?: string | null
          token: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          team_member_id?: string | null
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_permissions: {
        Row: {
          created_at: string
          id: string
          permission: Database["public"]["Enums"]["permission"]
          team_member_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission: Database["public"]["Enums"]["permission"]
          team_member_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission?: Database["public"]["Enums"]["permission"]
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_member"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_responsibilities: {
        Row: {
          created_at: string
          id: string
          responsibility: Database["public"]["Enums"]["responsibility"]
          team_member_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          responsibility: Database["public"]["Enums"]["responsibility"]
          team_member_id: string
        }
        Update: {
          created_at?: string
          id?: string
          responsibility?: Database["public"]["Enums"]["responsibility"]
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_member"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_services: {
        Row: {
          created_at: string | null
          id: string
          service_id: string
          team_member_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          service_id: string
          team_member_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          service_id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_services_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["team_member_role"]
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          id?: string
          role?: Database["public"]["Enums"]["team_member_role"]
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["team_member_role"]
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_company_owner: {
        Args: {
          company_uuid: string
        }
        Returns: boolean
      }
      is_invitation_valid: {
        Args: {
          token: string
        }
        Returns: boolean
      }
    }
    Enums: {
      business_type: "b2b" | "b2c" | "d2c"
      client_size:
        | "1-10"
        | "11-50"
        | "51-200"
        | "201-500"
        | "501-1000"
        | "1000+"
      permission:
        | "view_dashboard"
        | "view_projects"
        | "manage_projects"
        | "view_team"
        | "manage_team"
        | "view_settings"
        | "manage_settings"
        | "view_analytics"
        | "manage_analytics"
        | "use_ai_chat"
        | "invite_team_members"
        | "view_tasks"
        | "manage_tasks"
        | "view_all_tasks"
        | "manage_services"
        | "view_services"
        | "view_assigned_only"
      project_priority: "high" | "medium" | "low"
      project_status: "in-progress" | "completed" | "on-hold"
      responsibility:
        | "Google Ads"
        | "Meta Ads"
        | "LinkedIn Ads"
        | "TikTok Ads"
        | "YouTube Ads"
        | "Programmatic Advertising"
        | "Retargeting Campaigns"
        | "Conversion Rate Optimization"
        | "Bing Ads"
        | "Apple Search Ads"
        | "Spotify Ads"
        | "Native Advertising"
        | "Display Advertising"
        | "Video Advertising"
        | "Amazon PPC"
        | "Amazon SEO"
        | "Amazon Listing Optimization"
        | "Amazon Brand Store"
        | "Amazon A+ Content"
        | "Amazon Inventory Management"
        | "Amazon FBA Strategy"
        | "Walmart Marketplace"
        | "eBay Optimization"
        | "Etsy Shop Management"
        | "Shopify Store Management"
        | "WooCommerce Management"
        | "BigCommerce Optimization"
        | "Pinterest Marketing"
        | "Pinterest SEO"
        | "Pinterest Ad Campaigns"
        | "Pinterest Content Strategy"
        | "Instagram Marketing"
        | "Instagram Content Creation"
        | "Instagram Story Strategy"
        | "Instagram Reels Production"
        | "Instagram Shop Setup"
        | "TikTok Content Creation"
        | "TikTok Trend Analysis"
        | "TikTok Shop Management"
        | "TikTok Live Strategy"
        | "LinkedIn Company Page Management"
        | "LinkedIn Content Strategy"
        | "LinkedIn Lead Generation"
        | "LinkedIn Personal Branding"
        | "LinkedIn Sales Navigator"
        | "Facebook Page Management"
        | "Facebook Group Management"
        | "Facebook Marketplace Strategy"
        | "Facebook Shop Setup"
        | "Meta Business Suite Management"
        | "YouTube Channel Management"
        | "YouTube SEO"
        | "YouTube Shorts Strategy"
        | "YouTube Community Management"
        | "YouTube Monetization Strategy"
        | "Twitter Marketing"
        | "Twitter Ads Management"
        | "Twitter Content Strategy"
        | "Twitter Community Building"
        | "Snapchat Marketing"
        | "Snapchat AR Filters"
        | "Snapchat Ads Management"
        | "Discord Community Management"
        | "Twitch Channel Management"
        | "Reddit Marketing"
        | "Telegram Channel Management"
        | "On-Page SEO"
        | "Off-Page SEO"
        | "Technical SEO"
        | "SEO Audits"
        | "Local SEO"
        | "SEO Content Planning"
        | "Google Business Profile Optimization"
        | "Local Citation Building"
        | "Review Management"
        | "Google Analytics 4"
        | "Facebook Analytics"
        | "Data Visualization"
        | "Custom Dashboard Creation"
        | "Conversion Tracking Setup"
        | "Heat Map Analysis"
        | "User Behavior Analysis"
        | "Tag Management"
        | "UTM Setup & Management"
        | "Pixel Implementation"
        | "Blog Writing"
        | "Website Copywriting"
        | "Email Campaign Copy"
        | "Sales Copy"
        | "Video Scriptwriting"
        | "Case Studies"
        | "Podcast Production & Strategy"
        | "Webinar Management"
        | "Online Course Creation"
        | "Ebook Writing & Design"
        | "Infographic Design"
        | "White Paper Development"
        | "Product Documentation"
        | "Brand Identity"
        | "Ad Creative"
        | "Web Design"
        | "Social Media Design"
        | "Pitch Deck Design"
        | "Print Design"
        | "Product Photography"
        | "Motion Graphics"
        | "UI/UX Design"
        | "App Design"
        | "Video Production"
        | "Animation"
        | "Podcast Production"
        | "Voiceover Work"
        | "Video Editing"
        | "Audio Editing"
        | "Live Streaming"
        | "Sound Design"
        | "Newsletter Creation"
        | "Email Funnels"
        | "Campaign Strategy"
        | "List Growth Strategy"
        | "Email Automation"
        | "Email Template Design"
        | "Email Deliverability"
        | "A/B Testing"
        | "Website Development"
        | "Landing Page Creation"
        | "Analytics Setup"
        | "CRM Integration"
        | "Funnel Building"
        | "API Integration"
        | "Marketing Automation"
        | "App Store Optimization (ASO)"
        | "Mobile App Marketing"
        | "Marketing Strategy"
        | "Growth Hacking"
        | "Marketing Audits"
        | "Attribution Modeling"
        | "Competitor Research"
        | "Media Planning"
        | "SaaS Marketing"
        | "B2B Lead Generation"
        | "Account-Based Marketing (ABM)"
        | "Influencer Marketing Strategy"
        | "Affiliate Program Management"
        | "Shopping Feed Optimization"
        | "Marketplace Integration"
        | "Order Management"
        | "Inventory Sync"
        | "Customer Service Setup"
        | "Returns Management"
        | "Cart Abandonment Strategy"
        | "Cross-sell Strategy"
        | "Upsell Implementation"
        | "Customer Loyalty Programs"
        | "Gift Card Programs"
        | "Review Generation Strategy"
      target_company_size: "small" | "medium" | "large"
      team_member_role: "owner" | "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
