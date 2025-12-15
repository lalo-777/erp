import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface RoleAttributes {
  id: number;
  role_name: string;
  alias: string;
  description?: string;
}

export class Role extends Model<RoleAttributes> implements RoleAttributes {
  public id!: number;
  public role_name!: string;
  public alias!: string;
  public description?: string;
}

Role.init({
  id: {
    type: DataTypes.TINYINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  role_name: {
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
  tableName: 'cat_roles',
  timestamps: false,
});
