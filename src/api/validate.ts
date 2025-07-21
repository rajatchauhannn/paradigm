import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the Gemini client (it picks up GEMINI_API_KEY automatically)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post('/validate', async (req: Request, res: Response) => {
  console.log("\n--- [START] /api/validate request received ---");

  try {
    const { parfileContent } = req.body;
    console.log("[1] Received content length:", parfileContent?.length);

    if (!parfileContent || parfileContent.trim().length < 10) {
      console.log("[FAIL] Content too short. Sending 400 error.");
      return res
        .status(400)
        .json({ errors: ['Input content is too short to analyze.'] });
    }

    // Combine system instruction and user content into one prompt
    const systemInstruction = `
You are an expert Oracle Database Administrator. Analyze the following Oracle Data Pump parameters.
Your response MUST be a valid JSON object with three keys: "errors", "warnings", and "suggestions".
Each key should have a value of a string array. Provide only the raw JSON object in your response. Response should be CONCISE.
Give only important information.
    `;

    const prompt = `${systemInstruction}\n\n${parfileContent}`;
    console.log("[2] Sending prompt to Gemini API...");

    // Call Gemini’s generateContent API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // The generated text (string) may include markdown fences—strip them out
    const text = response.text;
    if (!text) {
      return res.status(500).json({ errors: ['AI response was empty.'], warnings: [], suggestions: [] });
    }
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    console.log("[4] Cleaned text, preparing to parse JSON.");
    const aiResponseJson = JSON.parse(cleanedText); 
    return res.status(200).json(aiResponseJson);

} catch (error: any) {
    // Catch errors from the AI call or JSON.parse
    console.error("Error during AI validation:", error);
    return res.status(500).json({ 
        errors: ['An error occurred while communicating with the AI service.', error.message], 
        warnings: [], 
        suggestions: [] 
    });
  }
});

const PORT = 3000; // The port your backend will run on
app.listen(PORT, () => {
  console.log(`[API] Server is running and listening on http://localhost:${PORT}`);
});

export default app;
