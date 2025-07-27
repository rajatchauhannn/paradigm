// In functions/api/validate.ts

import { GoogleGenAI } from "@google/genai";

// This is the Cloudflare Function handler
export const onRequestPost = async (context) => {
  try {
    // Get environment variables and the request body
    const { request, env } = context;
    const { parfileContent } = await request.json();

    // The GEMINI_API_KEY must be set in the Cloudflare dashboard
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    const systemInstruction = `
You are an expert Oracle Database Administrator. Analyze the following Oracle Data Pump parameters.
Your response MUST be a valid JSON object with three keys: "errors", "warnings", and "suggestions".
Each key should have a value of a string array. Provide only the raw JSON object in your response. Response should be CONCISE.
Give only important information which should only be relevant to the given parfile.
Do not include any additional text or explanations.
IF there are no errors, warnings, or suggestions, return empty arrays for those keys.
KEEP IT AS SHORT AS POSSIBLE.
    `;
    const prompt = `${systemInstruction}\n\n${parfileContent}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;
    if (!text) {
      return new Response(
        JSON.stringify({ errors: ["AI response was empty."] }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Return a successful response
    return new Response(cleanedText, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    // Return an error response
    return new Response(
      JSON.stringify({
        errors: ["An error occurred during AI validation.", error.message],
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
