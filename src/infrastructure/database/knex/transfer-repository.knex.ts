import { Knex } from 'knex';
import { Transfer } from '../../../domain/structured-data/transfer/transfer';
import { TransferRepository } from '../../../domain/structured-data/transfer/transfer-repository';

export class TransferRepositoryKnex implements TransferRepository {
  private static TABLE_NAME = 'transfers';

  constructor(private readonly db: Knex) {}

  private get table() {
    return this.db(TransferRepositoryKnex.TABLE_NAME);
  }

  async insert(transfer: Transfer): Promise<void> {
    await this.table
      .insert(TransferRepositoryKnex.toDatabaseFormat(transfer))
      .onConflict(['network', 'tx_hash'])
      .ignore();
  }

  async bulkInsert(transfers: Transfer[]): Promise<void> {
    await this.table
      .insert(
        transfers.map((transfer) =>
          TransferRepositoryKnex.toDatabaseFormat(transfer),
        ),
      )
      .onConflict(['network', 'tx_hash'])
      .ignore();
  }

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
      .orderBy('tx_ts', 'desc')
      .limit(100);

    return items.map((record) =>
      TransferRepositoryKnex.fromDatabaseFormat(record),
    );
  }

  private static toDatabaseFormat(transfer: Transfer): Record<string, any> {
    return {
      network: transfer.network,
      block_id: transfer.blockId,
      tx_idx: transfer.txIdx,
      tx_hash: transfer.txHash,
      tx_ts: transfer.txTs,
      from: transfer.from,
      to: transfer.to,
      token: transfer.token,
      amount: transfer.amount,
    };
  }

  private static fromDatabaseFormat(dbTransfer: Record<string, any>): Transfer {
    return {
      network: dbTransfer.network,
      blockId: dbTransfer.block_id,
      txIdx: dbTransfer.tx_idx,
      txHash: dbTransfer.tx_hash,
      txTs: dbTransfer.tx_ts,
      from: dbTransfer.from,
      to: dbTransfer.to,
      token: dbTransfer.token,
      amount: dbTransfer.amount,
    };
  }
}
