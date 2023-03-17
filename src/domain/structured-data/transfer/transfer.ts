export type Transfer = {
  // the transfer / network related information
  network: number;
  blockId: number;
  txIdx: number;
  txHash: string;
  txTs: number;
  // the transfer related information
  from: string;
  to: string;
  token: string;
  amount: number;
};
