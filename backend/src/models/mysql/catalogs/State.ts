import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface StateAttributes {
  id: number;
  nationality_id: number;
  state_name: string;
  alias: string;
}

export class State extends Model<StateAttributes> implements StateAttributes {
  public id!: number;
  public nationality_id!: number;
  public state_name!: string;
  public alias!: string;
}

State.init({
  id: {
    type: DataTypes.SMALLINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  nationality_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
  },
  state_name: {
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
  tableName: 'cat_states',
  timestamps: false,
});
