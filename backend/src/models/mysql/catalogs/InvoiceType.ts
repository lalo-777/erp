import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface InvoiceTypeAttributes {
  id: number;
  name: string;
  alias: string;
  description?: string;
}

export class InvoiceType extends Model<InvoiceTypeAttributes> implements InvoiceTypeAttributes {
  public id!: number;
  public name!: string;
  public alias!: string;
  public description?: string;
}

InvoiceType.init({
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
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'cat_invoice_types',
  timestamps: false,
});
