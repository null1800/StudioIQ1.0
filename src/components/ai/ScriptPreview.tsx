import { Script } from '@/types';
import { Clock, PlayCircle, FastForward, Square, CheckCircle } from 'lucide-react';

interface ScriptPreviewProps {
  script: Script;
}

export function ScriptPreview({ script }: ScriptPreviewProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden shadow-xl">
      <div className="bg-dark-900 p-6 border-b border-dark-700">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-white">{script.title}</h2>
          <div className="flex items-center gap-2 bg-dark-800 px-3 py-1.5 rounded-lg border border-dark-700 whitespace-nowrap">
            <Clock className="w-4 h-4 text-brand-400" />
            <span className="text-sm font-medium text-gray-300">{formatTime(script.estimated_duration)}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {script.keywords?.map(kw => (
            <span key={kw} className="text-xs bg-dark-800 text-gray-400 px-2 py-1 rounded border border-dark-700">
              {kw}
            </span>
          ))}
          <span className="text-xs bg-brand-500/10 text-brand-400 px-2 py-1 rounded border border-brand-500/20">
            Tone: {script.tone}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <ScriptSection 
          icon={<PlayCircle className="w-5 h-5 text-accent-pink" />}
          title="The Hook (0:00 - 0:15)"
          content={script.hook}
          type="hook"
        />
        
        <ScriptSection 
          icon={<FastForward className="w-5 h-5 text-accent-purple" />}
          title="Introduction"
          content={script.intro}
        />

        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-dark-600 before:to-transparent">
          {script.body_sections.map((section, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-dark-800 bg-dark-700 text-gray-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {idx + 1}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] card p-4 border-dark-700 hover:border-brand-500/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-lg">{section.heading}</h4>
                  {section.timestamp && (
                    <span className="text-xs text-gray-500 bg-dark-900 px-2 py-1 rounded">{section.timestamp}</span>
                  )}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  {section.content}
                </p>
                {section.visual_cue && (
                  <div className="bg-dark-900/50 p-2 rounded text-xs text-brand-300 border border-brand-900/30">
                    <span className="font-semibold text-brand-400 mr-1">VISUAL:</span>
                    {section.visual_cue}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <ScriptSection 
          icon={<Square className="w-5 h-5 text-brand-400" />}
          title="Outro"
          content={script.outro}
        />

        <ScriptSection 
          icon={<CheckCircle className="w-5 h-5 text-green-400" />}
          title="Call to Action"
          content={script.cta}
          type="cta"
        />
      </div>
    </div>
  );
}

function ScriptSection({ 
  icon, 
  title, 
  content, 
  type = 'normal' 
}: { 
  icon: React.ReactNode; 
  title: string; 
  content: string;
  type?: 'hook' | 'cta' | 'normal';
}) {
  const bgClasses = {
    hook: 'bg-accent-pink/5 border-accent-pink/20',
    cta: 'bg-green-500/5 border-green-500/20',
    normal: 'bg-dark-700/30 border-dark-600',
  };

  return (
    <div className={`p-4 rounded-xl border ${bgClasses[type]}`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <p className="text-gray-300 leading-relaxed text-sm md:text-base">
        {content}
      </p>
    </div>
  );
}
