// src/components/FileNamingForm.tsx
import { type ParfileConfig } from '../types';

const inputClasses = "block w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
const disabledClasses = "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

interface FileNamingProps {
  config: ParfileConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParfileConfig>>;
  isLogfileSame: boolean;
  onLogfileSameChange: (isChecked: boolean) => void;
  onDumpfileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileNamingForm = ({ config, setConfig, isLogfileSame, onLogfileSameChange, onDumpfileChange }: FileNamingProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* DUMPFILE Input */}
      <div>
        <label htmlFor="dumpfile" className="block text-sm font-medium text-gray-700">DUMPFILE</label>
        <input 
          id="dumpfile" 
          type="text" 
          name="dumpfile" 
          value={config.dumpfile} 
          onChange={onDumpfileChange} 
          className={inputClasses} 
        />
      </div>

      {/* LOGFILE Input */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="logfile" className="block text-sm font-medium text-gray-700">LOGFILE</label>
          <div className="flex items-center">
            <input 
              id="logfileSameAsDumpfile" 
              type="checkbox" 
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={isLogfileSame}
              onChange={(e) => onLogfileSameChange(e.target.checked)}
            />
            <label htmlFor="logfileSameAsDumpfile" className="ml-2 block text-sm text-gray-600">Same as dumpfile?</label>
          </div>
        </div>
        <input 
          id="logfile" 
          type="text" 
          name="logfile" 
          value={config.logfile} 
          onChange={(e) => setConfig(prev => ({ ...prev, logfile: e.target.value }))} 
          className={`${inputClasses} ${disabledClasses}`}
          disabled={isLogfileSame} 
        />
      </div>
    </div>
  );
};