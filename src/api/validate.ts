// In api/validate.ts

import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

// This is correct and needed for both environments
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// --- PRODUCTION ONLY ---
// This block will ONLY run on Render. It will NOT run on your local machine.
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "..");
  app.use(express.static(buildPath));

  // This catch-all MUST be inside the production block.
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// --- API Route (Works in both environments) ---
app.post("/api/validate", async (req: Request, res: Response) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { parfileContent } = req.body;
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
      return res.status(500).json({ errors: ["AI response was empty."] });
    }
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return res.status(200).json(JSON.parse(cleanedText));
  } catch (error: any) {
    return res.status(500).json({
      errors: ["An error occurred during AI validation.", error.message],
    });
  }
});

// --- Server Listen (Works in both environments) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[API] Server is running and listening on port ${PORT}`);
});

export default app;
