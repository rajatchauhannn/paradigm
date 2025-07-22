// src/components/ExportModeForm.tsx

import { type ParfileConfig } from '../types';

const selectClasses = "block w-full mt-1 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md";
const inputClasses = "block w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

interface ExportModeProps {
  config: ParfileConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParfileConfig>>;
}

export const ExportModeForm = ({ config, setConfig }: ExportModeProps) => {
  return (
    <div>
      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="export_mode" className="sr-only">Export Mode</label>
          <select id="export_mode" value={config.export_mode} onChange={(e) => setConfig(prev => ({ ...prev, export_mode: e.target.value as any }))} className={selectClasses}>
            <option value="SCHEMAS">Schemas</option>
            <option value="TABLES">Tables</option>
            <option value="TABLESPACES">Tablespaces</option>
            <option value="FULL">Full Database</option>
          </select>
        </div>
        
        {config.export_mode === 'SCHEMAS' && (<div><label htmlFor="schemas" className="block text-sm font-medium text-gray-700">Schemas</label><input id="schemas" type="text" placeholder="HR,SCOTT" value={config.schemas} onChange={(e) => setConfig(prev => ({...prev, schemas: e.target.value}))} className={inputClasses} /></div>)}
        {config.export_mode === 'TABLES' && (<div><label htmlFor="tables" className="block text-sm font-medium text-gray-700">Tables</label><input id="tables" type="text" placeholder="HR.EMPLOYEES" value={config.tables} onChange={(e) => setConfig(prev => ({...prev, tables: e.target.value}))} className={inputClasses} /></div>)}
        {config.export_mode === 'TABLESPACES' && (<div><label htmlFor="tablespaces" className="block text-sm font-medium text-gray-700">Tablespaces</label><input id="tablespaces" type="text" placeholder="USERS" value={config.tablespaces} onChange={(e) => setConfig(prev => ({...prev, tablespaces: e.target.value}))} className={inputClasses} /></div>)}
      </div>
    </div>
  );
};