import { ProductionSetup } from '@/types';
import { Camera, Mic, Lightbulb, Box, CheckCircle } from 'lucide-react';
import { SetupCard } from './SetupCard';

interface StudioViewportProps {
  setup: ProductionSetup;
}

export function StudioViewport({ setup }: StudioViewportProps) {
  const isArch = setup.mode === 'architectural';

  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <div className="card p-6 bg-gradient-to-r from-dark-800 to-dark-900 border-dark-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isArch ? 'Virtual Studio Configuration' : 'Physical Studio Setup'}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full text-sm font-medium uppercase tracking-wider">
                {setup.mode}
              </span>
              {setup.estimated_budget && (
                <span className="px-3 py-1 bg-dark-700 text-gray-300 border border-dark-600 rounded-full text-sm font-medium">
                  Est. Budget: {setup.estimated_budget.currency} {setup.estimated_budget.recommended.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="btn-secondary text-sm">Download PDF</button>
            <button className="btn-primary text-sm">Buy Equipment</button>
          </div>
        </div>

        {isArch && setup.environment.virtual_environment && (
          <div className="p-4 bg-accent-purple/10 border border-accent-purple/20 rounded-lg">
            <h3 className="text-accent-purple font-semibold mb-2 flex items-center gap-2">
              <Box className="w-4 h-4" /> 
              Engine: {setup.environment.virtual_environment.engine.toUpperCase()}
            </h3>
            <p className="text-gray-300 text-sm">
              {setup.environment.virtual_environment.scene_description}
            </p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Camera Setup */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-dark-700 pb-2">
            <Camera className="w-5 h-5 text-brand-400" />
            <h3 className="text-lg font-semibold text-white">Camera & Video</h3>
          </div>
          
          <SetupCard 
            title="Primary Camera" 
            item={setup.camera_setup.primary_camera} 
          />
          
          {setup.camera_setup.secondary_cameras?.map((cam, idx) => (
            <SetupCard 
              key={idx} 
              title={`Secondary Camera ${idx + 1}`} 
              item={cam} 
            />
          ))}

          <div className="card p-4 border-dark-700 bg-dark-800/50">
            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Settings</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-500">Resolution</span>
                <span className="text-white font-medium">{setup.camera_setup.settings.resolution}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Frame Rate</span>
                <span className="text-white font-medium">{setup.camera_setup.settings.frame_rate}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Color Profile</span>
                <span className="text-white font-medium">{setup.camera_setup.settings.color_profile}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Audio Setup */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-dark-700 pb-2">
            <Mic className="w-5 h-5 text-accent-pink" />
            <h3 className="text-lg font-semibold text-white">Audio Capture</h3>
          </div>
          
          <SetupCard 
            title="Primary Microphone" 
            item={setup.audio_setup.primary_microphone} 
          />
          
          {setup.audio_setup.audio_interface && (
            <SetupCard 
              title="Audio Interface" 
              item={setup.audio_setup.audio_interface} 
            />
          )}

          {setup.audio_setup.acoustic_treatment && setup.audio_setup.acoustic_treatment.length > 0 && (
            <div className="card p-4 border-dark-700 bg-dark-800/50">
              <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Acoustic Treatment</h4>
              <ul className="space-y-2">
                {setup.audio_setup.acoustic_treatment.map((treatment, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{treatment}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Lighting Setup */}
        <div className="space-y-4 lg:col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-dark-700 pb-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Lighting Grid</h3>
          </div>
          
          <SetupCard 
            title="Key Light" 
            item={setup.lighting_setup.key_light} 
          />
          
          {setup.lighting_setup.fill_light && (
            <SetupCard 
              title="Fill Light" 
              item={setup.lighting_setup.fill_light} 
            />
          )}
          
          {setup.lighting_setup.ambient_lighting && (
            <div className="card p-4 border-dark-700 bg-dark-800/50">
              <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Ambient Design</h4>
              <p className="text-sm text-gray-300">{setup.lighting_setup.ambient_lighting}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
