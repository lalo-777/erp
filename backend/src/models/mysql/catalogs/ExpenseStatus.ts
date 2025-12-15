import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface ExpenseStatusAttributes {
  id: number;
  name: string;
  alias: string;
}

export class ExpenseStatus extends Model<ExpenseStatusAttributes> implements ExpenseStatusAttributes {
  public id!: number;
  public name!: string;
  public alias!: string;
}

ExpenseStatus.init({
  id: {
    type: DataTypes.TINYINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  alias: {
    type: DataTypes.STRING(16),
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,
  tableName: 'cat_expense_statuses',
  timestamps: false,
});
