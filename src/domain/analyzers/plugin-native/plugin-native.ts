import { AnalyzerPlugin } from '../analyzer-plugin/analyzer-plugin';
import { Transfer } from '../../structured-data/transfer/transfer';
import { AnalyzerPluginNativeConfig } from './plugin-native.config';
import {
  BlockTransaction,
  BlockTransactionReceipt,
  FullBlock,
} from '../blockchain-types/full-block';

export class AnalyzerPluginNative implements AnalyzerPlugin<Transfer> {
  constructor(private readonly config: AnalyzerPluginNativeConfig) {}

  async blockToStructuredData({
    block,
    trackedAddresses,
  }: {
    block: FullBlock;
    trackedAddresses: string[];
  }): Promise<Transfer[]> {
    const transfers: Transfer[] = [];

    for (let i = 0; i < block.transactions.length; i++) {
      const tx: BlockTransaction = block.transactions[i];
      const receipt: BlockTransactionReceipt = block.transactionReceipts[i];

      if (
        tx.to &&
        (trackedAddresses.includes(tx.from.toLowerCase()) ||
          trackedAddresses.includes(tx.to.toLowerCase()))
      ) {
        // Check if the transaction is an ETH transfer and not a contract call
        if (
          ((receipt.status as any) === '0x1' || receipt.status === 1) &&
          tx.value.gt(0) &&
          tx.data === '0x'
        ) {
          transfers.push({
            network: this.config.network,
            blockId: block.number,
            txIdx: i,
            txHash: tx.hash,
            txTs: block.timestamp,
            // transfer info
            from: tx.from.toLowerCase(),
            to: tx.to.toLowerCase(),
            token: this.config.tokenName,
            amount: parseFloat(tx.value.toString()),
          });
        }
      }
    }

    return transfers;
  }
}
