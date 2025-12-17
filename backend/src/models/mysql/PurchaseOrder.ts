import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface PurchaseOrderAttributes {
  id: number;
  po_number: string;
  supplier_id: number;
  project_id?: number;
  po_status_id: number;
  order_date: Date;
  expected_delivery_date?: Date;
  actual_delivery_date?: Date;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  created_by: number;
  modified_by: number;
  created_date: Date;
  modified_date: Date;
  is_active: boolean;
}

interface PurchaseOrderCreationAttributes
  extends Optional<PurchaseOrderAttributes, 'id' | 'created_date' | 'modified_date' | 'is_active'> {}

export class PurchaseOrder extends Model<PurchaseOrderAttributes, PurchaseOrderCreationAttributes>
  implements PurchaseOrderAttributes {
  public id!: number;
  public po_number!: string;
  public supplier_id!: number;
  public project_id?: number;
  public po_status_id!: number;
  public order_date!: Date;
  public expected_delivery_date?: Date;
  public actual_delivery_date?: Date;
  public subtotal!: number;
  public tax_amount!: number;
  public total_amount!: number;
  public notes?: string;
  public created_by!: number;
  public modified_by!: number;
  public created_date!: Date;
  public modified_date!: Date;
  public is_active!: boolean;
}

PurchaseOrder.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  po_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  supplier_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  project_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  po_status_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  order_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  expected_delivery_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  actual_delivery_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  subtotal: {
    type: DataTypes.DECIMAL(13, 2),
    allowNull: false,
    defaultValue: 0,
  },
  tax_amount: {
    type: DataTypes.DECIMAL(13, 2),
    allowNull: false,
    defaultValue: 0,
  },
  total_amount: {
    type: DataTypes.DECIMAL(13, 2),
    allowNull: false,
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
  },
  modified_by: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
  },
  created_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  modified_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  sequelize,
  tableName: 'purchase_orders',
  timestamps: false,
});
