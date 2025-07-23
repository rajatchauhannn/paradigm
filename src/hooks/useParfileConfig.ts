import { useState, useEffect } from "react";
import { type ParfileConfig } from "../types";

const getInitialState = (): ParfileConfig => ({
  operation: "EXPORT",
  directory: "DATA_PUMP_DIR",
  dumpfile: "export.dmp",
  logfile: "export.log",
  userid: "",
  export_mode: "FULL",
  schemas: "",
  tables: "",
  tablespaces: "",
  table_exists_action: "",
  import_mode: "STANDARD",
  remap_data: "",
  parallel: undefined,
  compression: "NONE",
  content: "ALL",
  query: "",
  remap_schema: "",
  remap_tablespace: "",
  flashback_time: "",
  flashback_scn: "",
  version: "",
  job_name: "",
  estimate_only: "NO",
  estimate: "BLOCKS",
  reuse_dumpfiles: "N",
  sqlfile: "",
  transform: "",
  network_link: "",
  remap_datafile: "", 
  include: "",
  exclude: "",
});

export const useParfileConfig = () => {
  const [config, setConfig] = useState<ParfileConfig>(getInitialState());
  const [isLogfileSame, setIsLogfileSame] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Effect to sync dumpfile and logfile names
  useEffect(() => {
    setConfig((currentConfig) => {
      let newDumpfile = currentConfig.dumpfile;
      const isParallel = currentConfig.parallel && currentConfig.parallel > 1;
      const hasWildcard = newDumpfile.includes("%U");

      if (currentConfig.operation === "EXPORT") {
        if (isParallel && !hasWildcard)
          newDumpfile = newDumpfile.replace(/(\.dmp)$/i, "_%U$1");
        else if (!isParallel && hasWildcard)
          newDumpfile = newDumpfile.replace(/_%U/i, "");
      }

      const newLogfile = isLogfileSame
        ? newDumpfile.replace(/(_%U)?\.dmp$/i, ".log")
        : currentConfig.logfile;

      if (
        newDumpfile !== currentConfig.dumpfile ||
        newLogfile !== currentConfig.logfile
      ) {
        return { ...currentConfig, dumpfile: newDumpfile, logfile: newLogfile };
      }
      return currentConfig;
    });
  }, [config.parallel, config.dumpfile, isLogfileSame, config.operation]);

  // Handlers
  const handleOperationChange = (op: ParfileConfig["operation"]) =>
    setConfig((c) => ({ ...c, operation: op }));
  const handleDumpfileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setConfig((c) => ({ ...c, dumpfile: e.target.value }));
  const handleLogfileSameChange = (isChecked: boolean) =>
    setIsLogfileSame(isChecked);
  const handleParallelChange = (newParallel: number | undefined) =>
    setConfig((c) => ({ ...c, parallel: newParallel }));

  const handleShowAdvancedToggle = (isChecked: boolean) => {
    setShowAdvanced(isChecked);
    if (!isChecked) {
      // Reset advanced options to their initial state
      const {
        parallel,
        compression,
        content,
        query,
        import_mode,
        remap_data,
        remap_schema,
        remap_tablespace,
        flashback_time,
        flashback_scn,
        version,
        job_name,
        estimate_only,
        estimate,
        reuse_dumpfiles,
        sqlfile,
        transform,
        network_link,
        remap_datafile,
      } = getInitialState();
      setConfig((c) => ({
        ...c,
        parallel,
        compression,
        content,
        query,
        import_mode,
        remap_data,
        remap_schema,
        remap_tablespace,
        flashback_time,
        flashback_scn,
        version,
        job_name,
        estimate_only,
        estimate,
        reuse_dumpfiles,
        sqlfile,
        transform,
        network_link,
        remap_datafile,
      }));
    }
  };

  const handleConvertToImport = () => {
    setConfig((c) => ({
      ...c,
      operation: "IMPORT",
      logfile: c.logfile.replace(/\.log$/i, "_import.log"),
      table_exists_action: "SKIP",
    }));
  };

  return {
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
  };
};
