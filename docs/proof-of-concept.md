# xchain-tx-indexer-poc - Proof of Concept

## Limitations

- `LiveBlockConsumer` uses **Alchemy** `getBlockWithTransactions
` and `getTransactionReceipts` to get all transaction / receipts for a block. There could be problems with transactions which get re-orged or removed. It maybe better to rely on some transaction listening that waits for some confirmations / subscribes to stream of mined transactions.
-
