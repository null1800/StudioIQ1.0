export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          tier: string;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          tier?: string;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          tier?: string;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      token_balances: {
        Row: {
          user_id: string;
          balance: number;
          lifetime_earned: number;
          lifetime_spent: number;
          last_reset_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          balance?: number;
          lifetime_earned?: number;
          lifetime_spent?: number;
          last_reset_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          balance?: number;
          lifetime_earned?: number;
          lifetime_spent?: number;
          last_reset_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      token_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: string;
          feature: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: string;
          feature?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: string;
          feature?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      usage_logs: {
        Row: {
          id: string;
          user_id: string;
          feature: string;
          tokens_spent: number;
          request_data: Json;
          response_data: Json | null;
          success: boolean;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          feature: string;
          tokens_spent: number;
          request_data?: Json;
          response_data?: Json | null;
          success?: boolean;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          feature?: string;
          tokens_spent?: number;
          request_data?: Json;
          response_data?: Json | null;
          success?: boolean;
          error_message?: string | null;
          created_at?: string;
        };
      };
      youtube_channels: {
        Row: {
          id: string;
          youtube_id: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          subscriber_count: number | null;
          video_count: number;
          view_count: number;
          custom_url: string | null;
          country: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          youtube_id: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          subscriber_count?: number | null;
          video_count?: number;
          view_count?: number;
          custom_url?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          youtube_id?: string;
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          subscriber_count?: number | null;
          video_count?: number;
          view_count?: number;
          custom_url?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      youtube_videos: {
        Row: {
          id: string;
          youtube_id: string;
          channel_id: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          published_at: string;
          view_count: number;
          like_count: number | null;
          comment_count: number | null;
          duration: string | null;
          tags: string[] | null;
          category_id: string | null;
          fetched_at: string;
        };
        Insert: {
          id?: string;
          youtube_id: string;
          channel_id: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          published_at: string;
          view_count?: number;
          like_count?: number | null;
          comment_count?: number | null;
          duration?: string | null;
          tags?: string[] | null;
          category_id?: string | null;
          fetched_at?: string;
        };
        Update: {
          id?: string;
          youtube_id?: string;
          channel_id?: string;
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          published_at?: string;
          view_count?: number;
          like_count?: number | null;
          comment_count?: number | null;
          duration?: string | null;
          tags?: string[] | null;
          category_id?: string | null;
          fetched_at?: string;
        };
      };
      channel_analyses: {
        Row: {
          id: string;
          user_id: string;
          channel_id: string;
          niche: string | null;
          content_style: string | null;
          upload_frequency: number | null;
          avg_views_per_video: number | null;
          engagement_rate: number | null;
          growth_signals: string[] | null;
          top_performing_topics: string[] | null;
          best_upload_times: string[] | null;
          analysis_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          channel_id: string;
          niche?: string | null;
          content_style?: string | null;
          upload_frequency?: number | null;
          avg_views_per_video?: number | null;
          engagement_rate?: number | null;
          growth_signals?: string[] | null;
          top_performing_topics?: string[] | null;
          best_upload_times?: string[] | null;
          analysis_data?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          channel_id?: string;
          niche?: string | null;
          content_style?: string | null;
          upload_frequency?: number | null;
          avg_views_per_video?: number | null;
          engagement_rate?: number | null;
          growth_signals?: string[] | null;
          top_performing_topics?: string[] | null;
          best_upload_times?: string[] | null;
          analysis_data?: Json;
          created_at?: string;
        };
      };
      content_ideas: {
        Row: {
          id: string;
          user_id: string;
          channel_analysis_id: string | null;
          title: string;
          hook: string;
          description: string;
          target_audience: string | null;
          estimated_engagement: string | null;
          format: string;
          tags: string[];
          thumbnail_concept: string | null;
          script_outline: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          channel_analysis_id?: string | null;
          title: string;
          hook: string;
          description: string;
          target_audience?: string | null;
          estimated_engagement?: string | null;
          format?: string;
          tags?: string[];
          thumbnail_concept?: string | null;
          script_outline?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          channel_analysis_id?: string | null;
          title?: string;
          hook?: string;
          description?: string;
          target_audience?: string | null;
          estimated_engagement?: string | null;
          format?: string;
          tags?: string[];
          thumbnail_concept?: string | null;
          script_outline?: string[] | null;
          created_at?: string;
        };
      };
      scripts: {
        Row: {
          id: string;
          user_id: string;
          content_idea_id: string | null;
          title: string;
          hook: string;
          intro: string;
          body_sections: Json;
          outro: string;
          cta: string;
          estimated_duration: number;
          tone: string;
          keywords: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_idea_id?: string | null;
          title: string;
          hook: string;
          intro: string;
          body_sections?: Json;
          outro: string;
          cta: string;
          estimated_duration: number;
          tone: string;
          keywords?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_idea_id?: string | null;
          title?: string;
          hook?: string;
          intro?: string;
          body_sections?: Json;
          outro?: string;
          cta?: string;
          estimated_duration?: number;
          tone?: string;
          keywords?: string[];
          created_at?: string;
        };
      };
      thumbnails: {
        Row: {
          id: string;
          user_id: string;
          content_idea_id: string | null;
          concept_description: string;
          color_scheme: string[] | null;
          text_elements: string[] | null;
          visual_elements: string[] | null;
          emotional_trigger: string | null;
          composition_notes: string | null;
          reference_urls: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_idea_id?: string | null;
          concept_description: string;
          color_scheme?: string[] | null;
          text_elements?: string[] | null;
          visual_elements?: string[] | null;
          emotional_trigger?: string | null;
          composition_notes?: string | null;
          reference_urls?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_idea_id?: string | null;
          concept_description?: string;
          color_scheme?: string[] | null;
          text_elements?: string[] | null;
          visual_elements?: string[] | null;
          emotional_trigger?: string | null;
          composition_notes?: string | null;
          reference_urls?: string[] | null;
          created_at?: string;
        };
      };
      production_setups: {
        Row: {
          id: string;
          user_id: string;
          content_idea_id: string | null;
          mode: string;
          camera_setup: Json;
          lighting_setup: Json;
          audio_setup: Json;
          environment: Json;
          estimated_budget: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_idea_id?: string | null;
          mode: string;
          camera_setup: Json;
          lighting_setup: Json;
          audio_setup: Json;
          environment: Json;
          estimated_budget?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_idea_id?: string | null;
          mode?: string;
          camera_setup?: Json;
          lighting_setup?: Json;
          audio_setup?: Json;
          environment?: Json;
          estimated_budget?: Json | null;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string;
          stripe_customer_id: string;
          tier: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id: string;
          stripe_customer_id: string;
          tier: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string;
          stripe_customer_id?: string;
          tier?: string;
          status?: string;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      competitor_channels: {
        Row: {
          id: string;
          analysis_id: string;
          youtube_channel_id: string;
          similarity_score: number;
          comparison_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          youtube_channel_id: string;
          similarity_score: number;
          comparison_data?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          analysis_id?: string;
          youtube_channel_id?: string;
          similarity_score?: number;
          comparison_data?: Json;
          created_at?: string;
        };
      };
      video_previews: {
        Row: {
          id: string;
          user_id: string;
          content_idea_id: string;
          status: string;
          storyboard_frames: Json;
          animation_url: string | null;
          render_settings: Json;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_idea_id: string;
          status?: string;
          storyboard_frames?: Json;
          animation_url?: string | null;
          render_settings?: Json;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_idea_id?: string;
          status?: string;
          storyboard_frames?: Json;
          animation_url?: string | null;
          render_settings?: Json;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
