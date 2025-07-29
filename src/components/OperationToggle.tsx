// src/components/OperationToggle.tsx
import { type ParfileConfig } from "../types";

interface OperationToggleProps {
  operation: ParfileConfig["operation"];
  onOperationChange: (op: ParfileConfig["operation"]) => void;
}

export const OperationToggle = ({
  operation,
  onOperationChange,
}: OperationToggleProps) => {
  const baseClasses =
    "flex-1 px-4 py-2 text-sm font-medium text-center border-y first:border-l last:border-r first:rounded-l-md last:rounded-r-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
  const activeClasses = "bg-red-600 text-white";
  const inactiveClasses =
    "bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600";

  return (
    <div>
      <div className="flex">
        <div
          onClick={() => onOperationChange("EXPORT")}
          className={`${baseClasses} ${
            operation === "EXPORT" ? activeClasses : inactiveClasses
          }`}
        >
          Export (expdp)
        </div>
        <div
          onClick={() => onOperationChange("IMPORT")}
          className={`${baseClasses} ${
            operation === "IMPORT" ? activeClasses : inactiveClasses
          }`}
        >
          Import (impdp)
        </div>
      </div>
    </div>
  );
};
