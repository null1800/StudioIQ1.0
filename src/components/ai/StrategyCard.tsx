import { ContentIdea } from '@/types';
import { Sparkles } from 'lucide-react';

interface StrategyCardProps {
  idea: ContentIdea;
  onSelect?: (id: string) => void;
  selected?: boolean;
}

export function StrategyCard({ idea, onSelect, selected }: StrategyCardProps) {
  return (
    <div 
      onClick={() => onSelect?.(idea.id)}
      className={`card p-5 cursor-pointer transition-all duration-200 border-2 ${
        selected ? 'border-brand-500 bg-brand-500/5' : 'border-dark-700 hover:border-brand-500/30'
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-brand-500/20 flex flex-shrink-0 items-center justify-center mt-1">
          <Sparkles className="w-4 h-4 text-brand-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white leading-tight mb-1">{idea.title}</h3>
          <p className="text-xs text-brand-400 uppercase tracking-wider font-medium">{idea.format}</p>
        </div>
      </div>
      
      <div className="pl-11">
        <p className="text-sm text-gray-400 line-clamp-3 mb-3">
          {idea.description}
        </p>
        
        <div className="bg-dark-800 p-3 rounded-lg border border-dark-700">
          <p className="text-xs text-gray-500 mb-1 font-medium">HOOK:</p>
          <p className="text-sm text-gray-300 italic">"{idea.hook}"</p>
        </div>
      </div>
    </div>
  );
}
