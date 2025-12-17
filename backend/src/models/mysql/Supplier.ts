import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface SupplierAttributes {
  id: number;
  supplier_name: string;
  supplier_category_id: number;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  payment_terms?: string;
  created_by: number;
  modified_by: number;
  created_date: Date;
  modified_date: Date;
  is_active: boolean;
}

interface SupplierCreationAttributes
  extends Optional<SupplierAttributes, 'id' | 'created_date' | 'modified_date' | 'is_active'> {}

export class Supplier extends Model<SupplierAttributes, SupplierCreationAttributes>
  implements SupplierAttributes {
  public id!: number;
  public supplier_name!: string;
  public supplier_category_id!: number;
  public contact_name?: string;
  public phone?: string;
  public email?: string;
  public address?: string;
  public payment_terms?: string;
  public created_by!: number;
  public modified_by!: number;
  public created_date!: Date;
  public modified_date!: Date;
  public is_active!: boolean;
}

Supplier.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  supplier_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  supplier_category_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  contact_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  payment_terms: {
    type: DataTypes.STRING(100),
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
  tableName: 'suppliers',
  timestamps: false,
});
