import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface WorkOrderStatusAttributes {
  id: number;
  name: string;
  alias: string;
}

export class WorkOrderStatus extends Model<WorkOrderStatusAttributes> implements WorkOrderStatusAttributes {
  public id!: number;
  public name!: string;
  public alias!: string;
}

WorkOrderStatus.init({
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
  tableName: 'cat_work_order_statuses',
  timestamps: false,
});
