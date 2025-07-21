// src/components/DefaultNamingSchemeForm.tsx
import { type ParfileConfig } from '../types';

const inputClasses = "block w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
const disabledClasses = "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

interface NamingSchemeProps {
  config: ParfileConfig;
  onBaseNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggle: (isChecked: boolean) => void;
}

export const DefaultNamingSchemeForm = ({ config, onBaseNameChange, onToggle }: NamingSchemeProps) => {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900">Naming Scheme</h3>
      <div className="mt-4 space-y-4">
        <div className="flex items-center">
          <input 
            id="useDefaultNaming" 
            type="checkbox" 
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
            checked={!!config.useDefaultNaming} 
            onChange={(e) => onToggle(e.target.checked)} 
          />
          <label htmlFor="useDefaultNaming" className="ml-3 block text-sm font-medium text-gray-700">Use Base Name for Dumpfile & Logfile</label>
        </div>
        <div>
          <label htmlFor="baseName" className="block text-sm font-medium text-gray-700">Base Name</label>
          <input 
            id="baseName" 
            type="text" 
            value={config.baseName} 
            onChange={onBaseNameChange} 
            className={`${inputClasses} ${disabledClasses}`} 
            disabled={!config.useDefaultNaming} 
          />
        </div>
      </div>
    </div>
  );
};