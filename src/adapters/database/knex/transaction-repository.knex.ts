import { Knex } from 'knex';
import { Transaction } from '../../../domain/structured-data/transaction/transaction';

export class TransactionRepositoryKnex {
  private static TABLE_NAME = 'transactions';

  constructor(private readonly db: Knex) {}

  private get table() {
    return this.db(TransactionRepositoryKnex.TABLE_NAME);
  }

  async insert(transaction: Transaction): Promise<void> {
    await this.table
      .insert(TransactionRepositoryKnex.toDatabaseFormat(transaction))
      .onConflict(['network', 'tx_hash'])
      .ignore();
  }

  async bulkInsert(transactions: Transaction[]): Promise<void> {
    await this.table
      .insert(
        transactions.map((transaction) =>
          TransactionRepositoryKnex.toDatabaseFormat(transaction),
        ),
      )
      .onConflict(['network', 'tx_hash'])
      .ignore();
  }

  /**
   * Given some addresses and networks, return all transactions which those
   * addresses where involved in (either in `from` or `to`) part,
   * across given networks.
   *
   * @param addresses for to scan in from / to
   * @param networks which networks to look for
   */
  async getForAddressesAcrossNetworks({
    addresses,
    networks,
  }: {
    addresses: string[];
    networks: number[];
  }) {
    const items: Record<string, any>[] = await this.table
      .select()
      .whereIn('network', networks)
      .andWhere((qb) =>
        qb.whereIn('from', addresses).orWhereIn('to', addresses),
      )
      .orderBy('tx_ts', 'desc');

    return items.map((record) =>
      TransactionRepositoryKnex.fromDatabaseFormat(record),
    );
  }

  private static toDatabaseFormat(
    transaction: Transaction,
  ): Record<string, any> {
    return {
      network: transaction.network,
      block_id: transaction.blockId,
      tx_idx: transaction.txIdx,
      tx_hash: transaction.txHash,
      tx_ts: transaction.txTs,
      from: transaction.from,
      to: transaction.to,
      token: transaction.token,
      amount: transaction.amount,
    };
  }

  private static fromDatabaseFormat(
    dbTransaction: Record<string, any>,
  ): Transaction {
    return {
      network: dbTransaction.network,
      blockId: dbTransaction.block_id,
      txIdx: dbTransaction.tx_idx,
      txHash: dbTransaction.tx_hash,
      txTs: dbTransaction.tx_ts,
      from: dbTransaction.from,
      to: dbTransaction.to,
      token: dbTransaction.token,
      amount: dbTransaction.amount,
    };
  }
}
