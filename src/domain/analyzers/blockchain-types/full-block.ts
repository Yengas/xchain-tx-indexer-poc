import { TransactionReceipt, TransactionResponse } from 'alchemy-sdk';

export type BlockTransaction = TransactionResponse;
export type BlockTransactionReceipt = TransactionReceipt;

export type FullBlock = {
  hash: string;
  parentHash: string;
  number: number;
  timestamp: number;
  nonce: string;

  extraData: string;

  // all transactions and receipts
  transactions: Array<BlockTransaction>;
  transactionReceipts: Array<BlockTransactionReceipt>;
};
