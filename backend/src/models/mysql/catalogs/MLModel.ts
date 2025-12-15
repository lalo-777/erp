import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface MLModelAttributes {
  id: number;
  name: string;
  alias: string;
  model_type: string;
  description?: string;
}

export class MLModel extends Model<MLModelAttributes> implements MLModelAttributes {
  public id!: number;
  public name!: string;
  public alias!: string;
  public model_type!: string;
  public description?: string;
}

MLModel.init({
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
  model_type: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'cat_ml_models',
  timestamps: false,
});
