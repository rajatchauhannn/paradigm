import { type ParfileConfig } from '../types';
import { compressionOptions, contentOptions } from '../constants';

interface AdvancedOptionsProps {
  config: ParfileConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParfileConfig>>;
  showAdvanced: boolean;
  onShowAdvancedToggle: (isChecked: boolean) => void;
  onParallelChange: (value: number | undefined) => void;
}

export const AdvancedOptions = ({ config, setConfig, showAdvanced, onShowAdvancedToggle, onParallelChange }: AdvancedOptionsProps) => {
  return (
    <div>
      <input type="checkbox" id="showAdvanced" checked={showAdvanced} onChange={(e) => onShowAdvancedToggle(e.target.checked)} />
      <label htmlFor="showAdvanced">Show Advanced Options</label>

      {showAdvanced && (
        <fieldset style={{ marginTop: '10px', border: '1px solid grey' }}>
          <legend>Advanced Parameters</legend>
          <div>
            <label htmlFor="parallel">PARALLEL</label><br/>
            <input id="parallel" type="number" min="1" value={config.parallel || ''} onChange={(e) => onParallelChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
          </div>
          <br/>
          {config.operation === 'EXPORT' && (
            <>
              <div>
                <label htmlFor="compression">COMPRESSION</label><br/>
                <select id="compression" value={config.compression} onChange={(e) => setConfig(prev => ({...prev, compression: e.target.value as any}))}>{compressionOptions.map(o => <option key={o} value={o}>{o}</option>)}</select>
              </div><br/>
              <div>
                <label htmlFor="content">CONTENT</label><br/>
                <select id="content" value={config.content} onChange={(e) => setConfig(prev => ({...prev, content: e.target.value as any}))}>{contentOptions.map(o => <option key={o} value={o}>{o}</option>)}</select>
              </div><br/>
              <div>
                <label htmlFor="query">QUERY</label><br/>
                <textarea id="query" rows={4} cols={50} value={config.query} placeholder='"TABLE.NAME:WHERE clause"' onChange={(e) => setConfig(prev => ({...prev, query: e.target.value}))} />
              </div><br/>
              <div>
                <label htmlFor="flashback_time">FLASHBACK_TIME</label><br/>
                <input id="flashback_time" type="text" placeholder="TO_TIMESTAMP(...)" value={config.flashback_time} onChange={(e) => setConfig(prev => ({...prev, flashback_time: e.target.value, flashback_scn: ''}))} />
              </div><br/>
              <div>
                <label htmlFor="flashback_scn">FLASHBACK_SCN</label><br/>
                <input id="flashback_scn" type="text" value={config.flashback_scn} onChange={(e) => setConfig(prev => ({...prev, flashback_scn: e.target.value, flashback_time: ''}))} />
              </div>
            </>
          )}
          {config.operation === 'IMPORT' && (
            <div>
              <label htmlFor="remap_schema">REMAP_SCHEMA</label><br/>
              <input id="remap_schema" type="text" placeholder="source:target" value={config.remap_schema} onChange={(e) => setConfig(prev => ({...prev, remap_schema: e.target.value}))} />
            </div>
          )}
        </fieldset>
      )}
    </div>
  );
};