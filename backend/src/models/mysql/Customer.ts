import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface CustomerAttributes {
  id: number;
  company_name: string;
  rfc?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  city?: string;
  state_id?: number;
  postal_code?: string;
  created_by: number;
  modified_by: number;
  created_date: Date;
  modified_date: Date;
  is_active: boolean;
}

interface CustomerCreationAttributes
  extends Optional<CustomerAttributes, 'id' | 'created_date' | 'modified_date' | 'is_active'> {}

export class Customer extends Model<CustomerAttributes, CustomerCreationAttributes>
  implements CustomerAttributes {
  public id!: number;
  public company_name!: string;
  public rfc?: string;
  public contact_name?: string;
  public contact_phone?: string;
  public contact_email?: string;
  public address?: string;
  public city?: string;
  public state_id?: number;
  public postal_code?: string;
  public created_by!: number;
  public modified_by!: number;
  public created_date!: Date;
  public modified_date!: Date;
  public is_active!: boolean;
}

Customer.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  company_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  rfc: {
    type: DataTypes.STRING(13),
    allowNull: true,
  },
  contact_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  contact_phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  contact_email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  state_id: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: true,
  },
  postal_code: {
    type: DataTypes.STRING(10),
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
  tableName: 'customers',
  timestamps: false,
});
