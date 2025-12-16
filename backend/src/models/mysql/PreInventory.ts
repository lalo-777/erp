import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface PreInventoryAttributes {
  id: number;
  pre_inventory_number: string;
  material_id: number;
  warehouse_location_id: number;
  expected_quantity: number;
  counted_quantity?: number;
  discrepancy?: number;
  unit_cost: number;
  discrepancy_value?: number;
  status_id: number;
  notes?: string;
  count_date: Date;
  counted_by?: number;
  adjusted: boolean;
  adjustment_transaction_id?: number;
  created_by: number;
  created_date: Date;
  updated_by?: number;
  updated_date?: Date;
}

interface PreInventoryCreationAttributes
  extends Optional<PreInventoryAttributes, 'id' | 'created_date' | 'status_id' | 'adjusted' | 'unit_cost' | 'expected_quantity'> {}

export class PreInventory extends Model<PreInventoryAttributes, PreInventoryCreationAttributes>
  implements PreInventoryAttributes {
  public id!: number;
  public pre_inventory_number!: string;
  public material_id!: number;
  public warehouse_location_id!: number;
  public expected_quantity!: number;
  public counted_quantity?: number;
  public discrepancy?: number;
  public unit_cost!: number;
  public discrepancy_value?: number;
  public status_id!: number;
  public notes?: string;
  public count_date!: Date;
  public counted_by?: number;
  public adjusted!: boolean;
  public adjustment_transaction_id?: number;
  public created_by!: number;
  public created_date!: Date;
  public updated_by?: number;
  public updated_date?: Date;
}

PreInventory.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  pre_inventory_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  material_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  warehouse_location_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  expected_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  counted_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  discrepancy: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  unit_cost: {
    type: DataTypes.DECIMAL(13, 2),
    allowNull: false,
    defaultValue: 0,
  },
  discrepancy_value: {
    type: DataTypes.DECIMAL(13, 2),
    allowNull: true,
  },
  status_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  count_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  counted_by: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: true,
  },
  adjusted: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
  },
  adjustment_transaction_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
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
  updated_by: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: true,
  },
  updated_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'pre_inventory',
  timestamps: false,
});
