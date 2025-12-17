import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface FuelRequisitionAttributes {
  id: number;
  requisition_code: string;
  vehicle_equipment_name: string;
  project_id?: number;
  requisition_date: Date;
  fuel_type: 'gasoline' | 'diesel' | 'other';
  quantity_liters: number;
  unit_price: number;
  total_amount: number;
  odometer_reading?: number;
  requisition_status: 'pending' | 'approved' | 'delivered' | 'cancelled';
  approved_by?: number;
  approved_date?: Date;
  delivered_date?: Date;
  notes?: string;
  created_by: number;
  modified_by: number;
  created_date: Date;
  modified_date: Date;
  is_active: boolean;
}

interface FuelRequisitionCreationAttributes
  extends Optional<FuelRequisitionAttributes, 'id' | 'created_date' | 'modified_date' | 'is_active' | 'project_id' | 'odometer_reading' | 'approved_by' | 'approved_date' | 'delivered_date' | 'notes' | 'requisition_status'> {}

export class FuelRequisition extends Model<FuelRequisitionAttributes, FuelRequisitionCreationAttributes>
  implements FuelRequisitionAttributes {
  public id!: number;
  public requisition_code!: string;
  public vehicle_equipment_name!: string;
  public project_id?: number;
  public requisition_date!: Date;
  public fuel_type!: 'gasoline' | 'diesel' | 'other';
  public quantity_liters!: number;
  public unit_price!: number;
  public total_amount!: number;
  public odometer_reading?: number;
  public requisition_status!: 'pending' | 'approved' | 'delivered' | 'cancelled';
  public approved_by?: number;
  public approved_date?: Date;
  public delivered_date?: Date;
  public notes?: string;
  public created_by!: number;
  public modified_by!: number;
  public created_date!: Date;
  public modified_date!: Date;
  public is_active!: boolean;
}

FuelRequisition.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  requisition_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  vehicle_equipment_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  project_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  requisition_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  fuel_type: {
    type: DataTypes.ENUM('gasoline', 'diesel', 'other'),
    allowNull: false,
  },
  quantity_liters: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  odometer_reading: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: 'Odometer reading at time of requisition',
  },
  requisition_status: {
    type: DataTypes.ENUM('pending', 'approved', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  approved_by: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: true,
  },
  approved_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  delivered_date: {
    type: DataTypes.DATE,
    allowNull: true,
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
  tableName: 'fuel_requisitions',
  timestamps: false,
});
