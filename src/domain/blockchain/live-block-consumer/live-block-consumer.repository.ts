import { Transaction } from '../../structured-data/transaction/transaction';

export interface LiveBlockConsumerRepository {
  bulkInsert(transactions: Transaction[]): Promise<void>;
}
