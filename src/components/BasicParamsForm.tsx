// src/components/BasicParamsForm.tsx
import { type ParfileConfig } from '../types';

// Let's define a shared style for our inputs to keep things DRY
const inputClasses = "block w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
const disabledClasses = "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

interface BasicParamsProps {
  config: ParfileConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParfileConfig>>;
}

export const BasicParamsForm = ({ config, setConfig }: BasicParamsProps) => {
  return (
    <fieldset>
      <legend className="text-lg font-medium text-gray-900">Basic Parameters</legend>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-4">
        
        <div>
          <label htmlFor="userid" className="block text-sm font-medium text-gray-700">USERID</label>
          <input id="userid" type="text" value={config.userid} onChange={(e) => setConfig(prev => ({...prev, userid: e.target.value}))} className={inputClasses} />
        </div>
        
        <div>
          <label htmlFor="directory" className="block text-sm font-medium text-gray-700">DIRECTORY</label>
          <input id="directory" type="text" value={config.directory} onChange={(e) => setConfig(prev => ({...prev, directory: e.target.value}))} className={inputClasses} />
        </div>

        <div>
          <label htmlFor="dumpfile" className="block text-sm font-medium text-gray-700">DUMPFILE</label>
          <input id="dumpfile" type="text" name="dumpfile" value={config.dumpfile} onChange={(e) => setConfig(prev => ({...prev, dumpfile: e.target.value}))} className={`${inputClasses} ${disabledClasses}`} disabled={config.useDefaultNaming} />
        </div>

        <div>
          <label htmlFor="logfile" className="block text-sm font-medium text-gray-700">LOGFILE</label>
          <input id="logfile" type="text" name="logfile" value={config.logfile} onChange={(e) => setConfig(prev => ({...prev, logfile: e.target.value}))} className={`${inputClasses} ${disabledClasses}`} disabled={config.useDefaultNaming} />
        </div>
      </div>
    </fieldset>
  );
};