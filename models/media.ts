import { 
  DataTypes, Model, CreationOptional
} from 'sequelize';
import sequelize from './index';

class Media extends Model {
  declare id: CreationOptional<number>;
  declare messageId: number;
  declare fileName: string;
  declare mimeType: string;
}

Media.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  messageId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'messages',
      key: 'id',
    },
    allowNull: false,
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['image/jpg', 'image/png']]
    },
  },
}, 
{
  sequelize,
  modelName: 'Media',
});

export default Media;