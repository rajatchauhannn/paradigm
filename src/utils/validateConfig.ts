// src/utils.ts
import { type ParfileConfig } from "../types";

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

export const validateConfig = (config: ParfileConfig): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // General Validations (USERID is no longer required)
  if (!config.directory) {
    errors.push("DIRECTORY is required.");
  }
  if (config.include && config.exclude) {
    // This scenario should be prevented by UI, but good to have a backend check
    errors.push("Cannot use both INCLUDE and EXCLUDE parameters. Choose one.");
  }

  // File Naming Validations
  if (!config.dumpfile) {
    errors.push("DUMPFILE name is required.");
  } else if (!config.dumpfile.toLowerCase().endsWith(".dmp")) {
    errors.push("DUMPFILE must have a .dmp extension.");
  }

  if (!config.logfile) {
    errors.push("LOGFILE name is required.");
  } else if (!config.logfile.toLowerCase().endsWith(".log")) {
    errors.push("LOGFILE must have a .log extension.");
  }

  if (config.job_name && !/^[a-zA-Z0-9_]+$/.test(config.job_name)) {
    errors.push(
      "JOB_NAME can only contain letters, numbers, and underscores (_)."
    );
  }

  // Export-Specific Validations
  if (config.operation === "EXPORT") {
    if (config.export_mode === "SCHEMAS" && !config.schemas) {
      errors.push(
        "At least one schema must be specified for SCHEMAS export mode."
      );
    }
    if (config.export_mode === "TABLES" && !config.tables) {
      errors.push(
        "At least one table must be specified for TABLES export mode."
      );
    }
    if (config.export_mode === "TABLESPACES" && !config.tablespaces) {
      errors.push(
        "At least one tablespace must be specified for TABLESPACES export mode."
      );
    }
    if (
      (config.flashback_scn || config.flashback_time) &&
      config.content !== "DATA_ONLY"
    ) {
      warnings.push(
        "FLASHBACK is only applied to table data. It is recommended to use CONTENT=DATA_ONLY."
      );
    }

    if (config.export_mode === "FULL") {
      if (config.sample)
        errors.push("SAMPLE cannot be used with a FULL export.");
      if (config.query) errors.push("QUERY cannot be used with a FULL export.");
      if (config.include || config.exclude)
        errors.push("INCLUDE/EXCLUDE cannot be used with a FULL export.");
    }
    if (config.sample && config.query) {
      errors.push("SAMPLE and QUERY cannot be used at the same time.");
    }
    if (config.content === "METADATA_ONLY") {
      if (config.sample)
        errors.push(
          "SAMPLE requires data and is not compatible with CONTENT=METADATA_ONLY."
        );
      if (config.query)
        errors.push(
          "QUERY requires data and is not compatible with CONTENT=METADATA_ONLY."
        );
      if (config.flashback_scn || config.flashback_time) {
        errors.push(
          "FLASHBACK requires data and is not compatible with CONTENT=METADATA_ONLY."
        );
      }
    }
  }

  // Import-Specific Validations
  if (config.operation === "IMPORT" && !config.table_exists_action) {
    errors.push(
      'A "Table Exists Action" must be selected for IMPORT operations.'
    );
  }

  return { errors, warnings };
};
