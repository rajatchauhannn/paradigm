// src/components/OutputColumn.tsx

import { type ParfileConfig } from "../types";
import {
  generateParfileContent,
  generateCommand,
} from "../utils/parfileGenerator";
import { CopyButton } from "./CopyButton";

interface OutputColumnProps {
  config: ParfileConfig;
  handleConvertToImport: () => void;
  isInvalid: boolean;
}

export const OutputColumn = ({
  config,
  handleConvertToImport,
  isInvalid,
}: OutputColumnProps) => {
  const parfileContent = generateParfileContent(config);
  const commandText = generateCommand(config);

  return (
    <div className="bg-white dark:bg-slate-800 shadow-md sm:rounded-lg">
      <div className="p-4 flex justify-between items-center">
        <h3 className="text-sm font-semibold">Output</h3>
      </div>
      <div className="p-4 pt-0 space-y-4">
        {/* Parfile Text Area */}
        <div className="relative">
          <textarea
            rows={12}
            readOnly
            value={parfileContent}
            className="w-full p-2 font-mono bg-gray-100 dark:bg-slate-700 dark:text-gray-200 dark:border-slate-600 border rounded-md text-xl focus:outline-none"
            spellCheck="false"
          />
          <CopyButton contentToCopy={parfileContent} />
        </div>
        {/* Command Text Area */}
        <div className="relative">
          <textarea
            rows={5}
            readOnly
            value={commandText}
            className="w-full p-2 font-mono bg-gray-100 dark:bg-slate-700 dark:text-gray-200 dark:border-slate-600 border rounded-md text-xl focus:outline-none"
            spellCheck="false"
          />
          <CopyButton contentToCopy={commandText} />
        </div>
      </div>
      <div className="px-4 py-3 pt-0 text-right">
        {config.operation === "EXPORT" && (
          <button
            onClick={handleConvertToImport}
            disabled={isInvalid}
            className="py-1 px-3 border border-gray-300 dark:border-slate-500 shadow-sm rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-600 hover:bg-gray-50 dark:hover:bg-slate-500 disabled:opacity-50"
          >
            Create Matching Import
          </button>
        )}
      </div>
    </div>
  );
};
