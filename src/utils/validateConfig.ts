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
  const isNetworkImport =
    config.operation === "IMPORT" && !!config.network_link;

  if (!config.userid) {
    errors.push("USERID is required.");
  }

  // General Validations (USERID is no longer required)
  if (!isNetworkImport) {
    if (config.credential) {
      // Cloud Mode
      if (config.directory) {
        // This case should be prevented by the UI, but it's a good safeguard.
        errors.push(
          "Cannot use both DIRECTORY and CREDENTIAL. Choose one storage destination."
        );
      }
    } else {
      // On-Premises Mode
      if (!config.directory) {
        errors.push("DIRECTORY is required for on-premises operations.");
      }
    }
    if (config.credential && config.logfile) {
      errors.push(
        "A separate LOGFILE cannot be specified when using a CREDENTIAL. Log files are written to the cloud location as part of the dump file list."
      );
    }
  }

  // File Naming Validations
  if (!config.dumpfile) {
    errors.push("DUMPFILE name is required.");
  } else if (!config.dumpfile.toLowerCase().endsWith(".dmp")) {
    errors.push("DUMPFILE must have a .dmp extension.");
  }

  if (!!config.directory && !config.credential) {
    if (!config.logfile) {
      errors.push("LOGFILE name is required for on-premises operations.");
    } else if (!config.logfile.toLowerCase().endsWith(".log")) {
      errors.push("LOGFILE must have a .log extension.");
    }
  }

  if (config.job_name && !/^[a-zA-Z0-9_]+$/.test(config.job_name)) {
    errors.push(
      "JOB_NAME can only contain letters, numbers, and underscores (_)."
    );
  }

  // Export-Specific Validations
  if (config.operation === "EXPORT") {
    if (config.export_mode === "TRANSPORTABLE_PDB") {
      if (config.query)
        errors.push("QUERY cannot be used with a TRANSPORTABLE_PDB export.");
      if (config.sample)
        errors.push("SAMPLE cannot be used with a TRANSPORTABLE_PDB export.");
      if (config.views_as_tables)
        errors.push(
          "VIEWS_AS_TABLES cannot be used with a TRANSPORTABLE_PDB export."
        );
    }
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
    if (
      ["TABLESPACES", "TRANSPORTABLE_TABLESPACES"].includes(
        config.export_mode
      ) &&
      !config.tablespaces
    ) {
      errors.push(
        `At least one tablespace must be specified for ${config.export_mode} mode.`
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
    if (config.filesize) {
      // This regex checks for a number followed by an optional K, M, G, or T (case-insensitive).
      const filesizeRegex = /^\d+([KMGT])?$/i;
      if (!filesizeRegex.test(config.filesize)) {
        errors.push(
          `The value '${config.filesize}' for FILESIZE is invalid. It must be a number followed by an optional unit (K, M, G, T).`
        );
      }
      if (!config.dumpfile.includes("%U")) {
        errors.push(
          "DUMPFILE must contain the %U wildcard when FILESIZE is specified. The tool should add this automatically."
        );
      }
    }
    if (config.views_as_tables) {
      const lines = config.views_as_tables
        .split("\n")
        .filter((line) => line.trim().length > 0);
      for (const line of lines) {
        if (!line.includes(":")) {
          errors.push(
            `Invalid format in VIEWS_AS_TABLES: "${line}". Each line must contain a colon (:).`
          );
        }
      }
    }
  }

  // Import-Specific Validations
  if (config.operation === "IMPORT" && !config.table_exists_action) {
    if (config.remap_table) {
      const lines = config.remap_table
        .split("\n")
        .filter((line) => line.trim().length > 0);
      for (const line of lines) {
        const parts = line.split(":");
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
          errors.push(
            `Invalid format in REMAP_TABLE: "${line}". Each line must be in the format 'source:target'.`
          );
        } else if (!parts[0].includes(".")) {
          warnings.push(
            `Best practice for REMAP_TABLE is to specify a schema: "schema.table:target" (found in "${line}").`
          );
        }
      }
    }
    if (config.remap_container && !config.remap_container.includes(":")) {
      errors.push(
        `Invalid format for REMAP_CONTAINER: "${config.remap_container}". It must contain a colon (:).`
      );
    }
    errors.push(
      'A "Table Exists Action" must be selected for IMPORT operations.'
    );
    if (config.import_mode === "TRANSPORTABLE") {
      if (!config.transport_datafiles) {
        errors.push("TRANSPORT_DATAFILES is required for Transportable mode.");
      } else {
        // This regex checks for one or more single-quoted strings, separated by commas.
        const datafileRegex = /^'[^']+'(,\s*'[^']+')*$/;
        if (!datafileRegex.test(config.transport_datafiles)) {
          errors.push(
            "TRANSPORT_DATAFILES format is invalid. It must be a comma-separated list of single-quoted paths, e.g., '/path/file1.dbf','/path/file2.dbf'."
          );
        }
      }
    }
  }

  return { errors, warnings };
};
