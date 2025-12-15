import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface LastAccessAttributes {
  user_id: number;
  login_datetime: Date;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  updated_at?: Date;
}

export class LastAccess extends Model<LastAccessAttributes> implements LastAccessAttributes {
  public user_id!: number;
  public login_datetime!: Date;
  public ip_address?: string;
  public user_agent?: string;
  public session_id?: string;
  public updated_at!: Date;
}

LastAccess.init({
  user_id: {
    type: DataTypes.SMALLINT.UNSIGNED,
    primaryKey: true,
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
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'last_access',
  timestamps: false,
});
