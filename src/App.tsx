import { useState, useEffect } from "react";
import { type ParfileConfig } from "./types";
import { validateConfig, type ValidationResult } from "./utils";
import { OperationToggle } from "./components/OperationToggle";
import { AdvancedOptions } from "./components/AdvancedOptions";
import { ExportModeForm } from "./components/ExportModeForm";
import { ImportOptionsForm } from "./components/ImportOptionsForm";
import { CopyButton } from "./components/CopyButton";
import { FileNamingForm } from "./components/FileNamingForm";
import { BasicParamsForm } from "./components/BasicParamsForm";

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-semibold text-gray-900 mb-3">{children}</h3>
);

const getInitialState = (): ParfileConfig => ({
  operation: "EXPORT",
  directory: "DATA_PUMP_DIR",
  dumpfile: "export.dmp",
  logfile: "export.log",
  userid: "",
  export_mode: "FULL",
  schemas: "",
  tables: "",
  tablespaces: "",
  table_exists_action: "",
  parallel: undefined,
  compression: "NONE",
  content: "ALL",
  query: "",
  remap_schema: "",
  flashback_time: "",
  flashback_scn: "",
});

function App() {
  const [config, setConfig] = useState<ParfileConfig>(getInitialState());
  const [isLogfileSame, setIsLogfileSame] = useState(true);
  const [outputMode, setOutputMode] = useState<"parfile" | "command">("parfile");
  const [validationResult, setValidationResult] = useState<ValidationResult>({ errors: [], warnings: [] });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAiValidating, setIsAiValidating] = useState(false);
  const [aiValidationResult, setAiValidationResult] = useState<ValidationResult | null>(null);

  useEffect(() => {
    setConfig(currentConfig => {
      let newDumpfile = currentConfig.dumpfile;
      const isParallel = currentConfig.parallel && currentConfig.parallel > 1;
      const hasWildcard = newDumpfile.includes('%U');

      if (currentConfig.operation === 'EXPORT') {
        if (isParallel && !hasWildcard) newDumpfile = newDumpfile.replace(/(\.dmp)$/i, '_%U$1');
        else if (!isParallel && hasWildcard) newDumpfile = newDumpfile.replace(/_%U/i, '');
      }

      const newLogfile = isLogfileSame ? newDumpfile.replace(/(_%U)?\.dmp$/i, '.log') : currentConfig.logfile;
      if (newDumpfile !== currentConfig.dumpfile || newLogfile !== currentConfig.logfile) {
        return { ...currentConfig, dumpfile: newDumpfile, logfile: newLogfile };
      }
      return currentConfig;
    });
  }, [config.parallel, config.dumpfile, isLogfileSame, config.operation]);

  useEffect(() => {
    setValidationResult(validateConfig(config));
  }, [config]);

  const isInvalid = validationResult.errors.length > 0;
  
  const handleOperationChange = (op: ParfileConfig['operation']) => setConfig(c => ({ ...c, operation: op }));
  const handleDumpfileChange = (e: React.ChangeEvent<HTMLInputElement>) => setConfig(c => ({ ...c, dumpfile: e.target.value }));
  const handleLogfileSameChange = (isChecked: boolean) => setIsLogfileSame(isChecked);
  const handleParallelChange = (newParallel: number | undefined) => setConfig(c => ({ ...c, parallel: newParallel }));
  
  const handleShowAdvancedToggle = (isChecked: boolean) => {
    setShowAdvanced(isChecked);
    if (!isChecked) {
      const { parallel, compression, content, query, remap_schema, flashback_time, flashback_scn } = getInitialState();
      setConfig(c => ({ ...c, parallel, compression, content, query, remap_schema, flashback_time, flashback_scn }));
    }
  };

  const handleConvertToImport = () => {
    setConfig(c => ({ ...c, 
      operation: 'IMPORT',
      logfile: c.logfile.replace(/\.log$/i, '_import.log'),
      table_exists_action: 'SKIP'
    }));
  };

  const generateParfileContent = () => {
    const params = [];
    const { userid, directory, dumpfile, logfile, parallel, operation, compression, content, query, flashback_time, flashback_scn, export_mode, schemas, tables, tablespaces, remap_schema, table_exists_action } = config;

    if (userid) params.push(userid.match(/[\s/@]/) ? `USERID='${userid}'` : `USERID=${userid}`);
    if (directory) params.push(`DIRECTORY=${directory}`);
    if (dumpfile) params.push(`DUMPFILE=${dumpfile}`);
    if (logfile) params.push(`LOGFILE=${logfile}`);
    if (parallel && parallel > 1) params.push(`PARALLEL=${parallel}`);

    if (operation === 'EXPORT') {
      if (compression !== 'NONE') params.push(`COMPRESSION=${compression}`);
      if (content !== 'ALL') params.push(`CONTENT=${content}`);
      if (query) params.push(`QUERY=${query}`);
      if (flashback_time) params.push(`FLASHBACK_TIME="${flashback_time}"`);
      else if (flashback_scn) params.push(`FLASHBACK_SCN=${flashback_scn}`);
      
      if (export_mode === 'SCHEMAS' && schemas) params.push(`SCHEMAS=${schemas}`);
      else if (export_mode === 'TABLES' && tables) params.push(`TABLES=${tables}`);
      else if (export_mode === 'TABLESPACES' && tablespaces) params.push(`TABLESPACES=${tablespaces}`);
      else if (export_mode === 'FULL') params.push('FULL=Y');
    }

    if (operation === 'IMPORT') {
      if (schemas) params.push(`SCHEMAS=${schemas}`);
      if (remap_schema) params.push(`REMAP_SCHEMA=${remap_schema}`);
      if (table_exists_action) params.push(`TABLE_EXISTS_ACTION=${table_exists_action}`);
    }

    return params.join('\n');
  };

  const generateCommand = () => {
    const opCommand = config.operation === 'EXPORT' ? 'expdp' : 'impdp';
    if (outputMode === 'parfile') {
        return `nohup ${opCommand} parfile=your_parfile.par &`;
    }

    const parfileLines = generateParfileContent().split('\n').filter(line => line.length > 0);

    const commandParams = parfileLines.map(line => {
        const i = line.indexOf('=');
        if (i === -1) return line; // e.g. FULL=Y has no value

        const key = line.substring(0, i);
        const value = line.substring(i + 1);

        // For command line, wrap values containing special chars in single quotes to protect from the shell.
        if (key === 'USERID' || key === 'QUERY' || key === 'FLASHBACK_TIME') {
            // Strip any existing quotes from the parfile version and apply shell-safe single quotes
            const strippedValue = value.replace(/^['"]|['"]$/g, "");
            return `${key}='${strippedValue}'`;
        }
        
        return line;
    });

    return `nohup ${opCommand} ${commandParams.join(' ')} &`;
  };
  
  const handleAiValidate = async () => { /* ... existing code ... */ };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-sm">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold leading-6 text-gray-900">ParfileForge</h1>
        </div>
      </header>
      <main className="max-w-screen-2xl mx-auto py-4 sm:px-6 lg:px-8">
        {/* Added lg:items-start to make column heights independent */}
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-6 lg:items-start space-y-6 lg:space-y-0">
          {/* Column 1: Form */}
          <div className="lg:col-span-4 bg-white shadow-md sm:rounded-lg p-5 space-y-6">
            <div><SectionHeader>Operation</SectionHeader><OperationToggle operation={config.operation} onOperationChange={handleOperationChange} /></div>
            <div><SectionHeader>{config.operation === "EXPORT" ? "Export Mode" : "Table Exists Action"}</SectionHeader>{config.operation === "EXPORT" ? <ExportModeForm config={config} setConfig={setConfig} /> : <ImportOptionsForm config={config} setConfig={setConfig} />}</div>
            <div><FileNamingForm config={config} setConfig={setConfig} isLogfileSame={isLogfileSame} onLogfileSameChange={handleLogfileSameChange} onDumpfileChange={handleDumpfileChange} /></div>
            <div><BasicParamsForm config={config} setConfig={setConfig} /></div>
            <div><AdvancedOptions config={config} setConfig={setConfig} showAdvanced={showAdvanced} onShowAdvancedToggle={handleShowAdvancedToggle} onParallelChange={handleParallelChange} /></div>
          </div>
          {/* Column 2: Output & Standard Validation */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white shadow-md sm:rounded-lg">
              <div className="p-4 flex justify-between items-center"><h3 className="text-sm font-semibold">Output</h3><fieldset className="flex gap-x-4"><div className="flex items-center"><input id="mode_parfile" type="radio" value="parfile" checked={outputMode === "parfile"} onChange={(e) => setOutputMode(e.target.value as any)} className="h-4 w-4 text-blue-600" /><label htmlFor="mode_parfile" className="ml-2">Parfile + Cmd</label></div><div className="flex items-center"><input id="mode_command" type="radio" value="command" checked={outputMode === "command"} onChange={(e) => setOutputMode(e.target.value as any)} className="h-4 w-4 text-blue-600" /><label htmlFor="mode_command" className="ml-2">Command Only</label></div></fieldset></div>
              <div className="p-4 pt-0 space-y-4">
                {outputMode === "parfile" && <div className="relative"><textarea rows={12} readOnly value={generateParfileContent()} className="w-full p-2 font-mono bg-gray-100 border rounded-md" /><CopyButton contentToCopy={generateParfileContent()} /></div>}
                <div className="relative"><textarea rows={outputMode === "command" ? 18 : 5} readOnly value={generateCommand()} className="w-full p-2 font-mono bg-gray-100 border rounded-md" /><CopyButton contentToCopy={generateCommand()} /></div>
              </div>
              <div className="px-4 py-3 pt-0 text-right">{config.operation === "EXPORT" && <button onClick={handleConvertToImport} disabled={isInvalid} className="py-1 px-3 border border-gray-300 shadow-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Create Matching Import</button>}</div>
            </div>
            {(isInvalid || validationResult.warnings.length > 0) && <div className="bg-white shadow-md sm:rounded-lg p-4 space-y-3">{isInvalid && <div className="rounded-md bg-red-50 p-3"><h3 className="text-xs font-bold text-red-800">Configuration Errors</h3><div className="mt-2 text-xs text-red-700"><ul className="list-disc pl-4 space-y-1">{validationResult.errors.map((e) => <li key={e}>{e}</li>)}</ul></div></div>}{!isInvalid && validationResult.warnings.length > 0 && <div className="rounded-md bg-yellow-50 p-3"><h3 className="text-xs font-bold text-yellow-800">Warnings</h3><div className="mt-2 text-xs text-yellow-700"><ul className="list-disc pl-4 space-y-1">{validationResult.warnings.map((w) => <li key={w}>{w}</li>)}</ul></div></div>}</div>}
          </div>
          {/* Column 3: AI Validation */}
          <div className="lg:col-span-4">
            <div className="bg-white shadow-md sm:rounded-lg">
              <div className="p-4">
                <h3 className="text-sm font-semibold mb-3">Advanced Validation</h3>
                <button type="button" onClick={handleAiValidate} disabled={isInvalid || isAiValidating} className="w-full py-2 px-4 border shadow-sm rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">{isAiValidating ? "Validating..." : "Validate with AI"}</button>
              </div>
              <div className="border-t border-gray-200 p-4 space-y-3">
                {!aiValidationResult && !isAiValidating && <div className="text-center text-xs text-gray-500 py-3"><p>Click for an extra layer of checks.</p></div>}
                {aiValidationResult?.errors?.length > 0 && <div className="rounded-md bg-red-50 p-3"><h4 className="text-xs font-bold text-red-800">Errors</h4><ul className="mt-2 text-xs text-red-700 list-disc pl-4 space-y-1">{aiValidationResult.errors.map((e) => <li key={e}>{e}</li>)}</ul></div>}
                {aiValidationResult?.warnings?.length > 0 && <div className="rounded-md bg-yellow-50 p-3"><h4 className="text-xs font-bold text-yellow-800">Warnings</h4><ul className="mt-2 text-xs text-yellow-700 list-disc pl-4 space-y-1">{aiValidationResult.warnings.map((w) => <li key={w}>{w}</li>)}</ul></div>}
                {aiValidationResult?.suggestions?.length > 0 && <div className="rounded-md bg-blue-50 p-3"><h4 className="text-xs font-bold text-blue-800">Suggestions</h4><ul className="mt-2 text-xs text-blue-700 list-disc pl-4 space-y-1">{aiValidationResult.suggestions.map((s) => <li key={s}>{s}</li>)}</ul></div>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;