import { Model } from 'objection';

export default class Conversation extends Model {
  static tableName = 'conversations';

  id!: string;
  user_id!: string;
  ai_role!: string;
  messages!: any[];
  emotion_data?: any;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'ai_role'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        ai_role: { type: 'string', enum: ['gentle', 'rational', 'energetic'] },
        messages: { type: 'array', default: [] },
        emotion_data: { type: 'object' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        deleted_at: { type: ['string', 'null'], format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./User').default,
        join: {
          from: 'conversations.user_id',
          to: 'users.id'
        }
      }
    };
  }

  $beforeInsert() {
    this.created_at = new Date();
    this.updated_at = new Date();
    if (!this.messages) {
      this.messages = [];
    }
  }

  $beforeUpdate() {
    this.updated_at = new Date();
  }
}
