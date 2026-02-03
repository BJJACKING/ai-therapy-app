exports.up = function(knex) {
  return knex.schema.createTable('conversations', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.string('ai_role').notNullable(); // gentle, rational, energetic
    table.jsonb('messages').defaultTo('[]');
    table.jsonb('emotion_data').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
    
    // Indexes
    table.index(['user_id']);
    table.index(['ai_role']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('conversations');
};
