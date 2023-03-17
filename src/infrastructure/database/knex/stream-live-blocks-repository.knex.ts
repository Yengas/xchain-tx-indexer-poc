import { Knex } from 'knex';
import { StreamLiveBlocksRepository } from '../../../application/stream-live-blocks/stream-live-blocks.repository';
import { BlockChainNetwork } from '../../../domain/analyzers/blockchain-types/network';

export class StreamLiveBlocksRepositoryKnex
  implements StreamLiveBlocksRepository
{
  private static TABLE_NAME = 'stream_live_blocks';

  constructor(private readonly db: Knex) {}

  private get table() {
    return this.db(StreamLiveBlocksRepositoryKnex.TABLE_NAME);
  }

  async getLastProcessed(
    network: BlockChainNetwork,
  ): Promise<{ blockNumber: number } | undefined> {
    const record = await this.table
      .select('block_number')
      .where('network', network)
      .first();

    return record ? { blockNumber: record['block_number'] } : undefined;
  }

  async setLastProcessedBlock({
    network,
    blockNumber,
  }: {
    network: BlockChainNetwork;
    blockNumber: number;
  }): Promise<void> {
    await this.table
      .insert({ network, block_number: blockNumber })
      .onConflict('network')
      .merge();
  }
}
