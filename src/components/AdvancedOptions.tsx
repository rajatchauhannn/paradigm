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
  const isFullExport = config.export_mode === "FULL";
  const isMetadataOnlyExport = config.content === "METADATA_ONLY";
  const isTransportableImport = config.import_mode === "TRANSPORTABLE";

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
                      !!config.sample || isFullExport || isMetadataOnlyExport
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
                      !!config.query || isFullExport || isMetadataOnlyExport
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
