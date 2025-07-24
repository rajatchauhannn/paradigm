// src/types.ts

export type Operation = "EXPORT" | "IMPORT";
export type ExportMode =
  | "SCHEMAS"
  | "TABLES"
  | "TABLESPACES"
  | "FULL"
  | "TRANSPORTABLE_TABLESPACES";
export type TableExistsAction = "SKIP" | "APPEND" | "TRUNCATE" | "REPLACE" | "";
export type Content = "ALL" | "DATA_ONLY" | "METADATA_ONLY";
export type Compression =
  | "ALL"
  | "DATA_ONLY"
  | "METADATA_ONLY"
  | "NONE"
  | "ALL_ENCRYPTED"
  | "DATA_ONLY_ENCRYPTED"
  | "METADATA_ONLY_ENCRYPTED";
export type CompressionAlgorithm = "BASIC" | "LOW" | "MEDIUM" | "HIGH";
export type ImportMode = "STANDARD" | "TRANSPORTABLE";
export type XMLValidationMode = "" | "VALIDATE" | "DISABLE";
export type PartitionOptions = "" | "NONE" | "MERGE" | "APPEND";
export type EncryptionMode = "PASSWORD" | "DUAL" | "TRANSPARENT";
export type EncryptionAlgorithm = "AES128" | "AES192" | "AES256";

export interface ParfileConfig {
  operation: Operation;
  userid: string;
  directory: string;
  dumpfile: string;
  logfile: string; // TODO : Need to figure out how to use NOLOGFILE parameter along with this

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
  abort_step?: number;
  logtime?: boolean;
  disable_cluster?: boolean;
  metrics?: boolean;
  include?: string;
  exclude?: string;
  job_name?: string;

  // Advanced - export
  encryption_mode?: EncryptionMode; 
  encryption_algorithm?: EncryptionAlgorithm; 
  compression_algorithm?: CompressionAlgorithm;
  source_edition?: string;
  transport_full_check?: boolean;
  filesize?: string;
  sample?: string;
  encryption_password?: string;
  compression?: Compression;
  content?: Content;
  query?: string;
  flashback_time?: string;
  flashback_scn?: string;
  estimate_only?: "YES" | "NO";
  estimate?: "BLOCKS" | "STATISTICS";
  reuse_dumpfiles?: "Y" | "N";

  // Advanced - import
  transport_datafiles?: string;
  master_only?: boolean;
  disable_streams_configuration?: boolean;
  skip_unusable_indexes?: boolean;
  partition_options?: PartitionOptions;
  data_options_skip_constraints?: boolean;
  data_options_xml_validation?: XMLValidationMode;
  import_mode?: ImportMode;
  remap_data?: string;
  remap_schema?: string;
  remap_tablespace?: string;
  sqlfile?: string;
  transform?: string;
  network_link?: string;
  remap_datafile?: string;
}
