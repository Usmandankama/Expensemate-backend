import { createExpense, getExpenses } from '../controllers/expense.controller';

export const expenseRouter = async (req: Request, url: URL) => {
  // POST: /api/expenses
  if (url.pathname === '/api/expenses' && req.method === 'POST') {
    return await createExpense(req);
  }

  // GET: /api/expenses
  if (url.pathname === '/api/expenses' && req.method === 'GET') {
    return await getExpenses();
  }

  // Return null if the route doesn't match anything here
  return null; 
};