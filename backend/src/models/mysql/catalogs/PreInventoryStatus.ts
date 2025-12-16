import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface PreInventoryStatusAttributes {
  id: number;
  status_name: string;
  description?: string;
  is_active: boolean;
}

export class PreInventoryStatus extends Model<PreInventoryStatusAttributes> implements PreInventoryStatusAttributes {
  public id!: number;
  public status_name!: string;
  public description?: string;
  public is_active!: boolean;
}

PreInventoryStatus.init({
  id: {
    type: DataTypes.TINYINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  status_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  sequelize,
  tableName: 'cat_pre_inventory_status',
  timestamps: false,
});
