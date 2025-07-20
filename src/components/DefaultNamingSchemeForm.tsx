// src/components/DefaultNamingSchemeForm.tsx
import { type ParfileConfig } from '../types';

interface NamingSchemeProps {
  config: ParfileConfig;
  onBaseNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggle: (isChecked: boolean) => void;
}

export const DefaultNamingSchemeForm = ({ config, onBaseNameChange, onToggle }: NamingSchemeProps) => {
  return (
    <fieldset>
      <legend>Default Naming Scheme</legend>
      <input 
        type="checkbox" 
        id="useDefaultNaming" 
        checked={config.useDefaultNaming} 
        onChange={(e) => onToggle(e.target.checked)} 
      />
      <label htmlFor="useDefaultNaming">Use Base Name for Dumpfile & Logfile</label><br/><br/>
      <label htmlFor="baseName">Base Name</label><br/>
      <input 
        id="baseName" 
        type="text" 
        value={config.baseName} 
        onChange={onBaseNameChange} 
        disabled={!config.useDefaultNaming} 
      />
    </fieldset>
  );
};