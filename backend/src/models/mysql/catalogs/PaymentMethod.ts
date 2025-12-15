import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface PaymentMethodAttributes {
  id: number;
  name: string;
  alias: string;
  description?: string;
}

export class PaymentMethod extends Model<PaymentMethodAttributes> implements PaymentMethodAttributes {
  public id!: number;
  public name!: string;
  public alias!: string;
  public description?: string;
}

PaymentMethod.init({
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
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'cat_payment_methods',
  timestamps: false,
});
