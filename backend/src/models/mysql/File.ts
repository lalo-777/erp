import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface FileAttributes {
  id: number;
  foreign_id: number;
  section_id: number;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  file_description?: string;
  uploaded_by: number;
  upload_date: Date;
  created_by: number;
  modified_by?: number;
  is_active: boolean;
}

interface FileCreationAttributes extends Optional<FileAttributes, 'id' | 'upload_date' | 'is_active' | 'modified_by'> {}

export class File extends Model<FileAttributes, FileCreationAttributes>
  implements FileAttributes {
  public id!: number;
  public foreign_id!: number;
  public section_id!: number;
  public file_name!: string;
  public file_path!: string;
  public file_type?: string;
  public file_size?: number;
  public file_description?: string;
  public uploaded_by!: number;
  public upload_date!: Date;
  public created_by!: number;
  public modified_by?: number;
  public is_active!: boolean;
}

File.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  foreign_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  section_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    comment: '1=Invoice, 2=Project, 3=Expense, 4=Contract, 5=Progress',
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  file_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  file_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  uploaded_by: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
  },
  upload_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  created_by: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
  },
  modified_by: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  sequelize,
  tableName: 'files',
  timestamps: false,
});
