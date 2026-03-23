import Expense from "../models/expense.model";
import { categorizeReceipt } from "../services/aiServices";


export const createExpense = async (req: Request) => {
  try {
    const { text } = (await req.json()) as { text: string };

    console.log("-----------------------------------");
    console.log("📥 NEW REQUEST RECEIVED");
    console.log("RAW TEXT LENGTH:", text?.length);
    console.log("TEXT PREVIEW:", text?.substring(0, 100)); 
    console.log("-----------------------------------");

    if (!text) {
      return Response.json({ error: 'Receipt text is required' }, { status: 400 });
    }

    console.time("🧠 AI Processing Time");

    try {
      // 1. Call local Phi-3
      const aiResult = await categorizeReceipt(text);
      console.timeEnd("🧠 AI Processing Time");

      // 2. Extract the array (handles both strict array and { items: [] } formats)
      let extractedItems = [];
      if (aiResult.items && Array.isArray(aiResult.items)) {
        extractedItems = aiResult.items;
      } else if (Array.isArray(aiResult)) {
        extractedItems = aiResult;
      } else {
        console.error("Unexpected AI structure:", aiResult);
        return Response.json({ error: 'AI did not return a recognizable array', raw: aiResult }, { status: 500 });
      }

      // 3. Map the AI data to match our Sequelize model
      const today = new Date();
      const expensesToInsert = extractedItems.map((item: any) => ({
        name: item.name || 'Unknown Item',
        category: item.category || 'Other',
        amount: item.amount || 0,
        date: today, 
        text: text, 
        status: 'completed'
      }));

      // 4. Bulk insert everything into MySQL at once
      const savedExpenses = await Expense.bulkCreate(expensesToInsert);

      return Response.json({ 
        success: true, 
        message: `Extracted ${savedExpenses.length} items successfully`,
        data: savedExpenses 
      }, { status: 201 });

    } catch (aiError) {
      console.timeEnd("🧠 AI Processing Time");
      console.error("AI Processing failed:", aiError);
      
      // Fallback: Save the raw text as one failed entry so the user doesn't lose it
      const failedExpense = await Expense.create({ text, status: 'failed' });
      return Response.json({ error: 'AI failed to process the receipt', data: failedExpense }, { status: 500 });
    }
  } catch (error) {
    console.error("Controller Error:", error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

export const getExpenses = async () => {
  try {
    const expenses = await Expense.findAll({
      order: [['createdAt', 'DESC']]
    });
    return Response.json({ success: true, data: expenses });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
};