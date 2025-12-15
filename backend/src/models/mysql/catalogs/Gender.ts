import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface GenderAttributes {
  id: number;
  gender_name: string;
  alias: string;
}

export class Gender extends Model<GenderAttributes> implements GenderAttributes {
  public id!: number;
  public gender_name!: string;
  public alias!: string;
}

Gender.init({
  id: {
    type: DataTypes.TINYINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  gender_name: {
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
  tableName: 'cat_genders',
  timestamps: false,
});
