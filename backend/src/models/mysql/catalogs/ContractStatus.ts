import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface ContractStatusAttributes {
  id: number;
  name: string;
  alias: string;
}

export class ContractStatus extends Model<ContractStatusAttributes> implements ContractStatusAttributes {
  public id!: number;
  public name!: string;
  public alias!: string;
}

ContractStatus.init({
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
  tableName: 'cat_contract_statuses',
  timestamps: false,
});
