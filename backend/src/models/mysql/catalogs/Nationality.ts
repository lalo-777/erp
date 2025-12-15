import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface NationalityAttributes {
  id: number;
  country_name: string;
  alias: string;
}

export class Nationality extends Model<NationalityAttributes> implements NationalityAttributes {
  public id!: number;
  public country_name!: string;
  public alias!: string;
}

Nationality.init({
  id: {
    type: DataTypes.TINYINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  country_name: {
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
  tableName: 'cat_nationalities',
  timestamps: false,
});
