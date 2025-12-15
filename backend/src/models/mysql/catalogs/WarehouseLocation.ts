import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface WarehouseLocationAttributes {
  id: number;
  name: string;
  alias: string;
  address?: string;
}

export class WarehouseLocation extends Model<WarehouseLocationAttributes> implements WarehouseLocationAttributes {
  public id!: number;
  public name!: string;
  public alias!: string;
  public address?: string;
}

WarehouseLocation.init({
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
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'cat_warehouse_locations',
  timestamps: false,
});
