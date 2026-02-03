exports.up = function(knex) {
  return knex.schema.createTable('assessments', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.string('type').notNullable(); // phq9, gad7, pss, big5
    table.jsonb('answers').notNullable();
    table.float('score').nullable();
    table.text('interpretation').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
    
    // Indexes
    table.index(['user_id']);
    table.index(['type']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('assessments');
};
