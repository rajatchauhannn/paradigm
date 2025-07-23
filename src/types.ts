// src/types.ts

export type Operation = "EXPORT" | "IMPORT";
export type ExportMode = "SCHEMAS" | "TABLES" | "TABLESPACES" | "FULL";
export type TableExistsAction = "SKIP" | "APPEND" | "TRUNCATE" | "REPLACE" | "";
export type Content = "ALL" | "DATA_ONLY" | "METADATA_ONLY";
export type Compression = "ALL" | "DATA_ONLY" | "METADATA_ONLY" | "NONE";

export interface ParfileConfig {
  operation: Operation;
  userid: string;
  directory: string;
  dumpfile: string;
  logfile: string;

  // Export specific
  export_mode: ExportMode;
  schemas?: string;
  tables?: string;
  tablespaces?: string;

  // Import specific
  table_exists_action: TableExistsAction;

  // Advanced - general
  parallel?: number;
  version?: string;
  include?: string;
  exclude?: string;
  job_name?: string;

  // Advanced - export
  compression?: Compression;
  content?: Content;
  query?: string;
  flashback_time?: string;
  flashback_scn?: string;
  estimate_only?: "YES" | "NO";
  estimate?: "BLOCKS" | "STATISTICS";

  // Advanced - import
  remap_schema?: string;
  sqlfile?: string;
}
