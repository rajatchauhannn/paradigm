// src/constants.ts

import { CompressionAlgorithm } from "./types";

// Defines options for the Compression dropdown in AdvancedOptions.tsx
// Based on modern Oracle Data Pump (11g+)
export const compressionOptions = [
  "NONE",
  "METADATA_ONLY",
  "DATA_ONLY",
  "ALL",
  "ALL_ENCRYPTED", // <-- Encryption option
  "DATA_ONLY_ENCRYPTED", // <-- Encryption option
  "METADATA_ONLY_ENCRYPTED", // <-- Encryption option
];

// Defines options for the Content dropdown in AdvancedOptions.tsx
export const contentOptions = ["ALL", "DATA_ONLY", "METADATA_ONLY"];
export const compressionAlgorithmOptions: CompressionAlgorithm[] = [
  "BASIC",
  "LOW",
  "MEDIUM",
  "HIGH",
];