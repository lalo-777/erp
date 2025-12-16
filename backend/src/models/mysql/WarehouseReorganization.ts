import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface WarehouseReorganizationAttributes {
  id: number;
  material_id: number;
  from_location_id: number;
  to_location_id: number;
  quantity: number;
  reorganization_date: Date;
  reason?: string;
  performed_by: number;
  created_date: Date;
}

interface WarehouseReorganizationCreationAttributes
  extends Optional<WarehouseReorganizationAttributes, 'id' | 'created_date'> {}

export class WarehouseReorganization extends Model<WarehouseReorganizationAttributes, WarehouseReorganizationCreationAttributes>
  implements WarehouseReorganizationAttributes {
  public id!: number;
  public material_id!: number;
  public from_location_id!: number;
  public to_location_id!: number;
  public quantity!: number;
  public reorganization_date!: Date;
  public reason?: string;
  public performed_by!: number;
  public created_date!: Date;
}

WarehouseReorganization.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  material_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  from_location_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  to_location_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  reorganization_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  performed_by: {
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
  tableName: 'warehouse_reorganization',
  timestamps: false,
});
