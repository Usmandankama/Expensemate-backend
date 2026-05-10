import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper function to pause execution (wait 2 seconds)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const categorizeReceipt = async (text: string, attempt = 1): Promise<any> => {
  // Start with Flash, fallback to Flash-Lite if servers are busy
  const modelName = attempt <= 2 ? "gemini-2.5-flash" : "gemini-2.5-flash-lite";

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: `You are an expert financial data extractor. Analyze the receipt text and extract EVERY individual item purchased.
      Categorize each item strictly into one of these categories: Food, Transport, Shopping, Bills, Entertainment, Utilities, Other.
      You MUST return a JSON array containing the items. 
      Format example:
      [
        { "name": "Milk", "category": "Food", "amount": 1500 }
      ]
      If the text has no amounts, set the amount to 0.`,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `Extract the line items from this text:\n\n${text}`;
    
    console.log(`🧠 Attempt ${attempt}: Sending to ${modelName}...`);
    const result = await model.generateContent(prompt);
    
    return JSON.parse(result.response.text());

  } catch (error: any) {
    // If we get a 503 (Overloaded) and we haven't tried 3 times yet, retry!
    if (error.status === 503 && attempt < 3) {
      console.warn(`⚠️ [503] Google Servers overloaded. Retrying in 2 seconds...`);
      await delay(2000); // Wait 2 seconds before hammering the server again
      return categorizeReceipt(text, attempt + 1); // Recursive retry
    }

    // If it's a different error, or we ran out of retries, throw it
    console.error("❌ Gemini AI Categorization Error:", error);
    throw new Error("Failed to process receipt after multiple attempts.");
  }
};