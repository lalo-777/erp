import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface ChatterPostAttributes {
  id: number;
  foreign_id: number;
  section_id: number;
  post_text: string;
  mentions: string | null; // JSON array of user IDs
  parent_id: number | null;
  created_by: number;
  created_date: Date;
  modified_by: number | null;
  modified_date: Date | null;
  is_active: boolean;
}

interface ChatterPostCreationAttributes extends Optional<ChatterPostAttributes, 'id' | 'created_date' | 'mentions' | 'parent_id' | 'modified_by' | 'modified_date' | 'is_active'> {}

export class ChatterPost extends Model<ChatterPostAttributes, ChatterPostCreationAttributes>
  implements ChatterPostAttributes {
  public id!: number;
  public foreign_id!: number;
  public section_id!: number;
  public post_text!: string;
  public mentions!: string | null;
  public parent_id!: number | null;
  public created_by!: number;
  public created_date!: Date;
  public modified_by!: number | null;
  public modified_date!: Date | null;
  public is_active!: boolean;
}

ChatterPost.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  foreign_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: 'ID of the related entity (invoice, project, etc.)',
  },
  section_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    comment: '1=Invoice, 2=Project, 3=Customer, 4=PurchaseOrder, 5=Material, 6=Supplier',
  },
  post_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  mentions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array of mentioned user IDs',
  },
  parent_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: 'For replies, reference to parent post',
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
  modified_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  sequelize,
  tableName: 'chatter_posts',
  timestamps: false,
});
