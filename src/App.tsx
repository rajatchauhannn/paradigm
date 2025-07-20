import { useState, useEffect } from 'react';
import { type ParfileConfig } from './types';
import { validateConfig, type ValidationResult } from './utils';
import { OperationToggle } from './components/OperationToggle';
import { BasicParamsForm } from './components/BasicParamsForm';
import { DefaultNamingSchemeForm } from './components/DefaultNamingSchemeForm';
import { AdvancedOptions } from './components/AdvancedOptions';

function App() {
  const [config, setConfig] = useState<ParfileConfig>({
    operation: 'EXPORT',
    directory: 'DATA_PUMP_DIR',
    dumpfile: 'export.dmp',
    logfile: 'export.log',
    userid: '',
    export_mode: 'FULL',
    schemas: '',
    tables: '',
    tablespaces: '',
    table_exists_action: '',
    useDefaultNaming: true,
    baseName: 'export',
    parallel: undefined,
    compression: 'NONE',
    content: 'ALL',
    query: '',
    remap_schema: '',
    flashback_time: '',
    flashback_scn: '',
  });

  const [validationResult, setValidationResult] = useState<ValidationResult>({ errors: [], warnings: [] });
  const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setValidationResult(validateConfig(config));
  }, [config]);

  const isInvalid = validationResult.errors.length > 0;

  // --- Handlers ---
  const handleOperationChange = (op: ParfileConfig['operation']) => setConfig(prev => ({ ...prev, operation: op, table_exists_action: '' }));

  const handleToggleDefaultNaming = (isChecked: boolean) => {
    setConfig(current => {
      if (!isChecked) return { ...current, useDefaultNaming: false };
      const isParallel = current.parallel && current.parallel > 1 && current.operation === 'EXPORT';
      return { ...current, useDefaultNaming: true, dumpfile: `${current.baseName}${isParallel ? '_%U.dmp' : '.dmp'}`, logfile: `${current.baseName}.log` };
    });
  };

  const handleBaseNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBaseName = e.target.value;
    setConfig(current => {
      if (!current.useDefaultNaming) return { ...current, baseName: newBaseName };
      const isParallel = current.parallel && current.parallel > 1 && current.operation === 'EXPORT';
      return { ...current, baseName: newBaseName, dumpfile: `${newBaseName}${isParallel ? '_%U.dmp' : '.dmp'}`, logfile: `${newBaseName}.log` };
    });
  };

  const handleParallelChange = (newParallel: number | undefined) => {
    setConfig(current => {
      let newDumpfile = current.dumpfile;
      const isParallel = newParallel && newParallel > 1;
      if (current.operation === 'EXPORT' && current.useDefaultNaming) {
        if (isParallel && !newDumpfile.includes('%U')) newDumpfile = newDumpfile.replace(/\.dmp$/i, '_%U.dmp');
        else if (!isParallel && newDumpfile.includes('%U')) newDumpfile = newDumpfile.replace(/_%U\.dmp$/i, '.dmp');
      }
      return { ...current, parallel: newParallel, dumpfile: newDumpfile };
    });
  };
  
  const handleShowAdvancedToggle = (isChecked: boolean) => {
    setShowAdvanced(isChecked);
    if (!isChecked) setConfig(c => ({...c, parallel:undefined,compression:'NONE',content:'ALL',query:'',remap_schema:'',flashback_time:'',flashback_scn:''}));
  };
  
  const handleConvertToImport = () => setConfig(c => ({...c, operation:'IMPORT', logfile:c.useDefaultNaming?`${c.baseName}_import.log`:`${c.logfile.replace(/\.log$/i,'')}_import.log`, table_exists_action:''}));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateParfileContent());
      setCopyButtonText('Copied!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyButtonText('Error!');
    } finally {
      setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
    }
  };

  // --- Generator ---
  const generateParfileContent = () => {
    let content = '';
    if (config.userid) content += `USERID=${config.userid}\n`;
    content += `DIRECTORY=${config.directory}\n`;
    content += `DUMPFILE=${config.dumpfile}\n`;
    content += `LOGFILE=${config.logfile}\n`;
    if (config.parallel && config.parallel > 1) content += `PARALLEL=${config.parallel}\n`;
    if (config.operation === 'EXPORT') {
      if (config.compression !== 'NONE') content += `COMPRESSION=${config.compression}\n`;
      if (config.content !== 'ALL') content += `CONTENT=${config.content}\n`;
      if (config.query) content += `QUERY=${config.query}\n`;
      if (config.flashback_time) content += `FLASHBACK_TIME=${config.flashback_time}\n`;
      else if (config.flashback_scn) content += `FLASHBACK_SCN=${config.flashback_scn}\n`;
      if (config.export_mode === 'SCHEMAS' && config.schemas) content += `SCHEMAS=${config.schemas}\n`;
      else if (config.export_mode === 'TABLES' && config.tables) content += `TABLES=${config.tables}\n`;
      else if (config.export_mode === 'TABLESPACES' && config.tablespaces) content += `TABLESPACES=${config.tablespaces}\n`;
      else if (config.export_mode === 'FULL') content += `FULL=Y\n`;
    }
    if (config.operation === 'IMPORT') {
      if (config.schemas) content += `SCHEMAS=${config.schemas}\n`;
      if (config.remap_schema) content += `REMAP_SCHEMA=${config.remap_schema}\n`;
      if (config.table_exists_action) content += `TABLE_EXISTS_ACTION=${config.table_exists_action}\n`;
    }
    return content;
  };

  // --- Render ---
  return (
    <div>
      <h1>ParfileForge</h1>
      <OperationToggle operation={config.operation} onOperationChange={handleOperationChange} /> <hr />
      <BasicParamsForm config={config} setConfig={setConfig} /> <br />
      <DefaultNamingSchemeForm config={config} onBaseNameChange={handleBaseNameChange} onToggle={handleToggleDefaultNaming} /> <br />
      <AdvancedOptions config={config} setConfig={setConfig} showAdvanced={showAdvanced} onShowAdvancedToggle={handleShowAdvancedToggle} onParallelChange={handleParallelChange} />
      {config.operation === 'EXPORT' && (
        <fieldset style={{ marginTop: '10px' }}>
          <legend>Export Mode</legend>
          <select value={config.export_mode} onChange={(e) => setConfig({ ...config, export_mode: e.target.value as any })}>{['SCHEMAS', 'TABLES', 'TABLESPACES', 'FULL'].map(o=><option key={o} value={o}>{o}</option>)}</select><br /><br />
          {config.export_mode === 'SCHEMAS' && (<div><label htmlFor="schemas">SCHEMAS</label><br/><input id="schemas" type="text" placeholder="HR,SCOTT" value={config.schemas} onChange={(e) => setConfig({...config, schemas: e.target.value})} /></div>)}
          {config.export_mode === 'TABLES' && (<div><label htmlFor="tables">TABLES</label><br/><input id="tables" type="text" placeholder="HR.EMPLOYEES" value={config.tables} onChange={(e) => setConfig({...config, tables: e.target.value})} /></div>)}
          {config.export_mode === 'TABLESPACES' && (<div><label htmlFor="tablespaces">TABLESPACES</label><br/><input id="tablespaces" type="text" placeholder="USERS" value={config.tablespaces} onChange={(e) => setConfig({...config, tablespaces: e.target.value})} /></div>)}
        </fieldset>
      )}
      {config.operation === 'IMPORT' && (
        <fieldset style={{ marginTop: '10px' }}>
          <legend>Import Options</legend>
          <label htmlFor="table_exists_action">Table Exists Action</label><br/>
          <select id="table_exists_action" value={config.table_exists_action} onChange={(e) => setConfig({ ...config, table_exists_action: e.target.value as any })}>
            <option value="" disabled>-- Must Select --</option>
            <option value="SKIP">SKIP</option><option value="APPEND">APPEND</option><option value="TRUNCATE">TRUNCATE</option><option value="REPLACE">REPLACE</option>
          </select><br/><br/>
          <label htmlFor="import_schemas">SCHEMAS (filter)</label><br/>
          <input id="import_schemas" type="text" placeholder="HR,SCOTT" value={config.schemas} onChange={(e) => setConfig({...config, schemas: e.target.value})} />
        </fieldset>
      )}
      <hr />
      <h3>Generated Parfile</h3>
      <textarea readOnly value={generateParfileContent()} rows={15} cols={60} style={isInvalid ? { userSelect: 'none', pointerEvents: 'none' } : {}} />
      {isInvalid && (<div style={{color:'red',marginTop:'10px'}}><b>Invalid Config:</b><ul>{validationResult.errors.map(e=><li key={e}>{e}</li>)}</ul></div>)}
      {validationResult.warnings.length > 0 && (<div style={{color:'orange',marginTop:'10px'}}><b>Warnings:</b><ul>{validationResult.warnings.map(w=><li key={w}>{w}</li>)}</ul></div>)}
      <br />
      <button onClick={handleCopy} disabled={isInvalid}>{copyButtonText}</button>
      {config.operation === 'EXPORT' && (<button onClick={handleConvertToImport} style={{marginLeft:'10px'}} disabled={isInvalid}>Create Matching Import</button>)}
    </div>
  );
}

export default App;