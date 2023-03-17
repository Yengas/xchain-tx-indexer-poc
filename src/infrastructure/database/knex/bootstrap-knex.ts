import path from 'path';
import knex from 'knex';
import config from '../../../config';
import { TransferRepositoryKnex } from './transfer-repository.knex';
import { StreamLiveBlocksRepositoryKnex } from './stream-live-blocks-repository.knex';

const MIGRATIONS_PATH = path.join(__dirname, '../../../../migrations');

async function createAndBootstrapDatabase() {
  const db = knex(config.knex);

  // could be unsafe when deploying, ok for PoC
  await db.migrate.latest({
    directory: MIGRATIONS_PATH,
  });

  return db;
}

export async function bootstrapKnex() {
  const db = await createAndBootstrapDatabase();

  return {
    transferRepository: new TransferRepositoryKnex(db),
    streamLiveBlocksRepository: new StreamLiveBlocksRepositoryKnex(db),
  };
}
