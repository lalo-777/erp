import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface MaritalStatusAttributes {
  id: number;
  marital_name: string;
  alias: string;
}

export class MaritalStatus extends Model<MaritalStatusAttributes> implements MaritalStatusAttributes {
  public id!: number;
  public marital_name!: string;
  public alias!: string;
}

MaritalStatus.init({
  id: {
    type: DataTypes.TINYINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  marital_name: {
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
  tableName: 'cat_marital_statuses',
  timestamps: false,
});
