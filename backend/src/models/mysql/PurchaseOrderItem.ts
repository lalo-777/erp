import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface PurchaseOrderItemAttributes {
  id: number;
  purchase_order_id: number;
  material_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  received_quantity: number;
  created_date: Date;
}

interface PurchaseOrderItemCreationAttributes
  extends Optional<PurchaseOrderItemAttributes, 'id' | 'received_quantity' | 'created_date'> {}

export class PurchaseOrderItem extends Model<PurchaseOrderItemAttributes, PurchaseOrderItemCreationAttributes>
  implements PurchaseOrderItemAttributes {
  public id!: number;
  public purchase_order_id!: number;
  public material_id!: number;
  public quantity!: number;
  public unit_price!: number;
  public subtotal!: number;
  public received_quantity!: number;
  public created_date!: Date;
}

PurchaseOrderItem.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  purchase_order_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  material_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  unit_price: {
    type: DataTypes.DECIMAL(13, 2),
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(13, 2),
    allowNull: false,
  },
  received_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  created_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'purchase_order_items',
  timestamps: false,
});
