import { Model } from 'objection';

export default class Assessment extends Model {
  static tableName = 'assessments';

  id!: string;
  user_id!: string;
  type!: string;
  answers!: any;
  score?: number;
  interpretation?: string;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'type', 'answers'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        type: { type: 'string', enum: ['phq9', 'gad7', 'pss', 'big5'] },
        answers: { type: 'object' },
        score: { type: 'number' },
        interpretation: { type: 'string' },
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
          from: 'assessments.user_id',
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
