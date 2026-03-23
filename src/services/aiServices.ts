import { Ollama } from "ollama";

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "http://127.0.0.1:11434",
});

export const categorizeReceipt = async (text: string) => {
  const systemPrompt = `
    You are an expert financial data extractor. Analyze the receipt text and extract EVERY individual item purchased.
    
    Categorize each item strictly into one of these categories: Food, Transport, Shopping, Bills, Entertainment, Utilities, Other.

    You MUST return a JSON object containing an "items" array. Do not return anything else.
    
    Format example:
    [
      { "name": "Milk", "category": "Food", "amount": 1500 },
      { "name": "Uber ride", "category": "Transport", "amount": 4500 }
    ]

    If the text has no amounts, set the amount to 0. Return ONLY valid JSON.
  `;

  try {
    const response = await ollama.chat({
      model: "llama3.2:1b",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Extract the line items from this text:\n\n${text}`,
        },
      ],
      format: "json",
      stream: false,
    });

    return JSON.parse(response.message.content);
  } catch (error) {
    console.error("AI Categorization Error:", error);
    throw new Error("Failed to process receipt via AI");
  }
};
