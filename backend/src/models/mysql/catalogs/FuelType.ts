import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface FuelTypeAttributes {
  id: number;
  name: string;
  alias: string;
}

export class FuelType extends Model<FuelTypeAttributes> implements FuelTypeAttributes {
  public id!: number;
  public name!: string;
  public alias!: string;
}

FuelType.init({
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
}, {
  sequelize,
  tableName: 'cat_fuel_types',
  timestamps: false,
});
