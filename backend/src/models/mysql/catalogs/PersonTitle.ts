import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface PersonTitleAttributes {
  id: number;
  title_name: string;
  alias: string;
}

export class PersonTitle extends Model<PersonTitleAttributes> implements PersonTitleAttributes {
  public id!: number;
  public title_name!: string;
  public alias!: string;
}

PersonTitle.init({
  id: {
    type: DataTypes.TINYINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  title_name: {
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
  tableName: 'cat_person_titles',
  timestamps: false,
});
