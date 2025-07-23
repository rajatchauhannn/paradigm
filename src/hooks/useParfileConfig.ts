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
  data_options_skip_constraints: false,
  data_options_xml_validation: "",
  partition_options: "",
  skip_unusable_indexes: false,
  disable_streams_configuration: false,
  master_only: false,
  transport_datafiles: "",
  import_mode: "STANDARD",
  remap_data: "",
  parallel: undefined,
  encryption_password: "",
  compression: "NONE",
  content: "ALL",
  query: "",
  sample: "",
  filesize: "",
  transport_full_check: false,
  remap_schema: "",
  remap_tablespace: "",
  flashback_time: "",
  flashback_scn: "",
  metrics: false,
  disable_cluster: false,
  logtime: false,
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
      const hasFilesize = !!currentConfig.filesize;
      const hasWildcard = newDumpfile.includes("%U");

      if (currentConfig.operation === "EXPORT") {
        // ADD hasFilesize to the condition
        if ((isParallel || hasFilesize) && !hasWildcard) {
          newDumpfile = newDumpfile.replace(/(\.dmp)$/i, "_%U$1");
        } else if (!isParallel && !hasFilesize && hasWildcard) {
          newDumpfile = newDumpfile.replace(/_%U/i, "");
        }
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
  }, [
    config.parallel,
    config.dumpfile,
    config.filesize,
    isLogfileSame,
    config.operation,
  ]);

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
        encryption_password,
        compression,
        content,
        query,
        sample,
        data_options_skip_constraints,
        data_options_xml_validation,
        partition_options,
        skip_unusable_indexes,
        disable_streams_configuration,
        master_only,
        transport_datafiles,
        filesize,
        transport_full_check,
        import_mode,
        remap_data,
        remap_schema,
        remap_tablespace,
        flashback_time,
        flashback_scn,
        version,
        logtime,
        metrics,
        disable_cluster,
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
        encryption_password,
        compression,
        content,
        query,
        sample,
        data_options_skip_constraints,
        data_options_xml_validation,
        partition_options,
        skip_unusable_indexes,
        disable_streams_configuration,
        master_only,
        transport_datafiles,
        filesize,
        transport_full_check,
        import_mode,
        remap_data,
        remap_schema,
        remap_tablespace,
        flashback_time,
        flashback_scn,
        version,
        logtime,
        metrics,
        disable_cluster,
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
