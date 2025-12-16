import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface LaborTimesheetAttributes {
  id: number;
  timesheet_code: string;
  worker_name: string;
  project_id?: number;
  work_date: Date;
  hours_worked: number;
  hourly_rate: number;
  performance_score?: number;
  payment_amount: number;
  payment_status: 'pending' | 'approved' | 'paid';
  notes?: string;
  created_by: number;
  modified_by: number;
  created_date: Date;
  modified_date: Date;
  is_active: boolean;
}

interface LaborTimesheetCreationAttributes
  extends Optional<LaborTimesheetAttributes, 'id' | 'created_date' | 'modified_date' | 'is_active' | 'project_id' | 'performance_score' | 'notes' | 'payment_status'> {}

export class LaborTimesheet extends Model<LaborTimesheetAttributes, LaborTimesheetCreationAttributes>
  implements LaborTimesheetAttributes {
  public id!: number;
  public timesheet_code!: string;
  public worker_name!: string;
  public project_id?: number;
  public work_date!: Date;
  public hours_worked!: number;
  public hourly_rate!: number;
  public performance_score?: number;
  public payment_amount!: number;
  public payment_status!: 'pending' | 'approved' | 'paid';
  public notes?: string;
  public created_by!: number;
  public modified_by!: number;
  public created_date!: Date;
  public modified_date!: Date;
  public is_active!: boolean;
}

LaborTimesheet.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  timesheet_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  worker_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  project_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  work_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  hours_worked: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  hourly_rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  performance_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'Performance score from 0 to 10',
  },
  payment_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'approved', 'paid'),
    allowNull: false,
    defaultValue: 'pending',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
  },
  modified_by: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
  },
  created_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  modified_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  sequelize,
  tableName: 'labor_timesheets',
  timestamps: false,
});
