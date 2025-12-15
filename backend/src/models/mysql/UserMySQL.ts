import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';
import bcrypt from 'bcrypt';

interface UserAttributes {
  id: number;
  person_id: number;
  role_id: number;
  email: string;
  usr_password: string;
  username: string;
  lastname: string;
  usr_active: number;
  expiration_date?: Date;
  is_generic: number;
  created: Date;
  modified: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created' | 'modified'> {}

export class UserMySQL extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public person_id!: number;
  public role_id!: number;
  public email!: string;
  public usr_password!: string;
  public username!: string;
  public lastname!: string;
  public usr_active!: number;
  public expiration_date?: Date;
  public is_generic!: number;
  public created!: Date;
  public modified!: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.usr_password);
  }
}

UserMySQL.init({
  id: {
    type: DataTypes.SMALLINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  person_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  role_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  usr_password: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  usr_active: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
  },
  expiration_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_generic: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
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
  tableName: 'users',
  timestamps: false,
  hooks: {
    beforeCreate: async (user: UserMySQL) => {
      if (user.usr_password) {
        user.usr_password = await bcrypt.hash(user.usr_password, 10);
      }
    },
    beforeUpdate: async (user: UserMySQL) => {
      if (user.changed('usr_password')) {
        user.usr_password = await bcrypt.hash(user.usr_password, 10);
      }
    },
  },
});
