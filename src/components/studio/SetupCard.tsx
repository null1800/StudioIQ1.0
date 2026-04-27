import { ExternalLink, RefreshCw } from 'lucide-react';

interface EquipmentItem {
  name: string;
  type: string;
  price_range: string;
  amazon_url?: string;
  specs: Record<string, string>;
  alternatives?: string[];
}

interface SetupCardProps {
  title: string;
  item: EquipmentItem;
}

export function SetupCard({ title, item }: SetupCardProps) {
  if (!item) return null;
  
  return (
    <div className="card p-5 border-dark-700 hover:border-brand-500/30 transition-colors group">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{title}</h4>
          <h3 className="text-lg font-bold text-white leading-tight">{item.name}</h3>
          <p className="text-sm text-brand-400 mt-1">{item.price_range}</p>
        </div>
        {item.amazon_url && (
          <a 
            href={item.amazon_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 bg-dark-800 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      <div className="space-y-2 mt-4">
        {Object.entries(item.specs || {}).map(([key, value]) => (
          <div key={key} className="flex justify-between text-sm items-end border-b border-dark-700/50 pb-1 border-dashed">
            <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
            <span className="text-gray-300 text-right max-w-[60%]">{value}</span>
          </div>
        ))}
      </div>

      {item.alternatives && item.alternatives.length > 0 && (
        <div className="mt-4 pt-4 border-t border-dark-700">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-gray-400 uppercase">
            <RefreshCw className="w-3 h-3" />
            <span>Alternatives</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {item.alternatives.map((alt, idx) => (
              <span key={idx} className="text-xs bg-dark-800 text-gray-300 px-2 py-1 rounded border border-dark-600">
                {alt}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
