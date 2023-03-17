import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transfers', (table) => {
    table.integer('network').notNullable();
    table.integer('block_id').notNullable();
    table.integer('tx_idx').notNullable();
    table.string('tx_hash', 100).notNullable();
    table.integer('tx_ts').notNullable();
    table.string('from', 42).notNullable();
    table.string('to', 42).notNullable();
    table.string('token', 42).notNullable();
    table.decimal('amount', 30, 0).notNullable();

    table.primary(['network', 'tx_hash']);
    table.index(['from', 'network'], 'from_network_idx');
    table.index(['to', 'network'], 'to_network_idx');
    table.index('tx_ts', 'tx_ts_idx');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transfers');
}
