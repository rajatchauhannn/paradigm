// src/components/PrimarySetupForm.tsx

import { useState, useEffect } from "react";
import { type ParfileConfig } from "../types";
import { Tooltip } from "./Tooltip";

const inputClasses =
  "block w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
const disabledClasses =
  "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

interface PrimarySetupProps {
  config: ParfileConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParfileConfig>>;
  isLogfileSame: boolean;
  onLogfileSameChange: (isChecked: boolean) => void;
  onDumpfileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PrimarySetupForm = ({
  config,
  setConfig,
  isLogfileSame,
  onLogfileSameChange,
  onDumpfileChange,
}: PrimarySetupProps) => {
  const isNetworkImport =
    config.operation === "IMPORT" && !!config.network_link;

  type StorageType = "ON_PREMISES" | "CLOUD";
  const [storageType, setStorageType] = useState<StorageType>(
    !!config.credential ? "CLOUD" : "ON_PREMISES"
  );
  // State to remember the logfile name when switching to cloud
  const [stashedLogfile, setStashedLogfile] = useState(config.logfile);

  const handleStorageTypeChange = (newType: StorageType) => {
    if (newType === storageType) return;

    setStorageType(newType);

    if (newType === "CLOUD") {
      // Stash the current logfile name before clearing it
      setStashedLogfile(config.logfile);
      setConfig((prev) => ({
        ...prev,
        directory: "",
        credential: "OCI$CREDENTIAL", // Set a default credential
        logfile: "", // Logfile is not used in cloud mode
      }));
    } else {
      // Switching back to ON_PREMISES
      setConfig((prev) => ({
        ...prev,
        directory: "DATA_PUMP_DIR", // Set a default directory
        credential: "",
        // Restore the stashed logfile name
        logfile: stashedLogfile,
      }));
    }
  };

  // Keep stashedLogfile in sync if it's changed while on-premises is active
  useEffect(() => {
    if (storageType === "ON_PREMISES") {
      setStashedLogfile(config.logfile);
    }
  }, [config.logfile, storageType]);

  return (
    <div className="space-y-4">
      {/* --- Row 1: USERID --- */}
      <div>
        <div className="flex items-center space-x-2">
          <label
            htmlFor="userid"
            className="block text-sm font-medium text-gray-700"
          >
            USERID
          </label>
          <Tooltip
            text="Specifies the database user for the operation, e.g., 'system/oracle' or '/ as sysdba'."
            learnMoreUrl="https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-data-pump-export-utility.html#GUID-5517134A-2997-4254-84E3-74A69F4E0341"
          />
        </div>
        <input
          id="userid"
          type="text"
          placeholder="/ as sysdba"
          value={config.userid}
          onChange={(e) =>
            setConfig((prev) => ({ ...prev, userid: e.target.value }))
          }
          className={inputClasses}
        />
      </div>

      {/* --- Row 2: Storage Destination Radio Group --- */}
      <fieldset>
        <div className="mt-2 flex gap-x-6">
          <div className="flex items-center">
            <input
              id="on_premises"
              value="ON_PREMISES"
              type="radio"
              checked={storageType === "ON_PREMISES"}
              onChange={() => handleStorageTypeChange("ON_PREMISES")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label
              htmlFor="on_premises"
              className="ml-2 block text-sm text-gray-900"
            >
              On-Premises
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="cloud"
              value="CLOUD"
              type="radio"
              checked={storageType === "CLOUD"}
              onChange={() => handleStorageTypeChange("CLOUD")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="cloud" className="ml-2 block text-sm text-gray-900">
              Cloud
            </label>
          </div>
        </div>
      </fieldset>

      {/* --- Conditional and always-visible fields --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {storageType === "ON_PREMISES" ? (
          <>
            <div>
              <label
                htmlFor="directory"
                className="block text-sm font-medium text-gray-700"
              >
                DIRECTORY
              </label>
              <input
                id="directory"
                type="text"
                value={config.directory}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, directory: e.target.value }))
                }
                className={`${inputClasses} ${disabledClasses}`}
                disabled={isNetworkImport}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="logfile"
                  className="block text-sm font-medium text-gray-700"
                >
                  LOGFILE
                </label>
                <div className="flex items-center">
                  <input
                    id="logfileSameAsDumpfile"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600"
                    checked={isLogfileSame}
                    onChange={(e) => onLogfileSameChange(e.target.checked)}
                  />
                  <label
                    htmlFor="logfileSameAsDumpfile"
                    className="ml-2 block text-sm"
                  >
                    Same as dumpfile
                  </label>
                </div>
              </div>
              <input
                id="logfile"
                type="text"
                name="logfile"
                value={config.logfile}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, logfile: e.target.value }))
                }
                className={`${inputClasses} ${disabledClasses}`}
                disabled={isLogfileSame}
              />
            </div>
          </>
        ) : (
          <div className="md:col-span-2">
            <label
              htmlFor="credential"
              className="block text-sm font-medium text-gray-700"
            >
              CREDENTIAL
            </label>
            <input
              id="credential"
              type="text"
              value={config.credential || ""}
              onChange={(e) =>
                setConfig((c) => ({ ...c, credential: e.target.value }))
              }
              className={`${inputClasses} ${disabledClasses}`}
              disabled={isNetworkImport}
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label
            htmlFor="dumpfile"
            className="block text-sm font-medium text-gray-700"
          >
            DUMPFILE
          </label>
          <input
            id="dumpfile"
            type="text"
            name="dumpfile"
            value={config.dumpfile}
            onChange={onDumpfileChange}
            className={`${inputClasses} ${disabledClasses}`}
            disabled={isNetworkImport}
            placeholder={
              storageType === "CLOUD"
                ? "https://your_cloud_url/export_%U.dmp"
                : "export_%U.dmp"
            }
          />
        </div>
      </div>
    </div>
  );
};
