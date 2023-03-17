import { AnalyzerPlugin } from '../analyzer-plugin/analyzer-plugin';
import { Transaction } from '../../structured-data/transaction/transaction';
import { AnalyzerPluginNativeConfig } from './plugin-native.config';
import {
  BlockTransaction,
  BlockTransactionReceipt,
  FullBlock,
} from '../blockchain-types/full-block';

export class AnalyzerPluginNative implements AnalyzerPlugin<Transaction> {
  constructor(private readonly config: AnalyzerPluginNativeConfig) {}

  async blockToStructuredData({
    block,
  }: {
    block: FullBlock;
    trackedAddresses: string[];
  }): Promise<Transaction[]> {
    const transactions: Transaction[] = [];

    for (let i = 0; i < block.transactions.length; i++) {
      const tx: BlockTransaction = block.transactions[i];
      const receipt: BlockTransactionReceipt = block.transactionReceipts[i];

      if (
        tx.to //&&
        //(trackedAddresses.includes(tx.from) || trackedAddresses.includes(tx.to))
      ) {
        // Check if the transaction is an ETH transfer and not a contract call
        if (
          ((receipt.status as any) === '0x1' || receipt.status === 1) &&
          tx.value.gt(0) &&
          tx.data === '0x'
        ) {
          transactions.push({
            network: this.config.network,
            blockId: block.number,
            txIdx: i,
            txHash: tx.hash,
            txTs: block.timestamp,
            //
            from: tx.from,
            to: tx.to,
            token: this.config.tokenName,
            amount: parseFloat(tx.value.toString()),
          });
        }
      }
    }

    return transactions;
  }
}
