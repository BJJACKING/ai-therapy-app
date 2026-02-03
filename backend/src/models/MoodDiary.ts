import { Model } from 'objection';

export default class MoodDiary extends Model {
  static tableName = 'mood_diaries';

  id!: string;
  user_id!: string;
  mood!: string;
  intensity!: number;
  triggers?: string[];
  notes?: string;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'mood', 'intensity'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        mood: { type: 'string', enum: ['happy', 'sad', 'anxious', 'angry', 'calm', 'tired', 'excited'] },
        intensity: { type: 'number', minimum: 1, maximum: 10 },
        triggers: { type: 'array', items: { type: 'string' } },
        notes: { type: 'string' },
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
          from: 'mood_diaries.user_id',
          to: 'users.id'
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
