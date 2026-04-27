import { Database } from './supabase';

// Re-export Supabase types
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T];

// User & Authentication Types
export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  tier: SubscriptionTier;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SubscriptionTier = 'free_trial' | 'standard' | 'premium';

// Token Economy Types
export interface TokenBalance {
  user_id: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  last_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'deduction' | 'purchase' | 'bonus' | 'refund';
  feature: TokenFeature | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type TokenFeature = 
  | 'channel_analysis'
  | 'content_ideas'
  | 'script_generation'
  | 'thumbnail_generation'
  | 'production_setup'
  | 'studio_simulation'
  | 'video_preview';

export const TOKEN_COSTS: Record<TokenFeature, number> = {
  channel_analysis: 3,
  content_ideas: 5,
  script_generation: 8,
  thumbnail_generation: 6,
  production_setup: 10,
  studio_simulation: 15,
  video_preview: 25,
};

export const TOKEN_VALUE_USD = 0.02;

// Usage Tracking Types
export interface UsageLog {
  id: string;
  user_id: string;
  feature: TokenFeature;
  tokens_spent: number;
  request_data: Record<string, unknown>;
  response_data: Record<string, unknown> | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

export interface DailyUsage {
  user_id: string;
  date: string;
  channel_analyses: number;
  content_ideas: number;
  thumbnail_concepts: number;
  scripts: number;
  competitor_analyses: number;
  studio_simulations: number;
  video_previews: number;
}

// YouTube Analytics Types
export interface YouTubeChannel {
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
}

export interface YouTubeVideo {
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
}

export interface ChannelAnalysis {
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
  analysis_data: Record<string, unknown>;
  created_at: string;
}

// AI Content Types
export interface ContentIdea {
  id: string;
  user_id: string;
  channel_analysis_id: string | null;
  title: string;
  hook: string;
  description: string;
  target_audience: string | null;
  estimated_engagement: 'low' | 'medium' | 'high' | null;
  format: string;
  tags: string[];
  thumbnail_concept: string | null;
  script_outline: string[] | null;
  created_at: string;
}

export interface Script {
  id: string;
  user_id: string;
  content_idea_id: string | null;
  title: string;
  hook: string;
  intro: string;
  body_sections: ScriptSection[];
  outro: string;
  cta: string;
  estimated_duration: number;
  tone: string;
  keywords: string[];
  created_at: string;
}

export interface ScriptSection {
  heading: string;
  content: string;
  visual_cue: string | null;
  timestamp: string | null;
}

export interface Thumbnail {
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
}

// Studio System Types
export type StudioMode = 'realistic' | 'architectural';

export interface ProductionSetup {
  id: string;
  user_id: string;
  content_idea_id: string | null;
  mode: StudioMode;
  camera_setup: CameraSetup;
  lighting_setup: LightingSetup;
  audio_setup: AudioSetup;
  environment: EnvironmentSetup;
  estimated_budget: BudgetEstimate | null;
  created_at: string;
}

export interface CameraSetup {
  primary_camera: EquipmentRecommendation;
  secondary_cameras: EquipmentRecommendation[];
  lenses: EquipmentRecommendation[];
  supports: EquipmentRecommendation[];
  settings: CameraSettings;
}

export interface CameraSettings {
  resolution: string;
  frame_rate: string;
  codec: string;
  color_profile: string;
}

export interface LightingSetup {
  key_light: EquipmentRecommendation;
  fill_light: EquipmentRecommendation | null;
  back_light: EquipmentRecommendation | null;
  modifiers: EquipmentRecommendation[];
  ambient_lighting: string | null;
  lighting_diagram: string | null;
}

export interface AudioSetup {
  primary_microphone: EquipmentRecommendation;
  backup_microphone: EquipmentRecommendation | null;
  audio_interface: EquipmentRecommendation | null;
  monitoring: EquipmentRecommendation | null;
  acoustic_treatment: string[];
}

export interface EnvironmentSetup {
  room_dimensions: string | null;
  background_design: string | null;
  set_elements: string[];
  virtual_environment: VirtualEnvironment | null;
}

export interface VirtualEnvironment {
  engine: 'unreal' | 'unity' | 'blender';
  scene_description: string;
  camera_paths: string[];
  lighting_grid: string;
  render_settings: Record<string, string>;
}

export interface EquipmentRecommendation {
  name: string;
  type: string;
  price_range: string;
  amazon_url: string | null;
  specs: Record<string, string>;
  alternatives: string[];
}

export interface BudgetEstimate {
  minimum: number;
  recommended: number;
  premium: number;
  currency: string;
}

// Video Preview Types
export interface VideoPreview {
  id: string;
  user_id: string;
  content_idea_id: string;
  status: 'processing' | 'completed' | 'failed';
  storyboard_frames: StoryboardFrame[];
  animation_url: string | null;
  render_settings: RenderSettings;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface StoryboardFrame {
  timestamp: string;
  description: string;
  visual_description: string;
  camera_movement: string | null;
  duration_seconds: number;
}

export interface RenderSettings {
  resolution: string;
  duration_seconds: number;
  style: string;
  quality: 'low' | 'medium' | 'high';
}

// Comparison Engine Types
export interface CompetitorChannel {
  id: string;
  analysis_id: string;
  youtube_channel_id: string;
  similarity_score: number;
  comparison_data: Record<string, unknown>;
  created_at: string;
}

export interface ComparisonMetrics {
  upload_frequency_delta: number;
  engagement_rate_delta: number;
  subscriber_growth_delta: number;
  view_velocity_delta: number;
  content_format_overlap: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  tokens_deducted?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details: Record<string, unknown> | null;
}

// Subscription & Billing Types
export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanLimits {
  tier: SubscriptionTier;
  daily_channel_analyses: number;
  monthly_content_ideas: number | null;
  monthly_scripts: number | null;
  monthly_thumbnails: number | null;
  monthly_video_previews: number | null;
  studio_simulation: boolean;
  architectural_mode: boolean;
  competitor_analysis_depth: 'none' | 'basic' | 'full';
}

export const PLAN_LIMITS: Record<SubscriptionTier, PlanLimits> = {
  free_trial: {
    tier: 'free_trial',
    daily_channel_analyses: 1,
    monthly_content_ideas: 2,
    monthly_scripts: 0,
    monthly_thumbnails: 1,
    monthly_video_previews: 0,
    studio_simulation: false,
    architectural_mode: false,
    competitor_analysis_depth: 'none',
  },
  standard: {
    tier: 'standard',
    daily_channel_analyses: 5,
    monthly_content_ideas: 10,
    monthly_scripts: 5,
    monthly_thumbnails: 10,
    monthly_video_previews: 1,
    studio_simulation: true,
    architectural_mode: false,
    competitor_analysis_depth: 'basic',
  },
  premium: {
    tier: 'premium',
    daily_channel_analyses: 20,
    monthly_content_ideas: null,
    monthly_scripts: null,
    monthly_thumbnails: null,
    monthly_video_previews: 5,
    studio_simulation: true,
    architectural_mode: true,
    competitor_analysis_depth: 'full',
  },
};
