import { Model } from 'objection';

export default class User extends Model {
  static tableName = 'users';

  id!: string;
  email?: string;
  password?: string;
  phone?: string;
  anonymous_id!: string;
  is_anonymous!: boolean;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['anonymous_id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        email: { type: ['string', 'null'] },
        password: { type: ['string', 'null'] },
        phone: { type: ['string', 'null'] },
        anonymous_id: { type: 'string' },
        is_anonymous: { type: 'boolean', default: false },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        deleted_at: { type: ['string', 'null'], format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    return {
      conversations: {
        relation: Model.HasManyRelation,
        modelClass: require('./Conversation').default,
        join: {
          from: 'users.id',
          to: 'conversations.user_id'
        }
      },
      moodDiaries: {
        relation: Model.HasManyRelation,
        modelClass: require('./MoodDiary').default,
        join: {
          from: 'users.id',
          to: 'mood_diaries.user_id'
        }
      },
      assessments: {
        relation: Model.HasManyRelation,
        modelClass: require('./Assessment').default,
        join: {
          from: 'users.id',
          to: 'assessments.user_id'
        }
      }
    };
  }

  $beforeInsert() {
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  $beforeUpdate() {
    this.updated_at = new Date();
  }
}
