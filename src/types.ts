import { type compressionOptions, type contentOptions } from './constants';

export interface ParfileConfig {
  operation: 'EXPORT' | 'IMPORT';
  directory: string;
  dumpfile: string;
  logfile: string;
  userid?: string;

  export_mode?: 'SCHEMAS' | 'TABLES' | 'FULL' | 'TABLESPACES';
  schemas?: string;
  tables?: string;
  tablespaces?: string;

  table_exists_action?: '' | 'SKIP' | 'APPEND' | 'TRUNCATE' | 'REPLACE';
  
  useDefaultNaming?: boolean;
  baseName?: string;

  parallel?: number | undefined;
  compression?: typeof compressionOptions[number];
  content?: typeof contentOptions[number];
  query?: string;
  remap_schema?: string;
  flashback_time?: string;
  flashback_scn?: string;
  version?: string;
  estimate_only?: 'YES' | 'NO';
  estimate?: 'BLOCKS' | 'STATISTICS';
  sqlfile?: string;
}