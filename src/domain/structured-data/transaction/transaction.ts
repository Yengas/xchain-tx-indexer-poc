export type Transaction = {
  // the transaction / network related information
  network: number;
  blockId: number;
  txIdx: number;
  txHash: string;
  txTs: number;
  // the transfer transaction related information
  from: string;
  to: string;
  token: string;
  amount: number;
};
