// src/components/AdvancedOptions.tsx
import { type ParfileConfig } from '../types';
import { compressionOptions, contentOptions } from '../constants';

const inputClasses = "block w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
const selectClasses = "block w-full mt-1 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md";
const textareaClasses = "shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md";

interface AdvancedOptionsProps {
  config: ParfileConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParfileConfig>>;
  showAdvanced: boolean;
  onShowAdvancedToggle: (isChecked: boolean) => void;
  onParallelChange: (value: number | undefined) => void;
}

export const AdvancedOptions = ({ config, setConfig, showAdvanced, onShowAdvancedToggle, onParallelChange }: AdvancedOptionsProps) => {
  
  const handleParallelInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Sanitize input to only allow integers
    const parsed = parseInt(value.replace(/[^0-9]/g, ''), 10);
    onParallelChange(isNaN(parsed) ? undefined : parsed);
  };

  return (
    <div>
      <div className="flex items-center">
        <input id="showAdvanced" type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked={showAdvanced} onChange={(e) => onShowAdvancedToggle(e.target.checked)} />
        <label htmlFor="showAdvanced" className="ml-3 block text-sm font-medium text-gray-700">Show Advanced Options</label>
      </div>

      {showAdvanced && (
        <div className="pt-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="parallel" className="block text-sm font-medium text-gray-700">Parallel</label>
              <input id="parallel" type="text" pattern="[0-9]*" min="1" value={config.parallel || ''} onChange={handleParallelInputChange} className={inputClasses}/>
            </div>

            {config.operation === 'EXPORT' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="compression" className="block text-sm font-medium text-gray-700">Compression</label>
                  <select id="compression" value={config.compression} onChange={(e) => setConfig(prev => ({...prev, compression: e.target.value as any}))} className={selectClasses}>{compressionOptions.map(o=><option key={o} value={o}>{o}</option>)}</select>
                </div>
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                  <select id="content" value={config.content} onChange={(e) => setConfig(prev => ({...prev, content: e.target.value as any}))} className={selectClasses}>{contentOptions.map(o=><option key={o} value={o}>{o}</option>)}</select>
                </div>
                <div>
                  <label htmlFor="query" className="block text-sm font-medium text-gray-700">Query</label>
                  <textarea id="query" rows={4} value={config.query} placeholder='TABLE_NAME:"WHERE clause"' onChange={(e) => setConfig(prev => ({...prev, query: e.target.value}))} className={textareaClasses} />
                </div>
                <div>
                  <label htmlFor="flashback_time" className="block text-sm font-medium text-gray-700">Flashback Time</label>
                  <input id="flashback_time" type="text" placeholder="TO_TIMESTAMP(...)" value={config.flashback_time} onChange={(e) => setConfig(prev => ({...prev, flashback_time: e.target.value, flashback_scn: ''}))} className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="flashback_scn" className="block text-sm font-medium text-gray-700">Flashback SCN</label>
                  <input id="flashback_scn" type="text" placeholder="System Change Number" value={config.flashback_scn} onChange={(e) => setConfig(prev => ({...prev, flashback_scn: e.target.value, flashback_time: ''}))} className={inputClasses} />
                </div>
              </div>
            )}
            
            {config.operation === 'IMPORT' && (
              <div>
                <label htmlFor="remap_schema" className="block text-sm font-medium text-gray-700">Remap Schema</label>
                <input id="remap_schema" type="text" placeholder="source_schema:target_schema" value={config.remap_schema} onChange={(e) => setConfig(prev => ({...prev, remap_schema: e.target.value}))} className={inputClasses} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};