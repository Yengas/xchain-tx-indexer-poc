import { CoreNamespace } from 'alchemy-sdk';
import { FullBlock } from '../../../domain/analyzers/blockchain-types/full-block';
import { StreamLiveBlocksEthAdapter } from '../../../infrastructure/stream-live-blocks/stream-live-blocks-eth-adapter';

export class AlchemyCoreAdapter implements StreamLiveBlocksEthAdapter {
  constructor(private readonly core: CoreNamespace) {}

  async getLatestBlockNumber(): Promise<number> {
    return this.core.getBlockNumber();
  }

  async getFullBlock(blockNumber: number): Promise<FullBlock> {
    const [
      { hash, parentHash, number, timestamp, nonce, extraData, transactions },
      { receipts },
    ] = await Promise.all([
      this.core.getBlockWithTransactions(blockNumber),
      this.core.getTransactionReceipts({
        blockNumber: '0x' + blockNumber.toString(16),
      }),
    ]);

    return {
      hash,
      parentHash,
      number,
      timestamp,
      nonce,
      extraData,
      transactions,
      transactionReceipts: receipts || [],
    };
  }
}
