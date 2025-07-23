import { useState, useEffect } from "react";
import { type ValidationResult } from "./utils/validateConfig";
import { validateConfig } from "./utils/validateConfig";
import {
  generateParfileContent,
  generateCommand,
} from "./utils/parfileGenerator";
import { validateWithAI } from "./api/validator";
import { useParfileConfig } from "./hooks/useParfileConfig";

import { OperationToggle } from "./components/OperationToggle";
import { AdvancedOptions } from "./components/AdvancedOptions";
import { ExportModeForm } from "./components/ExportModeForm";
import { ImportOptionsForm } from "./components/ImportOptionsForm";
import { CopyButton } from "./components/CopyButton";
import { PrimarySetupForm } from "./components/PrimarySetupForm";

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-semibold text-gray-900 mb-3">{children}</h3>
);

function App() {
  const {
    config,
    setConfig,
    isLogfileSame,
    showAdvanced,
    handleOperationChange,
    handleDumpfileChange,
    handleLogfileSameChange,
    handleParallelChange,
    handleShowAdvancedToggle,
    handleConvertToImport,
  } = useParfileConfig();

  const [outputMode, setOutputMode] = useState<"parfile" | "command">(
    "parfile"
  );
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    errors: [],
    warnings: [],
  });
  const [isAiValidating, setIsAiValidating] = useState(false);
  const [aiValidationResult, setAiValidationResult] =
    useState<ValidationResult | null>(null);

  // Local validation effect remains here as it's tied to the UI
  useEffect(() => {
    setValidationResult(validateConfig(config));
  }, [config]);

  const isInvalid = validationResult.errors.length > 0;

  const handleAiValidate = async () => {
    setIsAiValidating(true);
    setAiValidationResult(null);
    const contentToValidate =
      outputMode === "command"
        ? generateCommand(config, outputMode)
        : generateParfileContent(config);

    try {
      const result = await validateWithAI(contentToValidate);
      setAiValidationResult(result);
    } catch (error: any) {
      setAiValidationResult({
        errors: [error.message],
        warnings: [],
        suggestions: [],
      });
    } finally {
      setIsAiValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-sm">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold leading-6 text-gray-900">
            ParfileForge
          </h1>
        </div>
      </header>
      <main className="max-w-screen-2xl mx-auto py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-6 lg:items-start space-y-6 lg:space-y-0">
          <div className="lg:col-span-5 bg-white shadow-md sm:rounded-lg p-5 space-y-6">
            <div className="border-b border-gray-200 pb-5">
              <SectionHeader>Operation</SectionHeader>
              <OperationToggle
                operation={config.operation}
                onOperationChange={handleOperationChange}
              />
            </div>
            <div className="border-b border-gray-200 pb-5">
              <PrimarySetupForm
                config={config}
                setConfig={setConfig}
                isLogfileSame={isLogfileSame}
                onLogfileSameChange={handleLogfileSameChange}
                onDumpfileChange={handleDumpfileChange}
              />
            </div>
            <div className="border-b border-gray-200 pb-5">
              <SectionHeader>
                {config.operation === "EXPORT"
                  ? "Export Mode"
                  : "Table Exists Action"}
              </SectionHeader>
              {config.operation === "EXPORT" ? (
                <ExportModeForm config={config} setConfig={setConfig} />
              ) : (
                <ImportOptionsForm config={config} setConfig={setConfig} />
              )}
            </div>
            <div>
              <AdvancedOptions
                config={config}
                setConfig={setConfig}
                showAdvanced={showAdvanced}
                onShowAdvancedToggle={handleShowAdvancedToggle}
                onParallelChange={handleParallelChange}
              />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky top-20">
            <div className="bg-white shadow-md sm:rounded-lg">
              <div className="p-4 flex justify-between items-center">
                <h3 className="text-sm font-semibold">Output</h3>
                <fieldset className="flex gap-x-4">
                  <div className="flex items-center">
                    <input
                      id="mode_parfile"
                      type="radio"
                      value="parfile"
                      checked={outputMode === "parfile"}
                      onChange={(e) => setOutputMode(e.target.value as any)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="mode_parfile" className="ml-2">
                      Parfile + Cmd
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="mode_command"
                      type="radio"
                      value="command"
                      checked={outputMode === "command"}
                      onChange={(e) => setOutputMode(e.target.value as any)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="mode_command" className="ml-2">
                      Command Only
                    </label>
                  </div>
                </fieldset>
              </div>
              <div className="p-4 pt-0 space-y-4">
                {outputMode === "parfile" && (
                  <div className="relative">
                    <textarea
                      rows={12}
                      readOnly
                      value={generateParfileContent(config)}
                      className="w-full p-2 font-mono bg-gray-100 border rounded-md"
                    />
                    <CopyButton
                      contentToCopy={generateParfileContent(config)}
                    />
                  </div>
                )}
                <div className="relative">
                  <textarea
                    rows={outputMode === "command" ? 18 : 5}
                    readOnly
                    value={generateCommand(config, outputMode)}
                    className="w-full p-2 font-mono bg-gray-100 border rounded-md"
                  />
                  <CopyButton
                    contentToCopy={generateCommand(config, outputMode)}
                  />
                </div>
              </div>
              <div className="px-4 py-3 pt-0 text-right">
                {config.operation === "EXPORT" && (
                  <button
                    onClick={handleConvertToImport}
                    disabled={isInvalid}
                    className="py-1 px-3 border border-gray-300 shadow-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Create Matching Import
                  </button>
                )}
              </div>
            </div>
            {(isInvalid || validationResult.warnings.length > 0) && (
              <div className="bg-white shadow-md sm:rounded-lg p-4 space-y-3">
                {isInvalid && (
                  <div className="rounded-md bg-red-50 p-3">
                    <h3 className="text-xs font-bold text-red-800">
                      Configuration Errors
                    </h3>
                    <div className="mt-2 text-xs text-red-700">
                      <ul className="list-disc pl-4 space-y-1">
                        {validationResult.errors.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {!isInvalid && validationResult.warnings.length > 0 && (
                  <div className="rounded-md bg-yellow-50 p-3">
                    <h3 className="text-xs font-bold text-yellow-800">
                      Warnings
                    </h3>
                    <div className="mt-2 text-xs text-yellow-700">
                      <ul className="list-disc pl-4 space-y-1">
                        {validationResult.warnings.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Validation Panel remains the same */}
          <div className="lg:col-span-3 lg:sticky top-20">
            <div className="bg-white shadow-md sm:rounded-lg">
              <div className="p-4">
                <h3 className="text-sm font-semibold mb-3">
                  Advanced Validation
                </h3>
                <button
                  type="button"
                  onClick={handleAiValidate}
                  disabled={isInvalid || isAiValidating}
                  className="w-full py-2 px-4 border shadow-sm rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {isAiValidating ? "Validating..." : "Validate with AI"}
                </button>
              </div>
              <div className="border-t border-gray-200 p-4 space-y-3">
                {!aiValidationResult && !isAiValidating && (
                  <div className="text-center text-xs text-gray-500 py-3">
                    <p>Click for an extra layer of checks.</p>
                  </div>
                )}
                {aiValidationResult?.errors?.length > 0 && (
                  <div className="rounded-md bg-red-50 p-3">
                    <h4 className="text-xs font-bold text-red-800">Errors</h4>
                    <ul className="mt-2 text-xs text-red-700 list-disc pl-4 space-y-1">
                      {aiValidationResult.errors.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiValidationResult?.warnings?.length > 0 && (
                  <div className="rounded-md bg-yellow-50 p-3">
                    <h4 className="text-xs font-bold text-yellow-800">
                      Warnings
                    </h4>
                    <ul className="mt-2 text-xs text-yellow-700 list-disc pl-4 space-y-1">
                      {aiValidationResult.warnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiValidationResult?.suggestions?.length > 0 && (
                  <div className="rounded-md bg-blue-50 p-3">
                    <h4 className="text-xs font-bold text-blue-800">
                      Suggestions
                    </h4>
                    <ul className="mt-2 text-xs text-blue-700 list-disc pl-4 space-y-1">
                      {aiValidationResult.suggestions.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
