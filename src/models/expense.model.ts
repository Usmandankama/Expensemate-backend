import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Expense extends Model {
  public id!: number;
  public name!: string;       // e.g., 'Eggs', 'MTN Data'
  public category!: string;   // e.g., 'groceries', 'logistics'
  public amount!: number;     // e.g., 2500.50
  public date!: Date;         // Date of the actual transaction
  public status!: string;     // 'pending', 'completed', 'failed'
  public text!: string;       // Raw OCR text from the Flutter app
}

Expense.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true, // Nullable initially while the AI processes
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending',
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false, // The only thing strictly required upfront
    },
  },
  {
    sequelize,
    tableName: 'expenses',
    timestamps: true, // Keeps track of when the record was created/updated in the DB
  }
);

export default Expense;