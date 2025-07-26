// In src/api/client.ts

// You may need to import this type from another file in your `src` directory
import { type ValidationResult } from "../utils/validateConfig";

export const validateWithAI = async (
  contentToValidate: string
): Promise<ValidationResult> => {
  try {
    // This relative path `/api/validate` is the key.
    // It works locally via the Vite proxy and on Vercel via its routing rules.
    const response = await fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parfileContent: contentToValidate }),
    });

    // Handle non-ok responses before trying to parse
    if (!response.ok) {
      const result = await response.json();
      throw new Error(
        result.errors?.[0] || "An unknown error occurred during AI validation."
      );
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(
      error.message || "Failed to connect to the AI validation service."
    );
  }
};
