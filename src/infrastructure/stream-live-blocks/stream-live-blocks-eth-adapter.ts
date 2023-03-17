import { FullBlock } from '../../domain/analyzers/blockchain-types/full-block';

export interface StreamLiveBlocksEthAdapter {
  getLatestBlockNumber(): Promise<number>;
  getFullBlock(blockNumber: number): Promise<FullBlock>;
}
