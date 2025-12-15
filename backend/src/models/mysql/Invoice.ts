import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface InvoiceAttributes {
  id: number;
  invoice_number: string;
  invoice_type_id: number;
  invoice_status_id: number;
  customer_id: number;
  project_id?: number;
  invoice_date: Date;
  due_date?: Date;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  created_by: number;
  modified_by: number;
  created_date: Date;
  modified_date: Date;
  is_active: boolean;
}

interface InvoiceCreationAttributes
  extends Optional<InvoiceAttributes, 'id' | 'created_date' | 'modified_date' | 'is_active'> {}

export class Invoice extends Model<InvoiceAttributes, InvoiceCreationAttributes>
  implements InvoiceAttributes {
  public id!: number;
  public invoice_number!: string;
  public invoice_type_id!: number;
  public invoice_status_id!: number;
  public customer_id!: number;
  public project_id?: number;
  public invoice_date!: Date;
  public due_date?: Date;
  public subtotal!: number;
  public tax_amount!: number;
  public total_amount!: number;
  public notes?: string;
  public created_by!: number;
  public modified_by!: number;
  public created_date!: Date;
  public modified_date!: Date;
  public is_active!: boolean;
}

Invoice.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  invoice_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  invoice_type_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  invoice_status_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  customer_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  project_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  invoice_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  subtotal: {
    type: DataTypes.DECIMAL(13, 2),
    allowNull: false,
    defaultValue: 0,
  },
  tax_amount: {
    type: DataTypes.DECIMAL(13, 2),
    allowNull: false,
    defaultValue: 0,
  },
  total_amount: {
    type: DataTypes.DECIMAL(13, 2),
    allowNull: false,
    defaultValue: 0,
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
  tableName: 'invoices',
  timestamps: false,
});
