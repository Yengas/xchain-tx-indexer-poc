import { BlockChainNetwork } from '../../domain/analyzers/blockchain-types/network';

export interface StreamLiveBlocksRepository {
  getLastProcessed(
    network: BlockChainNetwork,
  ): Promise<{ blockNumber: number } | undefined>;

  setLastProcessedBlock({
    network: BlockChainNetwork,
    blockNumber: number,
  }): Promise<void>;
}
