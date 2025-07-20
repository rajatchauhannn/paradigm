// src/components/BasicParamsForm.tsx

import { type ParfileConfig } from '../types';

interface BasicParamsProps {
  config: ParfileConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParfileConfig>>;
}

export const BasicParamsForm = ({ config, setConfig }: BasicParamsProps) => {
  return (
    <fieldset>
      <legend>Basic Parameters</legend>
      
      <label htmlFor="userid">USERID</label><br/>
      <input 
        id="userid" 
        type="text" 
        value={config.userid} 
        onChange={(e) => setConfig(prev => ({...prev, userid: e.target.value}))} 
      /><br/><br/>
      
      <label htmlFor="directory">DIRECTORY</label><br/>
      <input 
        id="directory" 
        type="text" 
        value={config.directory} 
        onChange={(e) => setConfig(prev => ({...prev, directory: e.target.value}))} 
      /><br/><br/>

      <label htmlFor="dumpfile">DUMPFILE</label><br/>
      <input 
        id="dumpfile" 
        type="text" 
        name="dumpfile" 
        value={config.dumpfile} 
        onChange={(e) => setConfig(prev => ({...prev, dumpfile: e.target.value}))} 
        disabled={config.useDefaultNaming} 
      /><br/><br/>

      <label htmlFor="logfile">LOGFILE</label><br/>
      <input 
        id="logfile" 
        type="text" 
        name="logfile" 
        value={config.logfile} 
        onChange={(e) => setConfig(prev => ({...prev, logfile: e.target.value}))} 
        disabled={config.useDefaultNaming} 
      />
    </fieldset>
  );
};