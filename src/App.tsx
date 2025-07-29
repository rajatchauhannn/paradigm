import { useState, useEffect } from "react";
import { type ValidationResult } from "./utils/validateConfig";
import { validateConfig } from "./utils/validateConfig";
import { generateParfileContent } from "./utils/parfileGenerator";
import { validateWithAI } from "./api/client";
import { useParfileConfig } from "./hooks/useParfileConfig";

import { OperationToggle } from "./components/OperationToggle";
import { AdvancedOptions } from "./components/AdvancedOptions";
import { ExportModeForm } from "./components/ExportModeForm";
import { ImportOptionsForm } from "./components/ImportOptionsForm";
import { PrimarySetupForm } from "./components/PrimarySetupForm";
import { OutputColumn } from "./components/OutputColumn";
import { Tooltip } from "./components/Tooltip";

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-3">
    {children}
  </h3>
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

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // Default to user's system preference if no theme is saved
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

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
    const parfile = generateParfileContent(config);
    const contentToValidate = `OPERATION: ${config.operation}\n\n${parfile}`;

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
    <div className="min-h-screen font-sans text-sm text-gray-900 dark:text-gray-200">
      <header className="bg-white dark:bg-slate-700 shadow-sm dark:shadow-none sticky top-0 z-10 border-b border-transparent dark:border-slate-600">
        <div className="max-w-screen-2xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <a href="/" className="flex items-center no-underline">
              <img
                src="/logo.png"
                alt="PARadigm Logo"
                className="h-12 w-auto mr-4"
              />
              {/* This h1 now has the correct dark mode text color */}
              <h1 className="text-xl font-bold leading-6 text-gray-900 dark:text-gray-100">
                AI-Powered Oracle Data Pump Parfile Generator
              </h1>
            </a>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                // Moon Icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                // Sun Icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-screen-2xl mx-auto py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-6 lg:items-start space-y-6 lg:space-y-0">
          <div className="lg:col-span-5 bg-white dark:bg-slate-800 shadow-md sm:rounded-lg p-5 space-y-6">
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
              {/* This new div wrapper correctly aligns the header and tooltip */}
              <div className="flex items-center space-x-2 mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-300">
                  {config.operation === "EXPORT"
                    ? "Export Mode"
                    : "Table Exists Action"}
                </h3>
                {config.operation === "EXPORT" ? (
                  <Tooltip
                    text="Defines the scope of the export. For example, FULL for the entire database or SCHEMAS for specific schemas."
                    learnMoreUrl="https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-data-pump-export-utility.html#GUID-9B5521C5-2C47-4148-B589-9A3492659A70"
                  />
                ) : (
                  <Tooltip
                    text="Action to take if a table already exists. SKIP: Leave existing table. APPEND: Add new rows. TRUNCATE: Delete existing rows, then add new. REPLACE: Drop existing table, create new, and add rows."
                    learnMoreUrl="https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-data-pump-import-utility.html#GUID-8311B61A-2345-422E-A433-5147AA3C4532"
                  />
                )}
              </div>
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
            {/* THIS IS THE ONLY CHANGE IN APP.TSX */}
            <OutputColumn
              config={config}
              handleConvertToImport={handleConvertToImport}
              isInvalid={isInvalid}
            />
            {(isInvalid || validationResult.warnings.length > 0) && (
              <div className="bg-white dark:bg-slate-800 shadow-md sm:rounded-lg p-4 space-y-3">
                {isInvalid && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-3 border border-transparent dark:border-red-800/60">
                    <h3 className="text-xs font-bold text-red-800 dark:text-red-200">
                      Configuration Errors
                    </h3>
                    <div className="mt-2 text-xs text-red-700 dark:text-red-300">
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
            <div className="bg-white dark:bg-slate-800 shadow-md sm:rounded-lg">
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
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-3">
                    <p>Click for an extra layer of checks.</p>
                  </div>
                )}
                {aiValidationResult?.errors?.length > 0 && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-3 border border-transparent dark:border-red-800/60">
                    <h4 className="text-xs font-bold text-red-800 dark:text-red-200">
                      Errors
                    </h4>
                    <ul className="mt-2 text-xs text-red-700 dark:text-red-300 list-disc pl-4 space-y-1">
                      {aiValidationResult.errors.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiValidationResult?.warnings?.length > 0 && (
                  <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-3 border border-transparent dark:border-yellow-800/60">
                    <h4 className="text-xs font-bold text-yellow-800 dark:text-yellow-200">
                      Warnings
                    </h4>
                    <ul className="mt-2 text-xs text-yellow-700 dark:text-yellow-300 list-disc pl-4 space-y-1">
                      {aiValidationResult.warnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiValidationResult?.suggestions?.length > 0 && (
                  <div className="rounded-md bg-blue-50 dark:bg-blue-900/30 p-3 border border-transparent dark:border-blue-800/60">
                    <h4 className="text-xs font-bold text-blue-800 dark:text-blue-200">
                      Suggestions
                    </h4>
                    <ul className="mt-2 text-xs text-blue-700 dark:text-blue-300 list-disc pl-4 space-y-1">
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
