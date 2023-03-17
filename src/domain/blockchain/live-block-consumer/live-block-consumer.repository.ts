import { Transfer } from '../../structured-data/transfer/transfer';

export interface LiveBlockConsumerRepository {
  bulkInsert(transfers: Transfer[]): Promise<void>;
}
