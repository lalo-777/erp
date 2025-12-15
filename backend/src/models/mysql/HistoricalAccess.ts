import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface HistoricalAccessAttributes {
  id: number;
  user_id: number;
  login_datetime: Date;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  created_at: Date;
}

interface HistoricalAccessCreationAttributes extends Optional<HistoricalAccessAttributes, 'id' | 'created_at'> {}

export class HistoricalAccess extends Model<HistoricalAccessAttributes, HistoricalAccessCreationAttributes>
  implements HistoricalAccessAttributes {
  public id!: number;
  public user_id!: number;
  public login_datetime!: Date;
  public ip_address?: string;
  public user_agent?: string;
  public session_id?: string;
  public created_at!: Date;
}

HistoricalAccess.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
  },
  login_datetime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  session_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'historical_access',
  timestamps: false,
});
