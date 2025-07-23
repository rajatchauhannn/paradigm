// src/components/ImportOptionsForm.tsx

import { type ParfileConfig } from "../types";

const selectClasses =
  "block w-full mt-1 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md";
const inputClasses =
  "block w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

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
          <label
            htmlFor="import_schemas"
            className="block text-sm font-medium text-gray-700"
          >
            Schemas (optional filter)
          </label>
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
