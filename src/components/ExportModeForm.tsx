// src/components/ExportModeForm.tsx

import { type ParfileConfig } from "../types";
import { Tooltip } from "./Tooltip";

const selectClasses =
  "block w-full mt-1 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md";
const inputClasses =
  "block w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

interface ExportModeProps {
  config: ParfileConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParfileConfig>>;
}

export const ExportModeForm = ({ config, setConfig }: ExportModeProps) => {
  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as any;
    setConfig((prev) => ({
      ...prev,
      export_mode: newMode,
      transport_full_check:
        newMode === "TRANSPORTABLE_TABLESPACES"
          ? prev.transport_full_check
          : false,
    }));
  };
  return (
    <div>
      <div className="mt-4 space-y-4">
        <div>
          {/* The label and tooltip have been moved to App.tsx */}
          <select
            id="export_mode"
            value={config.export_mode}
            onChange={handleModeChange}
            className={selectClasses}
          >
            <option value="FULL">Full Database</option>
            <option value="SCHEMAS">Schemas</option>
            <option value="TABLES">Tables</option>
            <option value="TABLESPACES">Tablespaces</option>
            <option value="TRANSPORTABLE_TABLESPACES">
              Transportable Tablespaces
            </option>
            <option value="TRANSPORTABLE_PDB">
              Transportable PDB (TRANSPORTABLE=ALWAYS)
            </option>
          </select>
        </div>

        {config.export_mode === "SCHEMAS" && (
          <div>
            <div className="flex items-center space-x-2">
              <label
                htmlFor="schemas"
                className="block text-sm font-medium text-gray-700"
              >
                Schemas
              </label>
              <Tooltip
                text="A comma-separated list of schemas to export. e.g., HR,SCOTT"
                learnMoreUrl="https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-data-pump-export-utility.html#GUID-EBD5E655-4999-4A83-935C-535C57B3F023"
              />
            </div>
            <input
              id="schemas"
              type="text"
              placeholder="HR,SCOTT"
              value={config.schemas}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, schemas: e.target.value }))
              }
              className={inputClasses}
            />
          </div>
        )}
        {config.export_mode === "TABLES" && (
          <div>
            <div className="flex items-center space-x-2">
              <label
                htmlFor="tables"
                className="block text-sm font-medium text-gray-700"
              >
                Tables
              </label>
              <Tooltip
                text="Specifies a comma-separated list of tables to export. e.g., HR.EMPLOYEES,SCOTT.DEPT"
                learnMoreUrl="https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-data-pump-export-utility.html#GUID-66F53531-3A41-477F-974F-24E8246C6572"
              />
            </div>
            <input
              id="tables"
              type="text"
              placeholder="HR.EMPLOYEES"
              value={config.tables}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, tables: e.target.value }))
              }
              className={inputClasses}
            />
          </div>
        )}
        {(config.export_mode === "TABLESPACES" ||
          config.export_mode === "TRANSPORTABLE_TABLESPACES") && (
          <div>
            <div className="flex items-center space-x-2">
              <label
                htmlFor="tablespaces"
                className="block text-sm font-medium text-gray-700"
              >
                Tablespaces
              </label>
              <Tooltip
                text="A comma-separated list of tablespaces to export."
                learnMoreUrl="https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-data-pump-export-utility.html#GUID-40534419-2313-40B9-906D-96DE736E6F22"
              />
            </div>
            <input
              id="tablespaces"
              type="text"
              placeholder="USERS,EXAMPLE"
              value={config.tablespaces}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, tablespaces: e.target.value }))
              }
              className={inputClasses}
            />
          </div>
        )}
      </div>
    </div>
  );
};
