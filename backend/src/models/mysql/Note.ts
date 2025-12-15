import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface NoteAttributes {
  id: number;
  foreign_id: number;
  section_id: number;
  note_text: string;
  created_by: number;
  created_date: Date;
  modified_by?: number;
  is_active: boolean;
}

interface NoteCreationAttributes extends Optional<NoteAttributes, 'id' | 'created_date' | 'modified_by' | 'is_active'> {}

export class Note extends Model<NoteAttributes, NoteCreationAttributes>
  implements NoteAttributes {
  public id!: number;
  public foreign_id!: number;
  public section_id!: number;
  public note_text!: string;
  public created_by!: number;
  public created_date!: Date;
  public modified_by?: number;
  public is_active!: boolean;
}

Note.init({
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
    comment: '1=Invoice, 2=Project, 3=Customer, 4=Expense',
  },
  note_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
  },
  created_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
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
  tableName: 'notes',
  timestamps: false,
});
