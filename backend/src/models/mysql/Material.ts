import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface MaterialAttributes {
  id: number;
  material_code: string;
  material_name: string;
  category_id: number;
  unit_of_measure_id: number;
  unit_cost: number;
  minimum_stock: number;
  current_stock: number;
  reorder_point: number;
  description?: string;
  created_by: number;
  modified_by: number;
  created_date: Date;
  modified_date: Date;
  is_active: boolean;
}

interface MaterialCreationAttributes
  extends Optional<MaterialAttributes, 'id' | 'created_date' | 'modified_date' | 'is_active'> {}

export class Material extends Model<MaterialAttributes, MaterialCreationAttributes>
  implements MaterialAttributes {
  public id!: number;
  public material_code!: string;
  public material_name!: string;
  public category_id!: number;
  public unit_of_measure_id!: number;
  public unit_cost!: number;
  public minimum_stock!: number;
  public current_stock!: number;
  public reorder_point!: number;
  public description?: string;
  public created_by!: number;
  public modified_by!: number;
  public created_date!: Date;
  public modified_date!: Date;
  public is_active!: boolean;
}

Material.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  material_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  material_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  category_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  unit_of_measure_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  unit_cost: {
    type: DataTypes.DECIMAL(13, 2),
    allowNull: false,
  },
  minimum_stock: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  current_stock: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  reorder_point: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
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
  tableName: 'materials',
  timestamps: false,
});
