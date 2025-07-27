// src/components/AdvancedOptions.tsx
import { useState } from "react";
import {
  type AccessMethod,
  type CompressionAlgorithm,
  type EncryptionAlgorithm,
  type EncryptionMode,
  type ParfileConfig,
} from "../types";
import { compressionOptions, contentOptions } from "../constants";
import { Tooltip } from "./Tooltip";

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
const compressionAlgorithmOptions: CompressionAlgorithm[] = [
  "BASIC",
  "LOW",
  "MEDIUM",
  "HIGH",
];
const encryptionModeOptions: EncryptionMode[] = [
  "PASSWORD",
  "DUAL",
  "TRANSPARENT",
];
const encryptionAlgorithmOptions: EncryptionAlgorithm[] = [
  "AES128",
  "AES192",
  "AES256",
];
const accessMethodOptions: AccessMethod[] = [
  "AUTOMATIC",
  "DIRECT_PATH",
  "EXTERNAL_TABLE",
];

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
  const isFullExport = config.export_mode === "FULL";
  const isMetadataOnlyExport = config.content === "METADATA_ONLY";
  const isTransportableExport =
    config.export_mode === "TRANSPORTABLE_TABLESPACES";
  const isTransportableImport = config.import_mode === "TRANSPORTABLE";
  const isDataFilteringIncompatible =
    config.export_mode === "FULL" ||
    config.export_mode === "TRANSPORTABLE_TABLESPACES" ||
    config.export_mode === "TRANSPORTABLE_PDB" || // <-- ADD THIS
    config.content === "METADATA_ONLY" ||
    !!config.query ||
    !!config.sample;
  const isAccessMethodDisabled =
    (config.operation === "EXPORT" &&
      (config.content === "METADATA_ONLY" ||
        config.export_mode === "TRANSPORTABLE_TABLESPACES")) ||
    (config.operation === "IMPORT" &&
      (!!config.sqlfile || config.import_mode === "TRANSPORTABLE"));

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
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="version"
                  className="block text-sm font-medium text-gray-700"
                >
                  VERSION
                </label>
                <Tooltip
                  variant="warning" // <-- Use the new warning variant
                  text="Sets export for backward compatibility. Using this may disable newer features like advanced compression. Use with caution."
                  learnMoreUrl="https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-data-pump-common-parameters.html#GUID-8E41667A-1577-4340-9B6B-45218DE1956C"
                />
              </div>
              <input
                id="version"
                type="text"
                placeholder="e.g., 12.2"
                value={config.version || ""}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, version: e.target.value }))
                }
                className="block w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  <label
                    htmlFor="compression_algorithm"
                    className={labelClasses}
                  >
                    Compression Algorithm
                  </label>
                  <select
                    id="compression_algorithm"
                    value={config.compression_algorithm}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        compression_algorithm: e.target.value as any,
                      }))
                    }
                    className={`${selectClasses} ${
                      !["ALL", "DATA_ONLY"].includes(config.compression || "")
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      !["ALL", "DATA_ONLY"].includes(config.compression || "")
                    }
                  >
                    {compressionAlgorithmOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="encryption_password" className={labelClasses}>
                    Encryption Password
                  </label>
                  <input
                    id="encryption_password"
                    type="password"
                    value={config.encryption_password || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        encryption_password: e.target.value,
                      }))
                    }
                    className={`${inputClasses} ${
                      !config.compression?.includes("ENCRYPTED") ||
                      config.encryption_mode === "TRANSPARENT"
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      !config.compression?.includes("ENCRYPTED") ||
                      config.encryption_mode === "TRANSPARENT"
                    }
                    placeholder="Required for PASSWORD or DUAL mode"
                  />
                </div>

                {/* --- ADD Encryption Mode Dropdown --- */}
                <div>
                  <label htmlFor="encryption_mode" className={labelClasses}>
                    Encryption Mode
                  </label>
                  <select
                    id="encryption_mode"
                    value={config.encryption_mode}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        encryption_mode: e.target.value as any,
                      }))
                    }
                    className={`${selectClasses} ${
                      !config.compression?.includes("ENCRYPTED")
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={!config.compression?.includes("ENCRYPTED")}
                  >
                    {encryptionModeOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                {/* --- ADD Encryption Algorithm Dropdown --- */}
                <div>
                  <label
                    htmlFor="encryption_algorithm"
                    className={labelClasses}
                  >
                    Encryption Algorithm
                  </label>
                  <select
                    id="encryption_algorithm"
                    value={config.encryption_algorithm}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        encryption_algorithm: e.target.value as any,
                      }))
                    }
                    className={`${selectClasses} ${
                      !config.compression?.includes("ENCRYPTED")
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={!config.compression?.includes("ENCRYPTED")}
                  >
                    {encryptionAlgorithmOptions.map((o) => (
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
                    className={`${selectClasses} ${
                      isTransportableExport
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={isTransportableExport}
                  >
                    {contentOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="encryption_password" className={labelClasses}>
                    Encryption Password
                  </label>
                  <input
                    id="encryption_password"
                    type="password"
                    value={config.encryption_password || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        encryption_password: e.target.value,
                      }))
                    }
                    className={`${inputClasses} ${
                      !config.compression?.includes("ENCRYPTED")
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={!config.compression?.includes("ENCRYPTED")}
                    placeholder="Enter password to encrypt dump file"
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  id="metrics"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={!!config.metrics}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      metrics: e.target.checked,
                    }))
                  }
                />
                <label
                  htmlFor="metrics"
                  className="ml-2 block text-sm font-medium text-gray-700"
                >
                  Enable Metrics Logging
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Adds detailed performance and resource usage to the log file.
              </p>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  id="disable_cluster"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={!!config.disable_cluster}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      disable_cluster: e.target.checked,
                    }))
                  }
                />
                <label
                  htmlFor="disable_cluster"
                  className="ml-2 block text-sm font-medium text-gray-700"
                >
                  Disable Cluster Parallelism (RAC only)
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                If checked, forces the job to run only on the current instance
                (adds CLUSTER=N).
              </p>
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center">
                <input
                  id="logtime"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={!!config.logtime}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setConfig((c) => ({
                      ...c,
                      logtime: isChecked,
                      // If we uncheck logtime, we must also uncheck logtime_tz
                      logtime_tz: isChecked ? c.logtime_tz : false,
                    }));
                  }}
                />
                <label
                  htmlFor="logtime"
                  className="ml-2 block text-sm font-medium text-gray-700"
                >
                  Add Timestamps to Log
                </label>
              </div>
              <div className="flex items-center pl-6">
                <input
                  id="logtime_tz"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={!!config.logtime_tz}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      logtime_tz: e.target.checked,
                    }))
                  }
                  disabled={!config.logtime} // This is the key dependency logic
                />
                <label
                  htmlFor="logtime_tz"
                  className={`ml-2 block text-sm font-medium ${
                    !config.logtime ? "text-gray-400" : "text-gray-700"
                  }`}
                >
                  Include UTC Offset in Timestamps
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Adds a timestamp to all messages in the log file (LOGTIME=ALL).
              </p>
            </div>

            <div className="md:col-span-2 p-3 border border-yellow-400 rounded-md bg-yellow-50">
              <label
                htmlFor="abort_step"
                className="block text-sm font-medium text-yellow-800"
              >
                Abort Step (Diagnostic Use Only)
              </label>
              <input
                id="abort_step"
                type="text"
                pattern="[0-9]*" // Suggests numeric keyboard on mobile
                value={config.abort_step || ""}
                placeholder="Internal step number to halt job"
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  const parsed = parseInt(value, 10);
                  setConfig((prev) => ({
                    ...prev,
                    abort_step: isNaN(parsed) ? undefined : parsed,
                  }));
                }}
                className={inputClasses}
              />
              <p className="mt-1 text-xs text-yellow-700">
                Intentionally stops the job at a specific internal step for
                debugging. Use with caution.
              </p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="access_method" className={labelClasses}>
                Access Method
              </label>
              <select
                id="access_method"
                value={config.access_method}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    access_method: e.target.value as any,
                  }))
                }
                className={`${selectClasses} ${
                  isAccessMethodDisabled
                    ? "disabled:bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
                disabled={isAccessMethodDisabled}
              >
                {accessMethodOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Forces a specific method for loading/unloading data.
              </p>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  id="keep_master"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={!!config.keep_master}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      keep_master: e.target.checked,
                    }))
                  }
                />
                <label
                  htmlFor="keep_master"
                  className="ml-2 block text-sm font-medium text-gray-700"
                >
                  Keep Master Table (Diagnostic)
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Retains the job's master table after a successful run for
                debugging.
              </p>
            </div>

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
                className={`${selectClasses} ${
                  isFullExport ? "disabled:bg-gray-100 cursor-not-allowed" : ""
                }`}
                disabled={isFullExport}
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
                className={`${textareaClasses} ${
                  isFullExport ? "disabled:bg-gray-100 cursor-not-allowed" : ""
                }`}
                disabled={filterMode === "NONE" || isFullExport}
                placeholder={
                  isFullExport
                    ? "Filters are disabled for FULL exports."
                    : filterMode !== "NONE"
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
                    className={`${textareaClasses} ${
                      !!config.sample || isFullExport || isMetadataOnlyExport
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      !!config.sample ||
                      isFullExport ||
                      isMetadataOnlyExport ||
                      isTransportableExport
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="sample" className={labelClasses}>
                    Sample (Percentage)
                  </label>
                  <input
                    id="sample"
                    type="text"
                    value={config.sample || ""}
                    placeholder="schema.table_name:percentage"
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        sample: e.target.value,
                      }))
                    }
                    className={`${inputClasses} ${
                      !!config.query || isFullExport || isMetadataOnlyExport
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      !!config.query ||
                      isFullExport ||
                      isMetadataOnlyExport ||
                      isTransportableExport
                    }
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Export a random percentage of data. Example:
                    `HR.EMPLOYEES:10.5`
                  </p>
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
                    className={`${inputClasses} ${
                      isMetadataOnlyExport
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={isMetadataOnlyExport}
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
                    className={`${inputClasses} ${
                      isMetadataOnlyExport
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={isMetadataOnlyExport}
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

                <div>
                  <label htmlFor="reuse_dumpfiles" className={labelClasses}>
                    Reuse Dumpfiles
                  </label>
                  <select
                    id="reuse_dumpfiles"
                    value={config.reuse_dumpfiles}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        reuse_dumpfiles: e.target.value as any,
                      }))
                    }
                    className={selectClasses}
                  >
                    <option value="N">No</option>
                    <option value="Y">Yes</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="filesize" className={labelClasses}>
                    Filesize (per dump file)
                  </label>
                  <input
                    id="filesize"
                    type="text"
                    value={config.filesize || ""}
                    placeholder="e.g., 10G, 500M, 2048K"
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        filesize: e.target.value,
                      }))
                    }
                    className={inputClasses}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Splits the export into multiple files of this size. DUMPFILE
                    name will be updated with %U.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      id="transport_full_check"
                      type="checkbox"
                      className={`h-4 w-4 text-blue-600 border-gray-300 rounded ${
                        config.export_mode !== "TRANSPORTABLE_TABLESPACES"
                          ? "cursor-not-allowed"
                          : ""
                      }`}
                      checked={!!config.transport_full_check}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          transport_full_check: e.target.checked,
                        }))
                      }
                      disabled={
                        config.export_mode !== "TRANSPORTABLE_TABLESPACES"
                      }
                    />
                    <label
                      htmlFor="transport_full_check"
                      className={`ml-2 block text-sm font-medium ${
                        config.export_mode !== "TRANSPORTABLE_TABLESPACES"
                          ? "text-gray-400"
                          : "text-gray-700"
                      }`}
                    >
                      Enable Transport Full Check
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Only for Transportable Tablespace mode. Verifies all object
                    dependencies are within the tablespace set.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="source_edition" className={labelClasses}>
                    Source Edition (for EBR)
                  </label>
                  <input
                    id="source_edition"
                    type="text"
                    value={config.source_edition || ""}
                    placeholder="e.g., V2_1_2024"
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        source_edition: e.target.value,
                      }))
                    }
                    className={inputClasses}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Specifies the source database edition for the export.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="views_as_tables" className={labelClasses}>
                    Views as Tables
                  </label>
                  <textarea
                    id="views_as_tables"
                    rows={3}
                    value={config.views_as_tables || ""}
                    placeholder="HR.V_EMP_DEPT:EMP_DEPT_DATA
SCOTT.V_SALES:SALES_DATA"
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        views_as_tables: e.target.value,
                      }))
                    }
                    className={`${textareaClasses} ${
                      isDataFilteringIncompatible
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={isDataFilteringIncompatible}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Export data from a view as if it were a table. One entry per
                    line.
                  </p>
                </div>
              </>
            )}

            {/* --- IMPORT Specific Options --- */}
            {config.operation === "IMPORT" && (
              <>
                <div className="md:col-span-2 p-4 border rounded-md bg-gray-50">
                  <label className={`${labelClasses} mb-2`}>Data Options</label>
                  <div className="space-y-3">
                    {/* Checkbox for Skip Constraints */}
                    <div className="flex items-center">
                      <input
                        id="data_options_skip_constraints"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={!!config.data_options_skip_constraints}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            data_options_skip_constraints: e.target.checked,
                          }))
                        }
                      />
                      <label
                        htmlFor="data_options_skip_constraints"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Skip Constraint Errors
                      </label>
                    </div>
                    <div>
                      <label
                        htmlFor="partition_options"
                        className={labelClasses}
                      >
                        Partition Options
                      </label>
                      <select
                        id="partition_options"
                        value={config.partition_options}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            partition_options: e.target.value as any,
                          }))
                        }
                        className={`${selectClasses} ${
                          !["APPEND", "MERGE"].includes(
                            config.table_exists_action
                          )
                            ? "disabled:bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={
                          !["APPEND", "MERGE"].includes(
                            config.table_exists_action
                          )
                        }
                      >
                        <option value="">(Default)</option>
                        <option value="NONE">
                          None (Create tables as in source)
                        </option>
                        <option value="APPEND">
                          Append partitions to target table
                        </option>
                        <option value="MERGE">
                          Merge source partitions into target
                        </option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Controls how partitions are handled on import. Often
                        used with TABLE_EXISTS_ACTION.
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center">
                        <input
                          id="skip_unusable_indexes"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={!!config.skip_unusable_indexes}
                          onChange={(e) =>
                            setConfig((c) => ({
                              ...c,
                              skip_unusable_indexes: e.target.checked,
                            }))
                          }
                        />
                        <label
                          htmlFor="skip_unusable_indexes"
                          className="ml-2 block text-sm font-medium text-gray-700"
                        >
                          Skip Unusable Indexes
                        </label>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Continue the import even if indexes fail to build.
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center">
                        <input
                          id="disable_streams_configuration"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={!!config.disable_streams_configuration}
                          onChange={(e) =>
                            setConfig((c) => ({
                              ...c,
                              disable_streams_configuration: e.target.checked,
                            }))
                          }
                        />
                        <label
                          htmlFor="disable_streams_configuration"
                          className="ml-2 block text-sm font-medium text-gray-700"
                        >
                          Disable Streams Configuration Import
                        </label>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Prevents Oracle Streams metadata from being imported.
                      </p>
                    </div>

                    <div className="md:col-span-2 p-3 border border-yellow-400 rounded-md bg-yellow-50">
                      <div className="flex items-center">
                        <input
                          id="master_only"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={!!config.master_only}
                          onChange={(e) =>
                            setConfig((c) => ({
                              ...c,
                              master_only: e.target.checked,
                            }))
                          }
                        />
                        <label
                          htmlFor="master_only"
                          className="ml-2 block text-sm font-medium text-yellow-800"
                        >
                          Import Master Table Only (Expert Use)
                        </label>
                      </div>
                      <p className="mt-1 text-xs text-yellow-700">
                        For job recovery only. Loads the job state without
                        importing data. Most other import options will be
                        ignored.
                      </p>
                    </div>

                    {/* Select for XML Validation */}
                    <div>
                      <label
                        htmlFor="data_options_xml_validation"
                        className="block text-sm font-medium text-gray-600 mb-1"
                      >
                        XML Schema Validation
                      </label>
                      <select
                        id="data_options_xml_validation"
                        value={config.data_options_xml_validation}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            data_options_xml_validation: e.target.value as any,
                          }))
                        }
                        className={selectClasses}
                      >
                        <option value="">(Default)</option>
                        <option value="VALIDATE">Enable Validation</option>
                        <option value="DISABLE">Disable Validation</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClasses}>Import Mode</label>
                  <div className="flex gap-x-6 mt-1">
                    <div className="flex items-center">
                      <input
                        id="mode_standard"
                        type="radio"
                        value="STANDARD"
                        checked={config.import_mode === "STANDARD"}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            import_mode: e.target.value as any,
                            remap_datafile: "",
                          }))
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="mode_standard" className="ml-2">
                        Standard
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="mode_transportable"
                        type="radio"
                        value="TRANSPORTABLE"
                        checked={config.import_mode === "TRANSPORTABLE"}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            import_mode: e.target.value as any,
                            remap_schema: "", // <-- Clear the other mode's fields
                            remap_tablespace: "",
                          }))
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="mode_transportable" className="ml-2">
                        Transportable
                      </label>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="transport_datafiles" className={labelClasses}>
                    Transport Datafiles (Source Paths)
                  </label>
                  <textarea
                    id="transport_datafiles"
                    rows={3}
                    value={config.transport_datafiles || ""}
                    placeholder="'/path/to/source_file1.dbf', '/path/to/source_file2.dbf'"
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        transport_datafiles: e.target.value,
                      }))
                    }
                    className={`${textareaClasses} ${
                      config.import_mode !== "TRANSPORTABLE"
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={config.import_mode !== "TRANSPORTABLE"}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Required for Transportable mode. List the source datafile
                    paths.
                  </p>
                </div>

                {/* --- UPDATE a.remap_schema --- */}
                <div>
                  <label htmlFor="remap_schema" className={labelClasses}>
                    Remap Schema
                  </label>
                  <input
                    id="remap_schema"
                    value={config.remap_schema || ""}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, remap_schema: e.target.value }))
                    }
                    placeholder="source_schema:target_schema"
                    className={`${inputClasses} ${
                      config.import_mode !== "STANDARD"
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={config.import_mode !== "STANDARD"}
                  />
                </div>
                {/* --- UPDATE b.remap_tablespace --- */}
                <div>
                  <label htmlFor="remap_tablespace" className={labelClasses}>
                    Remap Tablespace
                  </label>
                  <input
                    id="remap_tablespace"
                    value={config.remap_tablespace || ""}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        remap_tablespace: e.target.value,
                      }))
                    }
                    placeholder="source_ts:target_ts"
                    className={`${inputClasses} ${
                      config.import_mode !== "STANDARD"
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={config.import_mode !== "STANDARD"}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="remap_table" className={labelClasses}>
                    Remap Table
                  </label>
                  <textarea
                    id="remap_table"
                    rows={3}
                    value={config.remap_table || ""}
                    placeholder="HR.EMPLOYEES:EMPLOYEES_BACKUP
SCOTT.DEPT:DEPT_OLD"
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        remap_table: e.target.value,
                      }))
                    }
                    className={`${textareaClasses} ${
                      config.import_mode === "TRANSPORTABLE"
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={config.import_mode === "TRANSPORTABLE"}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Rename tables during import. One entry per line.
                  </p>
                </div>
                {/* --- UPDATE c.remap_datafile --- */}
                <div>
                  <label htmlFor="remap_datafile" className={labelClasses}>
                    Remap Datafile
                  </label>
                  <input
                    id="remap_datafile"
                    value={config.remap_datafile || ""}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        remap_datafile: e.target.value,
                      }))
                    }
                    placeholder="'/path/source.dbf':'/path/target.dbf'"
                    className={`${inputClasses} ${
                      config.import_mode !== "TRANSPORTABLE"
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={config.import_mode !== "TRANSPORTABLE"}
                  />
                </div>
                <div>
                  <label htmlFor="remap_container" className={labelClasses}>
                    Remap Container (PDB)
                  </label>
                  <input
                    id="remap_container"
                    type="text"
                    value={config.remap_container || ""}
                    placeholder="source_pdb:target_pdb"
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        remap_container: e.target.value,
                      }))
                    }
                    className={`${inputClasses} ${
                      config.import_mode === "TRANSPORTABLE"
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={config.import_mode === "TRANSPORTABLE"}
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
                <div className="md:col-span-2">
                  <label htmlFor="transform" className={labelClasses}>
                    Transform
                  </label>
                  <textarea
                    id="transform"
                    rows={3}
                    value={config.transform || ""}
                    placeholder={`Example: SEGMENT_ATTRIBUTES:N\nOr: STORAGE:N:TABLE`}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        transform: e.target.value,
                      }))
                    }
                    className={textareaClasses}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Modify DDL on the fly. Example: `SEGMENT_ATTRIBUTES:N` to
                    strip all storage clauses.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="remap_data" className={labelClasses}>
                    Remap Data (Column Data Transformation)
                  </label>
                  <textarea
                    id="remap_data"
                    rows={3}
                    value={config.remap_data || ""}
                    placeholder={`Example: HR.EMPLOYEES.SALARY:SYS.MASK_SALARY_FUNC`}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        remap_data: e.target.value,
                      }))
                    }
                    className={`${textareaClasses} ${
                      config.import_mode !== "STANDARD"
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={config.import_mode !== "STANDARD"}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Apply a function to transform data for a specific column on
                    import.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="network_link" className={labelClasses}>
                    Network Link (for direct DB-to-DB import)
                  </label>
                  <input
                    id="network_link"
                    type="text"
                    placeholder="dblink_to_source_db"
                    value={config.network_link}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        network_link: e.target.value,
                      }))
                    }
                    className={`${inputClasses} ${
                      isTransportableImport
                        ? "disabled:bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={isTransportableImport}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    If used, DUMPFILE and DIRECTORY are ignored.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
