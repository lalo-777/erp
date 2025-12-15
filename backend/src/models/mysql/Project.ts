import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface ProjectAttributes {
  id: number;
  project_number: string;
  project_name: string;
  customer_id: number;
  project_type_id: number;
  project_area_id: number;
  project_status_id: number;
  start_date: Date;
  estimated_end_date: Date;
  actual_end_date?: Date;
  total_budget: number;
  location_address?: string;
  location_city?: string;
  location_state_id?: number;
  project_manager_id: number;
  description?: string;
  created_by: number;
  modified_by: number;
  created_date: Date;
  modified_date: Date;
  is_active: boolean;
}

interface ProjectCreationAttributes
  extends Optional<ProjectAttributes, 'id' | 'created_date' | 'modified_date' | 'is_active'> {}

export class Project extends Model<ProjectAttributes, ProjectCreationAttributes>
  implements ProjectAttributes {
  public id!: number;
  public project_number!: string;
  public project_name!: string;
  public customer_id!: number;
  public project_type_id!: number;
  public project_area_id!: number;
  public project_status_id!: number;
  public start_date!: Date;
  public estimated_end_date!: Date;
  public actual_end_date?: Date;
  public total_budget!: number;
  public location_address?: string;
  public location_city?: string;
  public location_state_id?: number;
  public project_manager_id!: number;
  public description?: string;
  public created_by!: number;
  public modified_by!: number;
  public created_date!: Date;
  public modified_date!: Date;
  public is_active!: boolean;
}

Project.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  project_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  project_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  customer_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  project_type_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  project_area_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  project_status_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  estimated_end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  actual_end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  total_budget: {
    type: DataTypes.DECIMAL(13, 2),
    allowNull: false,
    defaultValue: 0,
  },
  location_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location_city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  location_state_id: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: true,
  },
  project_manager_id: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
  },
  description: {
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
  tableName: 'projects',
  timestamps: false,
});
