exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().nullable();
    table.string('password').nullable();
    table.string('phone').nullable();
    table.string('anonymous_id').notNullable().unique();
    table.boolean('is_anonymous').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
    
    // Indexes
    table.index(['email']);
    table.index(['anonymous_id']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
