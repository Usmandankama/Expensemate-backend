import sequelize from './src/config/database';
import { expenseRouter } from './src/routes/expense.route';

// Sync Database
await sequelize.sync({ alter: true });
console.log('✅ Database synced successfully');

const server = Bun.serve({
  port: process.env.PORT || 3000,
  hostname: process.env.hostname || '0.0.0.0',
  async fetch(req) {
    const url = new URL(req.url);

    // Global CORS Preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Pass the request to our Expense Router
    const handledRoute = await expenseRouter(req, url);
    
    // If the router returned a response, send it back (adding CORS headers)
    if (handledRoute) {
      handledRoute.headers.set('Access-Control-Allow-Origin', '*');
      return handledRoute;
    }

    // If no routes matched, return 404
    return new Response('Endpoint Not Found', { status: 404 });
  },
});

console.log(`🚀 API Gateway running at ${server.url}`);