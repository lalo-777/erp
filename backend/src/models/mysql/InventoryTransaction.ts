import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface InventoryTransactionAttributes {
  id: number;
  transaction_number: string;
  material_id: number;
  transaction_type_id: number;
  warehouse_location_id: number;
  quantity: number;
  unit_cost: number;
  total_value: number;
  project_id?: number;
  purchase_order_id?: number;
  reference_number?: string;
  notes?: string;
  transaction_date: Date;
  created_by: number;
  created_date: Date;
}

interface InventoryTransactionCreationAttributes
  extends Optional<InventoryTransactionAttributes, 'id' | 'created_date'> {}

export class InventoryTransaction extends Model<InventoryTransactionAttributes, InventoryTransactionCreationAttributes>
  implements InventoryTransactionAttributes {
  public id!: number;
  public transaction_number!: string;
  public material_id!: number;
  public transaction_type_id!: number;
  public warehouse_location_id!: number;
  public quantity!: number;
  public unit_cost!: number;
  public total_value!: number;
  public project_id?: number;
  public purchase_order_id?: number;
  public reference_number?: string;
  public notes?: string;
  public transaction_date!: Date;
  public created_by!: number;
  public created_date!: Date;
}

InventoryTransaction.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  transaction_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  material_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  transaction_type_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  warehouse_location_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  unit_cost: {
    type: DataTypes.DECIMAL(13, 2),
    allowNull: false,
  },
  total_value: {
    type: DataTypes.DECIMAL(13, 2),
    allowNull: false,
  },
  project_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  purchase_order_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  reference_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  transaction_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
  },
  created_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'inventory_transactions',
  timestamps: false,
});
