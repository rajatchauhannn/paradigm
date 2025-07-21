import { type ParfileConfig } from './types';

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  suggestions?: string[]; // Add this new optional property
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


// A mock function to simulate calling a backend AI service
export const mockValidateWithAI = async (parfileContent: string): Promise<ValidationResult> => {
  console.log("Sending to AI for validation:", parfileContent);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Return a sample, hardcoded response
  return {
    errors: [], // Assume no syntax errors if our generator is good
    warnings: [
      "PARALLEL is set to 8, which might be too high for a database with only 4 CPU cores, potentially causing resource contention."
    ],
    suggestions: [
      "Consider adding COMPRESSION=ALL to reduce the final dumpfile size.",
      "For a schema-level export, adding EXCLUDE=STATISTICS can speed up the metadata portion of the job if you plan to gather stats later."
    ]
  };
};