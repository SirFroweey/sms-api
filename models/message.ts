import { 
  DataTypes, Model, CreationOptional
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

class Message extends Model {
  declare id: CreationOptional<number>;
  declare from: string;
  declare to: string;
  declare message: string;
  declare receivedAt: CreationOptional<Date>;
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
    receivedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('active', 'pending', 'deleted'),
        defaultValue: 'active',
    },
    mediaId: {
      type: DataTypes.INTEGER,
      references: {
          model: 'media',
          key: 'id',
      },
      allowNull: true,
    }
  },
  {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: false,
    indexes: [
      /**
       * Note: I added the following comments as reasoning behind the indexes below:
       * - Since 'from' and 'to' represent identifiers (phone numbers) they should be indexed since they will likely be used in queries to filter messages by sender or recipient.
       * - Since the 'status' field will likely be queried frequently to query messages based on their status (i.e... retrieving all active messages) it should be indexed.
       * - Since the 'receivedAt' field will likely be queried frequently to query messages based on when they were received it should also be indexed.
       */
      { fields: ['from'] },
      { fields: ['to'] },
      { fields: ['status'] },
      { fields: ['receivedAt'] }
    ]
  }
);

export default Message;