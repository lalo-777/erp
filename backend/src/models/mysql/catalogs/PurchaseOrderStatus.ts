import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface PurchaseOrderStatusAttributes {
  id: number;
  name: string;
  alias: string;
}

export class PurchaseOrderStatus extends Model<PurchaseOrderStatusAttributes> implements PurchaseOrderStatusAttributes {
  public id!: number;
  public name!: string;
  public alias!: string;
}

PurchaseOrderStatus.init({
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
  tableName: 'cat_purchase_order_statuses',
  timestamps: false,
});
