import { type ParfileConfig } from './types';

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

export const validateConfig = (config: ParfileConfig): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.directory) errors.push("'DIRECTORY' cannot be empty.");
  if (!config.dumpfile) errors.push("'DUMPFILE' cannot be empty.");

  if (config.operation === 'EXPORT') {
    if (config.export_mode === 'SCHEMAS' && !config.schemas) errors.push("Export mode is 'Schemas', but no schema names are provided.");
    if (config.export_mode === 'TABLES' && !config.tables) errors.push("Export mode is 'Tables', but no table names are provided.");
    if (config.export_mode === 'TABLESPACES' && !config.tablespaces) errors.push("Export mode is 'Tablespaces', but no tablespace names are provided.");

    if (config.parallel && config.parallel > 1 && !config.dumpfile.includes('%U')) {
      warnings.push("PARALLEL is > 1 but DUMPFILE does not contain '%U'. The export will not run in parallel.");
    }
  }

  if (config.operation === 'IMPORT') {
    if (!config.table_exists_action) errors.push("'Table Exists Action' must be selected for an import.");
  }

  return { errors, warnings };
};