// src/components/BasicParamsForm.tsx
import { type ParfileConfig } from '../types';

const inputClasses = "block w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

interface BasicParamsProps {
  config: ParfileConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParfileConfig>>;
}

export const BasicParamsForm = ({ config, setConfig }: BasicParamsProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <label htmlFor="userid" className="block text-sm font-medium text-gray-700">USERID</label>
        <input id="userid" type="text" value={config.userid} onChange={(e) => setConfig(prev => ({...prev, userid: e.target.value}))} className={inputClasses} />
      </div>
      
      <div>
        <label htmlFor="directory" className="block text-sm font-medium text-gray-700">DIRECTORY</label>
        <input id="directory" type="text" value={config.directory} onChange={(e) => setConfig(prev => ({...prev, directory: e.target.value}))} className={inputClasses} />
      </div>
    </div>
  );
};