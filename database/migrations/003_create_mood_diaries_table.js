exports.up = function(knex) {
  return knex.schema.createTable('mood_diaries', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.string('mood').notNullable(); // happy, sad, anxious, angry, calm, tired, excited
    table.integer('intensity').notNullable(); // 1-10
    table.jsonb('triggers').nullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
    
    // Indexes
    table.index(['user_id']);
    table.index(['mood']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('mood_diaries');
};
