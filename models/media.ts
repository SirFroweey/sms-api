import { 
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional
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
    },
}, {
    sequelize,
    modelName: 'Media',
});

// Hook to validate image types before creating or updating
Media.beforeCreate(async (attachment) => {
    // The Kixie requirements are to only allow JPG and PNG images
    if (!['image/jpeg', 'image/png'].includes(attachment.mimeType)) {
        throw new Error('We are sorry, but only jpg and png images are allowed.');
    }
    // Also to disallow duplication
    const existingAttachment = await Media.findOne({ where: { fileName: attachment.fileName } });
    if (existingAttachment) {
        throw new Error('This image has already been uploaded. Please select a different attachment.');
    }
    if (!['image/jpeg', 'image/png'].includes(attachment.mimeType)) {
        throw new Error('We are sorry, but only jpg and png images are allowed.');
    }
});

export default Media;