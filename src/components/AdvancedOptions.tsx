// src/components/AdvancedOptions.tsx
import { useState } from "react";
import { type ParfileConfig } from "../types";
import { compressionOptions, contentOptions } from "../constants";

// --- Re-usable Tailwind CSS classes for consistency ---
const inputClasses =
  "block w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
const selectClasses =
  "block w-full mt-1 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md";
const textareaClasses =
  "shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md";
const labelClasses = "block text-sm font-medium text-gray-700";

// --- Static options ---
const estimateOptions = ["NO", "YES"];
const estimateMethodOptions = ["BLOCKS", "STATISTICS"];
const filterOptions = ["NONE", "INCLUDE", "EXCLUDE"];

// --- Component Props Interface ---
interface AdvancedOptionsProps {
  config: ParfileConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParfileConfig>>;
  showAdvanced: boolean;
  onShowAdvancedToggle: (isChecked: boolean) => void;
  onParallelChange: (value: number | undefined) => void;
}

export const AdvancedOptions = ({
  config,
  setConfig,
  showAdvanced,
  onShowAdvancedToggle,
  onParallelChange,
}: AdvancedOptionsProps) => {
  const handleParallelInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Sanitize input to only allow integers
    const value = e.target.value.replace(/[^0-9]/g, "");
    const parsed = parseInt(value, 10);
    onParallelChange(isNaN(parsed) ? undefined : parsed);
  };

  // Determine the current filter type based on the config state
  const [filterMode, setFilterMode] = useState<"NONE" | "INCLUDE" | "EXCLUDE">(
    () => {
      if (config.include) return "INCLUDE";
      if (config.exclude) return "EXCLUDE";
      return "NONE";
    }
  );

  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as "NONE" | "INCLUDE" | "EXCLUDE";
    setFilterMode(newMode); // This updates the UI immediately

    const text = config.include || config.exclude || "";
    if (newMode === "INCLUDE") {
      setConfig((c) => ({ ...c, include: text, exclude: "" }));
    } else if (newMode === "EXCLUDE") {
      setConfig((c) => ({ ...c, include: "", exclude: text }));
    } else {
      setConfig((c) => ({ ...c, include: "", exclude: "" }));
    }
  };

  const handleFilterTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (filterMode === "INCLUDE") {
      setConfig((c) => ({ ...c, include: value }));
    } else if (filterMode === "EXCLUDE") {
      setConfig((c) => ({ ...c, exclude: value }));
    }
  };

  return (
    <div>
      {/* --- Toggle Button --- */}
      <div className="flex items-center">
        <input
          id="showAdvanced"
          type="checkbox"
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          checked={showAdvanced}
          onChange={(e) => onShowAdvancedToggle(e.target.checked)}
        />
        <label
          htmlFor="showAdvanced"
          className="ml-3 block text-sm font-medium text-gray-700"
        >
          Show Advanced Options
        </label>
      </div>

      {/* --- Advanced Options Panel --- */}
      {showAdvanced && (
        <div className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
            {/* --- General Options --- */}
            <div>
              <label htmlFor="parallel" className={labelClasses}>
                Parallel
              </label>
              <input
                id="parallel"
                type="text"
                pattern="[0-9]*"
                min="1"
                value={config.parallel || ""}
                onChange={handleParallelInputChange}
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="version" className={labelClasses}>
                Version (for compatibility)
              </label>
              <input
                id="version"
                type="text"
                placeholder="COMPATIBLE | LATEST | 12.2"
                value={config.version || ""}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, version: e.target.value }))
                }
                className={inputClasses}
              />
            </div>

            

            {/* --- EXPORT Specific Options --- */}
            {config.operation === "EXPORT" && (
              <>
                <div>
                  <label htmlFor="compression" className={labelClasses}>
                    Compression
                  </label>
                  <select
                    id="compression"
                    value={config.compression}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        compression: e.target.value as any,
                      }))
                    }
                    className={selectClasses}
                  >
                    {compressionOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="content" className={labelClasses}>
                    Content
                  </label>
                  <select
                    id="content"
                    value={config.content}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        content: e.target.value as any,
                      }))
                    }
                    className={selectClasses}
                  >
                    {contentOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label htmlFor="job_name" className={labelClasses}>
                Job Name (for monitoring)
              </label>
              <input
                id="job_name"
                type="text"
                placeholder="exp_full_prod_20240726"
                value={config.job_name || ""}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, job_name: e.target.value }))
                }
                className={inputClasses}
              />
            </div>
            
            {/* --- Unified Filter Control (FIXED) --- */}
            <div className="md:col-span-2">
              <label htmlFor="filter_type" className={labelClasses}>
                Object Filter (Include/Exclude)
              </label>
              <select
                id="filter_type"
                value={filterMode}
                onChange={handleFilterTypeChange}
                className={selectClasses}
              >
                {filterOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <textarea
                id="filter_text"
                rows={3}
                value={config.include || config.exclude || ""}
                onChange={handleFilterTextChange}
                className={textareaClasses}
                disabled={filterMode === "NONE"}
                placeholder={
                  filterMode !== "NONE"
                    ? `Example: ${filterMode}:("TABLE:'LIKE ''EMP%'''")`
                    : "Select a filter type to begin"
                }
              />
              <p className="mt-1 text-xs text-gray-500">
                Filter objects using Data Pump syntax.
              </p>
            </div>

            {/* --- EXPORT Specific Options --- */}
            {config.operation === "EXPORT" && (
              <>
                <div className="md:col-span-2">
                  <label htmlFor="query" className={labelClasses}>
                    Query
                  </label>
                  <textarea
                    id="query"
                    rows={3}
                    value={config.query}
                    placeholder='TABLE_NAME:"WHERE clause"'
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, query: e.target.value }))
                    }
                    className={textareaClasses}
                  />
                </div>

                <div>
                  <label htmlFor="flashback_time" className={labelClasses}>
                    Flashback Time
                  </label>
                  <input
                    id="flashback_time"
                    type="text"
                    placeholder="TO_TIMESTAMP(...)"
                    value={config.flashback_time}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        flashback_time: e.target.value,
                        flashback_scn: "",
                      }))
                    }
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label htmlFor="flashback_scn" className={labelClasses}>
                    Flashback SCN
                  </label>
                  <input
                    id="flashback_scn"
                    type="text"
                    placeholder="System Change Number"
                    value={config.flashback_scn}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        flashback_scn: e.target.value,
                        flashback_time: "",
                      }))
                    }
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label htmlFor="estimate_only" className={labelClasses}>
                    Estimate Only (Dry Run)
                  </label>
                  <select
                    id="estimate_only"
                    value={config.estimate_only}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        estimate_only: e.target.value as any,
                      }))
                    }
                    className={selectClasses}
                  >
                    {estimateOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="estimate" className={labelClasses}>
                    Estimation Method
                  </label>
                  <select
                    id="estimate"
                    value={config.estimate}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        estimate: e.target.value as any,
                      }))
                    }
                    className={`${selectClasses} ${
                      config.estimate_only !== "YES"
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={config.estimate_only !== "YES"}
                  >
                    {estimateMethodOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* --- IMPORT Specific Options --- */}
            {config.operation === "IMPORT" && (
              <>
                <div>
                  <label htmlFor="remap_schema" className={labelClasses}>
                    Remap Schema
                  </label>
                  <input
                    id="remap_schema"
                    type="text"
                    placeholder="source_schema:target_schema"
                    value={config.remap_schema}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        remap_schema: e.target.value,
                      }))
                    }
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="sqlfile" className={labelClasses}>
                    SQL File (generates DDL)
                  </label>
                  <input
                    id="sqlfile"
                    type="text"
                    placeholder="import_ddl.sql"
                    value={config.sqlfile || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        sqlfile: e.target.value,
                      }))
                    }
                    className={inputClasses}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
