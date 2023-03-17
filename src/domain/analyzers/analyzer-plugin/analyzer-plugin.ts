import { FullBlock } from '../blockchain-types/full-block';

export interface AnalyzerPlugin<T> {
  blockToStructuredData({
    block,
    trackedAddresses,
  }: {
    block: FullBlock;
    trackedAddresses: string[];
  }): Promise<T[]>;
}
