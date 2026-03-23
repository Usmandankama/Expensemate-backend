import { Sequelize } from 'sequelize';

// Ensure your .env file has DB_NAME, DB_USER, DB_PASS, and DB_HOST
const sequelize = new Sequelize(
  process.env.DB_NAME || 'expense_tracker',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // Disables console spam
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export default sequelize;