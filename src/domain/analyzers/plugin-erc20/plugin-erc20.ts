import { AnalyzerPlugin } from '../analyzer-plugin/analyzer-plugin';
import { Transfer } from '../../structured-data/transfer/transfer';
import {
  BlockTransaction,
  BlockTransactionReceipt,
  FullBlock,
} from '../blockchain-types/full-block';
import { AnalyzerPluginERC20Config } from './plugin-erc20.config';
import { AbiCoder } from '@ethersproject/abi';

export class AnalyzerPluginERC20 implements AnalyzerPlugin<Transfer> {
  private static readonly ABI_CODER = new AbiCoder();
  private static readonly TRANSFER_EVENT_TOPIC =
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

  constructor(private readonly config: AnalyzerPluginERC20Config) {
    this.config.tokenContracts = this.config.tokenContracts.map((addr) =>
      addr.toLowerCase(),
    );
  }

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

      // Check if the transaction is to the specified ERC20 contract(s)
      // Check if the transaction was successful and Transfer event was emitted
      if (
        !tx.to ||
        !this.config.tokenContracts.includes(tx.to.toLowerCase()) ||
        (receipt.status !== 1 && (receipt.status as any) !== '0x1')
      ) {
        continue;
      }

      // Make sure ERC20 Transfer Event is emitted
      const transferEvent = receipt.logs.find(
        (log) =>
          log.topics[0] === AnalyzerPluginERC20.TRANSFER_EVENT_TOPIC &&
          log.address.toLowerCase() === tx.to?.toLowerCase(),
      );
      // Make sure transfer event exists and the data is valid
      if (!transferEvent || transferEvent.data.length !== 66) {
        continue;
      }

      const recipient = AnalyzerPluginERC20.ABI_CODER.decode(
        ['address'],
        '0x' + transferEvent.topics[2].slice(2).padStart(64, '0'),
      )[0].toLowerCase();

      const amount = AnalyzerPluginERC20.ABI_CODER.decode(
        ['uint256'],
        transferEvent.data,
      )[0];

      // Check if the transaction involves a tracked address
      if (
        trackedAddresses.includes(tx.from.toLowerCase()) ||
        trackedAddresses.includes(recipient)
      ) {
        transfers.push({
          network: this.config.network,
          blockId: block.number,
          txIdx: i,
          txHash: tx.hash,
          txTs: block.timestamp,
          from: tx.from.toLowerCase(),
          to: recipient,
          token: tx.to.toLowerCase(),
          amount: parseFloat(amount.toString()),
        });
      }
    }

    return transfers;
  }
}
