import { type ValidationResult } from "../utils/validateConfig";

export const validateWithAI = async (
  contentToValidate: string
): Promise<ValidationResult> => {
  try {
    const response = await fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parfileContent: contentToValidate }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.errors?.[0] || "An unknown error occurred during AI validation."
      );
    }

    return result;
  } catch (error: any) {
    // Re-throw a structured error that the UI can handle
    throw new Error(
      error.message || "Failed to connect to the AI validation service."
    );
  }
};
