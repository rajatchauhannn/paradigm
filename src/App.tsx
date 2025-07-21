import { useState, useEffect } from "react";
import { type ParfileConfig } from "./types";
import {
  validateConfig,
  type ValidationResult,
} from "./utils";
import { OperationToggle } from "./components/OperationToggle";
import { BasicParamsForm } from "./components/BasicParamsForm";
import { DefaultNamingSchemeForm } from "./components/DefaultNamingSchemeForm";
import { AdvancedOptions } from "./components/AdvancedOptions";
import { ExportModeForm } from "./components/ExportModeForm";
import { ImportOptionsForm } from "./components/ImportOptionsForm";
import { CopyButton } from './components/CopyButton';

function App() {
  const [config, setConfig] = useState<ParfileConfig>({
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
    useDefaultNaming: true,
    baseName: "export",
    parallel: undefined,
    compression: "NONE",
    content: "ALL",
    query: "",
    remap_schema: "",
    flashback_time: "",
    flashback_scn: "",
  });

  const [outputMode, setOutputMode] = useState<'parfile' | 'command'>('parfile');
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    errors: [],
    warnings: [],
  });
  const [copyButtonText, setCopyButtonText] = useState("Copy to Clipboard");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isAiValidating, setIsAiValidating] = useState(false);
  const [aiValidationResult, setAiValidationResult] =
    useState<ValidationResult | null>(null);

  useEffect(() => {
    setValidationResult(validateConfig(config));
  }, [config]);

  const isInvalid = validationResult.errors.length > 0;

  // AI HANDLERS

  const handleAiValidate = async () => {
    setIsAiValidating(true);
    setAiValidationResult(null); // Clear previous results

    // Determine what content to send to the AI
    const contentToValidate = outputMode === 'command' 
      ? generateCommand() 
      : generateParfileContent();

    try {
      // 1. Make the "phone call" (network request) to our backend API
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 2. Send the parfile content in the request body
        body: JSON.stringify({ parfileContent: contentToValidate }),
      });

      // 3. Get the response from our backend
      const result = await response.json();

      if (!response.ok) {
        // If the server responded with an error (4xx, 5xx), show it
        throw new Error(result.errors?.[0] || 'An unknown error occurred.');
      }

      // 4. Update the UI with the real AI feedback
      setAiValidationResult(result);

    } catch (error: any) {
      console.error("Failed to fetch AI validation:", error);
      // Handle network errors or other exceptions
      setAiValidationResult({ errors: [error.message], warnings: [], suggestions: [] });
    } finally {
      // 5. Always stop the loading spinner
      setIsAiValidating(false);
    }
  };
  // --- Handlers ---
  const handleOperationChange = (op: ParfileConfig["operation"]) =>
    setConfig((prev) => ({ ...prev, operation: op, table_exists_action: "" }));

  const handleToggleDefaultNaming = (isChecked: boolean) => {
    setConfig((current) => {
      if (!isChecked) return { ...current, useDefaultNaming: false };
      const isParallel =
        current.parallel &&
        current.parallel > 1 &&
        current.operation === "EXPORT";
      return {
        ...current,
        useDefaultNaming: true,
        dumpfile: `${current.baseName}${isParallel ? "_%U.dmp" : ".dmp"}`,
        logfile: `${current.baseName}.log`,
      };
    });
  };

  const handleBaseNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBaseName = e.target.value;
    setConfig((current) => {
      if (!current.useDefaultNaming)
        return { ...current, baseName: newBaseName };
      const isParallel =
        current.parallel &&
        current.parallel > 1 &&
        current.operation === "EXPORT";
      return {
        ...current,
        baseName: newBaseName,
        dumpfile: `${newBaseName}${isParallel ? "_%U.dmp" : ".dmp"}`,
        logfile: `${newBaseName}.log`,
      };
    });
  };

  const handleParallelChange = (newParallel: number | undefined) => {
    setConfig((current) => {
      let newDumpfile = current.dumpfile;
      const isParallel = newParallel && newParallel > 1;
      if (current.operation === "EXPORT" && current.useDefaultNaming) {
        if (isParallel && !newDumpfile.includes("%U"))
          newDumpfile = newDumpfile.replace(/\.dmp$/i, "_%U.dmp");
        else if (!isParallel && newDumpfile.includes("%U"))
          newDumpfile = newDumpfile.replace(/_%U\.dmp$/i, ".dmp");
      }
      return { ...current, parallel: newParallel, dumpfile: newDumpfile };
    });
  };

  const handleShowAdvancedToggle = (isChecked: boolean) => {
    setShowAdvanced(isChecked);
    if (!isChecked)
      setConfig((c) => ({
        ...c,
        parallel: undefined,
        compression: "NONE",
        content: "ALL",
        query: "",
        remap_schema: "",
        flashback_time: "",
        flashback_scn: "",
      }));
  };

  const handleConvertToImport = () =>
    setConfig((c) => ({
      ...c,
      operation: "IMPORT",
      logfile: c.useDefaultNaming
        ? `${c.baseName}_import.log`
        : `${c.logfile.replace(/\.log$/i, "")}_import.log`,
      table_exists_action: "",
    }));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateParfileContent());
      setCopyButtonText("Copied!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      setCopyButtonText("Error!");
    } finally {
      setTimeout(() => setCopyButtonText("Copy to Clipboard"), 2000);
    }
  };

  // --- Generator ---
  const generateParfileContent = () => {
    let content = "";
    if (config.userid) content += `USERID=${config.userid}\n`;
    content += `DIRECTORY=${config.directory}\n`;
    content += `DUMPFILE=${config.dumpfile}\n`;
    content += `LOGFILE=${config.logfile}\n`;
    if (config.parallel && config.parallel > 1)
      content += `PARALLEL=${config.parallel}\n`;
    if (config.operation === "EXPORT") {
      if (config.compression !== "NONE")
        content += `COMPRESSION=${config.compression}\n`;
      if (config.content !== "ALL") content += `CONTENT=${config.content}\n`;
      if (config.query) content += `QUERY=${config.query}\n`;
      if (config.flashback_time)
        content += `FLASHBACK_TIME=${config.flashback_time}\n`;
      else if (config.flashback_scn)
        content += `FLASHBACK_SCN=${config.flashback_scn}\n`;
      if (config.export_mode === "SCHEMAS" && config.schemas)
        content += `SCHEMAS=${config.schemas}\n`;
      else if (config.export_mode === "TABLES" && config.tables)
        content += `TABLES=${config.tables}\n`;
      else if (config.export_mode === "TABLESPACES" && config.tablespaces)
        content += `TABLESPACES=${config.tablespaces}\n`;
      else if (config.export_mode === "FULL") content += `FULL=Y\n`;
    }
    if (config.operation === "IMPORT") {
      if (config.schemas) content += `SCHEMAS=${config.schemas}\n`;
      if (config.remap_schema)
        content += `REMAP_SCHEMA=${config.remap_schema}\n`;
      if (config.table_exists_action)
        content += `TABLE_EXISTS_ACTION=${config.table_exists_action}\n`;
    }
    return content;
  };

  const generateCommand = () => {
    const op = config.operation.toLowerCase();
    
    if (outputMode === 'parfile') {
      const parfileName = `${config.baseName || 'parfile'}.par`;
      return `nohup ${op}dp parfile=${parfileName} &`;
    }

    // --- Full Command Mode ---
    let command = `nohup ${op}dp `;
    const params = [];
    
    if (config.userid) params.push(`userid=${config.userid}`);
    if (config.directory) params.push(`directory=${config.directory}`);
    if (config.dumpfile) params.push(`dumpfile=${config.dumpfile}`);
    if (config.logfile) params.push(`logfile=${config.logfile}`);
    
    if (config.parallel && config.parallel > 1) params.push(`parallel=${config.parallel}`);

    if (config.operation === 'EXPORT') {
      if (config.compression !== 'NONE') params.push(`compression=${config.compression}`);
      if (config.content !== 'ALL') params.push(`content=${config.content}`);
      if (config.query) params.push(`query='${config.query.replace(/'/g, "''")}'`); // Basic quote handling
      if (config.flashback_time) params.push(`flashback_time="${config.flashback_time}"`);
      else if (config.flashback_scn) params.push(`flashback_scn=${config.flashback_scn}`);

      if (config.export_mode === 'SCHEMAS' && config.schemas) params.push(`schemas=${config.schemas}`);
      else if (config.export_mode === 'TABLES' && config.tables) params.push(`tables=${config.tables}`);
      else if (config.export_mode === 'TABLESPACES' && config.tablespaces) params.push(`tablespaces=${config.tablespaces}`);
      else if (config.export_mode === 'FULL') params.push(`full=Y`);
    }

    if (config.operation === 'IMPORT') {
      if (config.schemas) params.push(`schemas=${config.schemas}`);
      if (config.remap_schema) params.push(`remap_schema=${config.remap_schema}`);
      if (config.table_exists_action) params.push(`table_exists_action=${config.table_exists_action}`);
    }
    
    command += params.join(' ') + ' &';
    return command;
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">ParfileForge</h1>
          <p className="mt-1 text-sm text-gray-500">Oracle Data Pump Parameter File Generator</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="space-y-8">
                <OperationToggle operation={config.operation} onOperationChange={handleOperationChange} />
                {config.operation === 'EXPORT' 
                  ? <ExportModeForm config={config} setConfig={setConfig} /> 
                  : <ImportOptionsForm config={config} setConfig={setConfig} />
                }
                <DefaultNamingSchemeForm config={config} onBaseNameChange={handleBaseNameChange} onToggle={handleToggleDefaultNaming} />
                <BasicParamsForm config={config} setConfig={setConfig} />
                <AdvancedOptions config={config} setConfig={setConfig} showAdvanced={showAdvanced} onShowAdvancedToggle={handleShowAdvancedToggle} onParallelChange={handleParallelChange} />
              </div>
            </div>
          </div>

          {/* Right Column: Preview & Actions */}
          <div className="lg:col-span-7">
            <div className="space-y-6 lg:sticky lg:top-6">
              
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <fieldset>
                    <legend className="text-lg leading-6 font-medium text-gray-900">Output Mode</legend>
                    <div className="mt-4 flex gap-x-6">
                      <div className="flex items-center">
                        <input id="mode_parfile" type="radio" value="parfile" checked={outputMode === 'parfile'} onChange={(e) => setOutputMode(e.target.value as any)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <label htmlFor="mode_parfile" className="ml-2 block text-sm font-medium text-gray-700">Parfile + Command</label>
                      </div>
                      <div className="flex items-center">
                        <input id="mode_command" type="radio" value="command" checked={outputMode === 'command'} onChange={(e) => setOutputMode(e.target.value as any)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <label htmlFor="mode_command" className="ml-2 block text-sm font-medium text-gray-700">Full Command Only</label>
                      </div>
                    </div>
                  </fieldset>

                  {/* The main output area, with swapped positions and no titles */}
                  <div className="mt-6 space-y-4">
                    {/* Parfile textarea is now first (and conditional) */}
                    {outputMode === 'parfile' && (
                      <div className="relative">
                        <textarea
                          id="parfile_output"
                          aria-label="Generated Parfile"
                          readOnly
                          value={generateParfileContent()}
                          rows={15}
                          className="pr-12 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md font-mono bg-gray-100 p-4"
                          style={isInvalid ? { userSelect: 'none', pointerEvents: 'none', color: '#6b7280' } : {}}
                        />
                        <CopyButton contentToCopy={generateParfileContent()} />
                      </div>
                    )}

                    {/* Command textarea is now second */}
                    <div className="relative">
                      <textarea
                        id="command_output"
                        aria-label="Command to Execute"
                        readOnly
                        value={generateCommand()}
                        rows={outputMode === 'command' ? 20 : 4}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md font-mono bg-gray-100 p-4"
                      />
                      <CopyButton contentToCopy={generateCommand()} />
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  {/* Buttons now live at the bottom of this single card */}
                  {config.operation === 'EXPORT' && (<button onClick={handleConvertToImport} disabled={isInvalid} className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">Create Matching Import</button>)}
                  <button onClick={handleCopy} disabled={isInvalid} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">{copyButtonText}</button>
                </div>
              </div>
              
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">AI-Powered Validation</h3>
                  <p className="mt-1 text-sm text-gray-500">Submit your generated output for analysis.</p>
                  <div className="mt-5">
                    <button type="button" onClick={handleAiValidate} disabled={isInvalid || isAiValidating} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">{isAiValidating ? 'Validating...' : 'Validate with AI'}</button>
                  </div>
                </div>
                {aiValidationResult && (
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    {aiValidationResult.suggestions && aiValidationResult.suggestions.length > 0 && (<div className="rounded-md bg-blue-50 p-4 mb-4"><h4 className="text-sm font-medium text-blue-800">Suggestions</h4><ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-blue-700">{aiValidationResult.suggestions.map(s => <li key={s}>{s}</li>)}</ul></div>)}
                    {aiValidationResult.warnings && aiValidationResult.warnings.length > 0 && (<div className="rounded-md bg-yellow-50 p-4"><h4 className="text-sm font-medium text-yellow-800">Warnings</h4><ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-yellow-700">{aiValidationResult.warnings.map(w => <li key={w}>{w}</li>)}</ul></div>)}
                  </div>
                )}
              </div>

              {isInvalid && (<div className="rounded-md bg-red-50 p-4"><div className="flex"><div className="ml-3"><h3 className="text-sm font-medium text-red-800">Invalid Configuration</h3><div className="mt-2 text-sm text-red-700"><ul role="list" className="list-disc pl-5 space-y-1">{validationResult.errors.map(e=><li key={e}>{e}</li>)}</ul></div></div></div></div>)}
              {validationResult.warnings.length > 0 && !isInvalid && (<div className="rounded-md bg-yellow-50 p-4"><div className="flex"><div className="ml-3"><h3 className="text-sm font-medium text-yellow-800">Warnings</h3><div className="mt-2 text-sm text-yellow-700"><ul role="list" className="list-disc pl-5 space-y-1">{validationResult.warnings.map(w=><li key={w}>{w}</li>)}</ul></div></div></div></div>)}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
