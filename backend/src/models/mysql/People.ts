import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface PeopleAttributes {
  id: number;
  person_names: string;
  last_name1: string;
  last_name2?: string;
  gender_id: number;
  birth_date: Date;
  birth_place?: string;
  person_title_id: number;
  marital_status_id: number;
  rfc: string;
  curp?: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  nationality_id: number;
  is_active: number;
  created: Date;
  modified: Date;
}

interface PeopleCreationAttributes extends Optional<PeopleAttributes, 'id' | 'created' | 'modified'> {}

export class People extends Model<PeopleAttributes, PeopleCreationAttributes> implements PeopleAttributes {
  public id!: number;
  public person_names!: string;
  public last_name1!: string;
  public last_name2?: string;
  public gender_id!: number;
  public birth_date!: Date;
  public birth_place?: string;
  public person_title_id!: number;
  public marital_status_id!: number;
  public rfc!: string;
  public curp?: string;
  public phone1?: string;
  public phone2?: string;
  public email?: string;
  public nationality_id!: number;
  public is_active!: number;
  public created!: Date;
  public modified!: Date;
}

People.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  person_names: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  last_name1: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  last_name2: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  gender_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  birth_place: {
    type: DataTypes.STRING(6),
    allowNull: true,
  },
  person_title_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
  },
  marital_status_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
  },
  rfc: {
    type: DataTypes.STRING(13),
    allowNull: false,
    unique: true,
  },
  curp: {
    type: DataTypes.STRING(18),
    allowNull: true,
  },
  phone1: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  phone2: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  nationality_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
  },
  is_active: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
  },
  created: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  modified: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'people',
  timestamps: false,
});
