import Knex from 'knex';
import { Model } from 'objection';

const knex = Knex({
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgresql://localhost:5432/mindai',
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: __dirname + '/../../database/migrations'
  },
  seeds: {
    directory: __dirname + '/../../database/seeds'
  }
});

Model.knex(knex);

export default knex;
