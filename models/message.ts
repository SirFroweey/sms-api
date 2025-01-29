import { 
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional
} from 'sequelize';
import sequelize from './index';
import { isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Ensures phone number is in the e.164 standard
 * @param PhoneNumber string
 */
const e164 = (phoneNumber: string) => {
    if(!isValidPhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format.');
    }
}

class Message extends Model<InferAttributes<Message>, InferCreationAttributes<Message>> {
  declare id: CreationOptional<number>;
  declare from: string;
  declare to: string;
  declare message: string;
  declare received_at: CreationOptional<Date>;
  declare status: CreationOptional<string>;
};

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isE164: e164,
      },
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isE164: e164,
      },
    },
    message: {
        type: DataTypes.STRING(160),
        allowNull: false,
    },
    received_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('active', 'pending', 'deleted'),
        defaultValue: 'active',
    }
  },
  {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: false,
  }
);

(async () => {
    await sequelize.sync({ force: true });
})();

export default Message;