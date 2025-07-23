import { type ParfileConfig } from "../types";

export const generateParfileContent = (config: ParfileConfig): string => {
  const params = [];
  const {
    userid,
    directory,
    dumpfile,
    logfile,
    parallel,
    job_name,
    operation,
    compression,
    content,
    query,
    flashback_time,
    flashback_scn,
    export_mode,
    schemas,
    tables,
    tablespaces,
    remap_schema,
    table_exists_action,
    version,
    estimate_only,
    estimate,
    sqlfile,
    include,
    exclude,
  } = config;

  if (userid)
    params.push(
      userid.match(/[\s/@]/) ? `USERID='${userid}'` : `USERID=${userid}`
    );
  if (directory) params.push(`DIRECTORY=${directory}`);
  if (dumpfile) params.push(`DUMPFILE=${dumpfile}`);
  if (logfile) params.push(`LOGFILE=${logfile}`);
  if (parallel && parallel > 1) params.push(`PARALLEL=${parallel}`);
  if (version) params.push(`VERSION=${version}`);
  if (job_name) params.push(`JOB_NAME=${job_name}`);
  if (include) params.push(`INCLUDE=${config.include}`);
  if (exclude) params.push(`EXCLUDE=${config.exclude}`);

  if (operation === "EXPORT") {
    if (compression !== "NONE") params.push(`COMPRESSION=${compression}`);
    if (content !== "ALL") params.push(`CONTENT=${content}`);
    if (query) params.push(`QUERY=${query}`);
    if (flashback_time) params.push(`FLASHBACK_TIME="${flashback_time}"`);
    else if (flashback_scn) params.push(`FLASHBACK_SCN=${flashback_scn}`);
    if (estimate_only === "YES") {
      params.push("ESTIMATE_ONLY=YES");
      params.push(`ESTIMATE=${estimate}`);
    }
    if (export_mode === "SCHEMAS" && schemas) params.push(`SCHEMAS=${schemas}`);
    else if (export_mode === "TABLES" && tables)
      params.push(`TABLES=${tables}`);
    else if (export_mode === "TABLESPACES" && tablespaces)
      params.push(`TABLESPACES=${tablespaces}`);
    else if (export_mode === "FULL") params.push("FULL=Y");
  }

  if (operation === "IMPORT") {
    if (schemas) params.push(`SCHEMAS=${schemas}`);
    if (remap_schema) params.push(`REMAP_SCHEMA=${remap_schema}`);
    if (table_exists_action)
      params.push(`TABLE_EXISTS_ACTION=${table_exists_action}`);
    if (sqlfile) params.push(`SQLFILE=${sqlfile}`);
  }
  return params.join("\n");
};

export const generateCommand = (
  config: ParfileConfig,
  outputMode: "parfile" | "command"
): string => {
  const opCommand = config.operation === "EXPORT" ? "expdp" : "impdp";
  if (outputMode === "parfile")
    return `nohup ${opCommand} parfile=your_parfile.par &`;

  const parfileLines = generateParfileContent(config)
    .split("\n")
    .filter((line) => line.length > 0);
  const commandParams = parfileLines.map((line) => {
    const i = line.indexOf("=");
    if (i === -1) return line;
    const key = line.substring(0, i);
    const value = line.substring(i + 1);

    if (key === "USERID" || key === "QUERY" || key === "FLASHBACK_TIME") {
      const strippedValue = value.replace(/^['"]|['"]$/g, "");
      return `${key}='${strippedValue}'`;
    }
    return line;
  });
  return `nohup ${opCommand} ${commandParams.join(" ")} &`;
};