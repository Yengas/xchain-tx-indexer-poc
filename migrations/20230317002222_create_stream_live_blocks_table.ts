import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('stream_live_blocks', (table) => {
    table.integer('network').primary().notNullable();
    table.integer('block_number').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('stream_live_blocks');
}
