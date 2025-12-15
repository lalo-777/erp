import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface UnitOfMeasureAttributes {
  id: number;
  name: string;
  alias: string;
  abbreviation: string;
}

export class UnitOfMeasure extends Model<UnitOfMeasureAttributes> implements UnitOfMeasureAttributes {
  public id!: number;
  public name!: string;
  public alias!: string;
  public abbreviation!: string;
}

UnitOfMeasure.init({
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
  abbreviation: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'cat_unit_of_measure',
  timestamps: false,
});
