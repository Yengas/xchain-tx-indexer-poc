# xchain-tx-indexer-poc - Proof of Concept

## Requirements

- Node v18.x and NPM 8.x
- [Alchemy](https://www.alchemy.com/) Account

## Setup

- Register to [Alchemy](https://www.alchemy.com/) and get an API Key
- Copy `.env.example` to `.env`
- Edit `ALCHEMY_API_KEY_ETH` with your own API KEY
- `npm install` to install all dependencies

## Run

Use `npm run start:dev` to run the project. Everything should be working.

## Implemented Functionality

As a PoC of this concept, a modular architecture with live-streaming, plugins and structured data saving was done. The PoC also supports listening to multiple networks for blocks. E.g. ETH, Polygon. By default, it is configured to run on mainnet ETH.

`LiveBlockConsumer` is implemented with an endless loop. Checking the last block processed in the database / blockchain nodes. With a configured interval, blocks are retrieved with all the transaction / receipt data.

The retrieved data runs through 2 plugins as described in the high level design:

- Native analyzer plugin. Analyses native transfers and outputs `Transfer` document.
- ERC20 analyzer plugin. Listens to ERC20 transfers and outputs `Transfer` document.

Querying of the Last 100 Transfers done for the tracked addresses, accross chains.

### Folder Structure

Hexagonal / Ports & Adapters architecture was used for the project.

```
.
├── adapters # Adapters for various implementation detail concerns
│   ├── database
│   │   └── knex # Knex and Sqlite implementation for Transaction / Live Stream State Storage
│   └── eth-api
│       └── alchemy # ETH API for retrieving blocks
├── domain # Pure Domain Logic, representing th High Level Design
│   ├── analyzers # **TransactionAnalysisPlugins** Domain
│   │   ├── analyzer-plugin # base analyzer plugin types
│   │   ├── blockchain-types # blockchain types analyzers knows about
│   │   ├── plugin-erc20 # plugin for converting erc20 operations to Transfers
│   │   └── plugin-native # plugin for converting native transactions to Transfers
│   ├── blockchain # **ConsumingBlockchainData** Domain
│   │   └── live-block-consumer # processing individual blocks live, saving structured data results
│   └── structured-data # **IndexedDataStorage** Domain
│       └── transfer # types and query interfaces for `Transfer`
├── infrastructure
│   └── stream-live-blocks # Infrastructure code for retrieving and processing blocks in a live manner
├── config.ts # main configuration for different adapters
├── run-config.ts # configuration related to which addresses to track, which contracts to listen etc.
└── index.ts # entrpint for the app
```

## Limitations

- The whole application runs with a single instance. Without any fault tolerance or a separate database instance.
- `LiveBlockConsumer` uses **Alchemy** `getBlockWithTransactions` and `getTransactionReceipts` to get all transaction / receipts for a block. There could be problems with transactions which get re-orged or removed. It is better to rely on some transaction listening that waits for some confirmations / subscribes to stream of mined transactions.
- `BackfillingJob` is not implemented yet. Only live-streaming blocks has been done.
- No monitoring, error handling, integration testing.
- Testing overall is very limited, only the analysis plugins have unit tests.
