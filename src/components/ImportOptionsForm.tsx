// src/components/ImportOptionsForm.tsx

import { type ParfileConfig } from "../types";
import { Tooltip } from "./Tooltip";

const selectClasses =
  "block w-full mt-1 pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md";
const inputClasses =
  "block w-full mt-1 px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm";
interface ImportOptionsProps {
  config: ParfileConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParfileConfig>>;
}

export const ImportOptionsForm = ({
  config,
  setConfig,
}: ImportOptionsProps) => {
  return (
    <div>
      <div className="mt-4 space-y-4">
        <div>
          {/* The misplaced tooltip has been removed from here */}
          <select
            id="table_exists_action"
            value={config.table_exists_action}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                table_exists_action: e.target.value as any,
              }))
            }
            className={selectClasses}
          >
            <option value="" disabled>
              -- Must Select --
            </option>
            <option value="SKIP">SKIP</option>
            <option value="APPEND">APPEND</option>
            <option value="TRUNCATE">TRUNCATE</option>
            <option value="REPLACE">REPLACE</option>
          </select>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <label
              htmlFor="import_schemas"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Schemas (optional filter)
            </label>
            <Tooltip
              text="A comma-separated list of schemas to load from the dump file. Acts as a filter for the import."
              learnMoreUrl="https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-data-pump-import-utility.html#GUID-3F435529-E77A-4433-87E7-33E165A023A1"
            />
          </div>
          <input
            id="import_schemas"
            type="text"
            placeholder="HR,SCOTT"
            value={config.schemas}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, schemas: e.target.value }))
            }
            className={inputClasses}
          />
        </div>
      </div>
    </div>
  );
};
