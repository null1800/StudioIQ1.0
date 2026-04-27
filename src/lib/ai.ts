import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import {
  ChannelAnalysis,
  ContentIdea,
  Script,
  Thumbnail,
  ProductionSetup,
  StudioMode,
  YouTubeVideo,
  TokenFeature,
} from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// AI Output Validation Schemas
const ContentIdeaSchema = z.object({
  title: z.string().max(100),
  hook: z.string().max(200),
  description: z.string().max(500),
  target_audience: z.string().optional(),
  estimated_engagement: z.enum(['low', 'medium', 'high']).optional(),
  format: z.string(),
  tags: z.array(z.string()).max(10),
  thumbnail_concept: z.string().optional(),
  script_outline: z.array(z.string()).optional(),
});

const ScriptSchema = z.object({
  title: z.string(),
  hook: z.string(),
  intro: z.string(),
  body_sections: z.array(z.object({
    heading: z.string(),
    content: z.string(),
    visual_cue: z.string().optional(),
    timestamp: z.string().optional(),
  })),
  outro: z.string(),
  cta: z.string(),
  estimated_duration: z.number(),
  tone: z.string(),
  keywords: z.array(z.string()),
});

const ThumbnailSchema = z.object({
  concept_description: z.string(),
  color_scheme: z.array(z.string()).max(5).optional(),
  text_elements: z.array(z.string()).max(3).optional(),
  visual_elements: z.array(z.string()).max(5).optional(),
  emotional_trigger: z.string().optional(),
  composition_notes: z.string().optional(),
});

const EquipmentSchema = z.object({
  name: z.string(),
  type: z.string(),
  price_range: z.string(),
  amazon_url: z.string().optional(),
  specs: z.record(z.string()),
  alternatives: z.array(z.string()).optional(),
});

const ProductionSetupSchema = z.object({
  mode: z.enum(['realistic', 'architectural']),
  camera_setup: z.object({
    primary_camera: EquipmentSchema,
    secondary_cameras: z.array(EquipmentSchema).optional(),
    lenses: z.array(EquipmentSchema).optional(),
    supports: z.array(EquipmentSchema).optional(),
    settings: z.object({
      resolution: z.string(),
      frame_rate: z.string(),
      codec: z.string(),
      color_profile: z.string(),
    }),
  }),
  lighting_setup: z.object({
    key_light: EquipmentSchema,
    fill_light: EquipmentSchema.optional(),
    back_light: EquipmentSchema.optional(),
    modifiers: z.array(EquipmentSchema).optional(),
    ambient_lighting: z.string().optional(),
    lighting_diagram: z.string().optional(),
  }),
  audio_setup: z.object({
    primary_microphone: EquipmentSchema,
    backup_microphone: EquipmentSchema.optional(),
    audio_interface: EquipmentSchema.optional(),
    monitoring: EquipmentSchema.optional(),
    acoustic_treatment: z.array(z.string()).optional(),
  }),
  environment: z.object({
    room_dimensions: z.string().optional(),
    background_design: z.string().optional(),
    set_elements: z.array(z.string()).optional(),
    virtual_environment: z.object({
      engine: z.enum(['unreal', 'unity', 'blender']),
      scene_description: z.string(),
      camera_paths: z.array(z.string()).optional(),
      lighting_grid: z.string(),
      render_settings: z.record(z.string()),
    }).optional(),
  }),
  estimated_budget: z.object({
    minimum: z.number(),
    recommended: z.number(),
    premium: z.number(),
    currency: z.string(),
  }).optional(),
});

export class AIService {
  private async callClaude(
    messages: Anthropic.MessageParam[],
    model: 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307' = 'claude-3-sonnet-20240229'
  ): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        messages,
        temperature: 0.7,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return content.text;
    } catch (error) {
      console.error('Claude API error:', error);
      throw error;
    }
  }

  private parseJSON<T>(text: string): T {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
    let cleanText = jsonMatch ? jsonMatch[1] : text;
    
    // Also try to find just {} or [] if markdown tags are missing
    if (!jsonMatch) {
      const objMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (objMatch) {
        cleanText = objMatch[1];
      }
    }
    
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      console.error('Failed to parse JSON:', cleanText);
      throw new Error('Invalid JSON response from AI');
    }
  }

  private async generateWithRetry<T>(
    prompt: string,
    schema?: z.ZodType<T>,
    initialModel: 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307' = 'claude-3-sonnet-20240229'
  ): Promise<T> {
    let attempts = 0;
    const maxAttempts = 3;
    let currentPrompt = prompt;
    let currentModel = initialModel;
    let hasFallbackOccurred = false;

    while (attempts < maxAttempts) {
      try {
        const response = await this.callClaude([{ role: 'user', content: currentPrompt }], currentModel);
        const parsed = this.parseJSON<T>(response);
        
        if (schema) {
          const result = schema.safeParse(parsed);
          if (!result.success) {
            throw new Error(`Validation failed: ${result.error.message}`);
          }
          return result.data;
        }
        
        return parsed;
      } catch (error) {
        attempts++;
        console.warn(`AI generation attempt ${attempts} failed:`, error instanceof Error ? error.message : String(error));
        
        if (attempts >= maxAttempts && !hasFallbackOccurred && currentModel !== 'claude-3-haiku-20240307') {
          console.log('Falling back to Haiku for generation...');
          currentModel = 'claude-3-haiku-20240307';
          currentPrompt = currentPrompt + '\n\nIMPORTANT: You previously failed to return correct format. Return ONLY valid JSON matching the EXACT requested structure. Do not include any other text.';
          attempts = 0; // Reset attempts for Haiku fallback
          hasFallbackOccurred = true;
          continue;
        }
        
        if (attempts >= maxAttempts) {
          throw new Error('All AI generation attempts failed after retries and fallbacks.');
        }
        
        currentPrompt = currentPrompt + '\n\nYour previous response was invalid. Please ensure your response is ONLY valid JSON with no markdown formatting or extra conversational text.';
      }
    }
    
    throw new Error('Unexpected end of retry loop');
  }

  async generateContentIdeas(
    analysis: ChannelAnalysis,
    count: number = 5
  ): Promise<Partial<ContentIdea>[]> {
    const prompt = `
      Based on the following YouTube channel analysis, generate ${count} high-performing video content ideas.
      
      Channel Niche: ${analysis.niche || 'General'}
      Content Style: ${analysis.content_style || 'Mixed'}
      Top Performing Topics: ${analysis.top_performing_topics?.join(', ') || 'N/A'}
      Best Upload Times: ${analysis.best_upload_times?.join(', ') || 'N/A'}
      Growth Signals: ${analysis.growth_signals?.join(', ') || 'N/A'}
      Average Views: ${analysis.avg_views_per_video?.toLocaleString() || 'N/A'}
      Engagement Rate: ${analysis.engagement_rate?.toFixed(2) || 'N/A'}%
      
      For each idea, provide:
      1. A catchy title (max 60 chars)
      2. A strong hook (first 10 seconds)
      3. Brief description of the video concept
      4. Target audience segment
      5. Estimated engagement level (low/medium/high)
      6. Recommended format (tutorial, vlog, review, etc.)
      7. 5-10 relevant tags
      8. Thumbnail concept description
      9. Brief script outline (3-5 bullet points)
      
      Return ONLY a JSON array of objects matching this structure:
      [
        {
          "title": "...",
          "hook": "...",
          "description": "...",
          "target_audience": "...",
          "estimated_engagement": "low",
          "format": "...",
          "tags": ["..."],
          "thumbnail_concept": "...",
          "script_outline": ["..."]
        }
      ]
    `;

    const ideas = await this.generateWithRetry<unknown[]>(prompt, z.array(ContentIdeaSchema));
    return ideas as Partial<ContentIdea>[];
  }

  async generateScript(
    idea: ContentIdea,
    tone: string = 'conversational',
    duration: number = 600
  ): Promise<Partial<Script>> {
    const prompt = `
      Write a complete video script based on this content idea:
      
      Title: ${idea.title}
      Hook: ${idea.hook}
      Description: ${idea.description}
      Format: ${idea.format}
      Target Audience: ${idea.target_audience || 'General'}
      
      Requirements:
      - Target duration: ${duration} seconds
      - Tone: ${tone}
      - Include natural speech patterns, not just written text
      - Add visual cues for B-roll, graphics, on-screen text
      - Strong call-to-action at the end
      
      Return ONLY a JSON object with this structure:
      {
        "title": "string",
        "hook": "string (attention-grabbing opening line)",
        "intro": "string (first 30 seconds, set up the video)",
        "body_sections": [
          {
            "heading": "string (section title)",
            "content": "string (spoken content)",
            "visual_cue": "string (what to show)",
            "timestamp": "string (approximate time)"
          }
        ],
        "outro": "string (wrap up)",
        "cta": "string (call-to-action)",
        "estimated_duration": ${duration},
        "tone": "${tone}",
        "keywords": ["string"]
      }
    `;

    const script = await this.generateWithRetry<unknown>(prompt, ScriptSchema);
    return script as Partial<Script>;
  }

  async generateThumbnail(
    idea: ContentIdea
  ): Promise<Partial<Thumbnail>> {
    const prompt = `
      Design a high-CTR thumbnail concept for this video:
      
      Title: ${idea.title}
      Hook: ${idea.hook}
      Format: ${idea.format}
      Target Audience: ${idea.target_audience || 'General'}
      
      Requirements:
      - Must be readable at small sizes
      - Emotional trigger that drives clicks
      - Clear focal point
      - Limited text (max 3 words ideally)
      - High contrast colors
      
      Return ONLY a JSON object with this structure:
      {
        "concept_description": "string (detailed visual description)",
        "color_scheme": ["string"],
        "text_elements": ["string"],
        "visual_elements": ["string"],
        "emotional_trigger": "string",
        "composition_notes": "string"
      }
    `;

    // Thumbnails use Haiku initially since it's simpler
    const thumbnail = await this.generateWithRetry<unknown>(prompt, ThumbnailSchema, 'claude-3-haiku-20240307');
    return thumbnail as Partial<Thumbnail>;
  }

  async generateProductionSetup(
    idea: ContentIdea,
    mode: StudioMode,
    budget: 'budget' | 'mid' | 'premium' = 'mid'
  ): Promise<Partial<ProductionSetup>> {
    const isArchitectural = mode === 'architectural';
    
    const prompt = `
      Create a detailed production setup for this video:
      
      Title: ${idea.title}
      Format: ${idea.format}
      Budget Level: ${budget}
      Studio Mode: ${isArchitectural ? 'Architectural/Unreal Engine Virtual Studio' : 'Realistic Physical Studio'}
      
      ${isArchitectural 
        ? 'Focus on: Virtual environment design, Unreal Engine scene composition, camera paths, lighting grid, render settings for cinematic quality.'
        : 'Focus on: Physical camera equipment, real lighting rigs, audio capture, acoustic treatment, set design.'
      }
      
      Return ONLY a JSON object with this structure:
      {
        "mode": "${mode}",
        "camera_setup": {
          "primary_camera": { "name": "string", "type": "string", "price_range": "string", "specs": {}, "alternatives": [] },
          "secondary_cameras": [],
          "lenses": [],
          "supports": [],
          "settings": { "resolution": "string", "frame_rate": "string", "codec": "string", "color_profile": "string" }
        },
        "lighting_setup": {
          "key_light": { "name": "string", "type": "string", "price_range": "string", "specs": {} },
          "fill_light": { "name": "string", "type": "string", "price_range": "string", "specs": {} },
          "back_light": { "name": "string", "type": "string", "price_range": "string", "specs": {} },
          "modifiers": [],
          "ambient_lighting": "string",
          "lighting_diagram": "string"
        },
        "audio_setup": {
          "primary_microphone": { "name": "string", "type": "string", "price_range": "string", "specs": {} },
          "backup_microphone": { "name": "string", "type": "string", "price_range": "string", "specs": {} },
          "audio_interface": { "name": "string", "type": "string", "price_range": "string", "specs": {} },
          "monitoring": { "name": "string", "type": "string", "price_range": "string", "specs": {} },
          "acoustic_treatment": []
        },
        "environment": {
          "room_dimensions": "string",
          "background_design": "string",
          "set_elements": [],
          ${isArchitectural ? `"virtual_environment": { "engine": "unreal", "scene_description": "string", "camera_paths": [], "lighting_grid": "string", "render_settings": {} }` : ''}
        },
        "estimated_budget": { "minimum": 0, "recommended": 0, "premium": 0, "currency": "USD" }
      }
    `;

    const setup = await this.generateWithRetry<unknown>(prompt, ProductionSetupSchema);
    return setup as Partial<ProductionSetup>;
  }

  async generateCompetitorInsights(
    analysis: ChannelAnalysis,
    competitors: { title: string; metrics: Record<string, number> }[]
  ): Promise<{
    opportunities: string[];
    threats: string[];
    recommendations: string[];
    differentiation_strategy: string;
  }> {
    const prompt = `
      Analyze competitive positioning for this channel:
      
      Channel Analysis:
      - Niche: ${analysis.niche}
      - Content Style: ${analysis.content_style}
      - Avg Views: ${analysis.avg_views_per_video}
      - Engagement: ${analysis.engagement_rate}%
      - Growth Signals: ${analysis.growth_signals?.join(', ')}
      
      Competitors:
      ${competitors.map(c => `- ${c.title}: ${JSON.stringify(c.metrics)}`).join('\n')}
      
      Provide strategic insights:
      1. Key opportunities (gaps in market)
      2. Potential threats (competitor strengths)
      3. Actionable recommendations
      4. Differentiation strategy
      
      Return ONLY a JSON object:
      {
        "opportunities": ["string"],
        "threats": ["string"],
        "recommendations": ["string"],
        "differentiation_strategy": "string"
      }
    `;

    return this.generateWithRetry(prompt, z.object({
      opportunities: z.array(z.string()),
      threats: z.array(z.string()),
      recommendations: z.array(z.string()),
      differentiation_strategy: z.string()
    }));
  }

  async analyzeVideoPerformance(
    videos: YouTubeVideo[]
  ): Promise<{
    patterns: string[];
    recommendations: string[];
    outliers: { title: string; reason: string }[];
  }> {
    const videoData = videos.slice(0, 20).map(v => ({
      title: v.title,
      views: v.view_count,
      likes: v.like_count,
      comments: v.comment_count,
      published: v.published_at,
    }));

    const prompt = `
      Analyze these video performance patterns:
      ${JSON.stringify(videoData, null, 2)}
      
      Identify:
      1. Performance patterns (what's working)
      2. Strategic recommendations
      3. Outlier videos (over/under performers) with reasons
      
      Return ONLY JSON:
      {
        "patterns": ["string"],
        "recommendations": ["string"],
        "outliers": [{ "title": "string", "reason": "string" }]
      }
    `;

    return this.generateWithRetry(prompt, z.object({
      patterns: z.array(z.string()),
      recommendations: z.array(z.string()),
      outliers: z.array(z.object({
        title: z.string(),
        reason: z.string()
      }))
    }), 'claude-3-haiku-20240307');
  }

  async generateInteractiveQuestions(
    analysis: ChannelAnalysis
  ): Promise<{
    questions: { id: string; question: string; options: string[]; type: 'single' | 'multiple' }[];
  }> {
    const prompt = `
      Generate 3-5 adaptive questions to better understand the creator's goals.
      
      Channel Context:
      - Niche: ${analysis.niche}
      - Style: ${analysis.content_style}
      - Growth Signals: ${analysis.growth_signals?.join(', ')}
      
      Questions should cover:
      1. Content direction preferences
      2. Budget/production level
      3. Audience targeting
      4. Production style preference
      
      Return ONLY JSON:
      {
        "questions": [
          {
            "id": "string",
            "question": "string",
            "options": ["string"],
            "type": "single"
          }
        ]
      }
    `;

    return this.generateWithRetry(prompt, z.object({
      questions: z.array(z.object({
        id: z.string(),
        question: z.string(),
        options: z.array(z.string()),
        type: z.enum(['single', 'multiple'])
      }))
    }), 'claude-3-haiku-20240307');
  }
}

export const aiService = new AIService();
