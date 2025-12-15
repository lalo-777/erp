import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface PaymentStatusAttributes {
  id: number;
  name: string;
  alias: string;
}

export class PaymentStatus extends Model<PaymentStatusAttributes> implements PaymentStatusAttributes {
  public id!: number;
  public name!: string;
  public alias!: string;
}

PaymentStatus.init({
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
  tableName: 'cat_payment_statuses',
  timestamps: false,
});
