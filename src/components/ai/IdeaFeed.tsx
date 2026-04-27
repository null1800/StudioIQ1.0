import { useState } from 'react';
import { ContentIdea } from '@/types';
import { Sparkles, Video, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';

interface IdeaFeedProps {
  ideas: ContentIdea[];
  onGenerateScript?: (ideaId: string) => void;
  onGenerateThumbnail?: (ideaId: string) => void;
}

export function IdeaFeed({ ideas, onGenerateScript, onGenerateThumbnail }: IdeaFeedProps) {
  if (!ideas.length) {
    return (
      <div className="text-center py-12 card text-gray-400">
        No ideas generated yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ideas.map((idea) => (
        <IdeaCard 
          key={idea.id} 
          idea={idea} 
          onGenerateScript={() => onGenerateScript?.(idea.id)}
          onGenerateThumbnail={() => onGenerateThumbnail?.(idea.id)}
        />
      ))}
    </div>
  );
}

function IdeaCard({ idea, onGenerateScript, onGenerateThumbnail }: { idea: ContentIdea, onGenerateScript: () => void, onGenerateThumbnail: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card p-6 bg-dark-800 border-dark-700 hover:border-brand-500/50 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs rounded-full bg-brand-500/10 text-brand-400 font-medium border border-brand-500/20">
              {idea.format}
            </span>
            {idea.estimated_engagement && (
              <span className={`px-2 py-1 text-xs rounded-full font-medium border
                ${idea.estimated_engagement === 'high' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                  idea.estimated_engagement === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                  'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}
              >
                {idea.estimated_engagement.charAt(0).toUpperCase() + idea.estimated_engagement.slice(1)} Engagement
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{idea.title}</h3>
          <p className="text-gray-300 font-medium mb-3 italic">"{idea.hook}"</p>
          <p className="text-gray-400 text-sm line-clamp-2 mb-4">{idea.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {idea.tags?.slice(0, 5).map(tag => (
              <span key={tag} className="text-xs text-gray-500 bg-dark-700 px-2 py-1 rounded">#{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-dark-700 pt-4 mt-2 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
        >
          {expanded ? <><ChevronUp className="w-4 h-4"/> Hide Details</> : <><ChevronDown className="w-4 h-4"/> View Details</>}
        </button>
        
        <div className="flex gap-3">
          <button onClick={onGenerateThumbnail} className="btn-secondary text-sm py-1.5 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Thumbnail (6)
          </button>
          <button onClick={onGenerateScript} className="btn-primary text-sm py-1.5 flex items-center gap-2">
            <Video className="w-4 h-4" />
            Script (8)
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-dark-700 space-y-4 animate-in fade-in slide-in-from-top-2">
          {idea.target_audience && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-1">Target Audience</h4>
              <p className="text-sm text-gray-400">{idea.target_audience}</p>
            </div>
          )}
          {idea.thumbnail_concept && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-1">Thumbnail Concept</h4>
              <p className="text-sm text-gray-400">{idea.thumbnail_concept}</p>
            </div>
          )}
          {idea.script_outline && idea.script_outline.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Script Outline</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                {idea.script_outline.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
