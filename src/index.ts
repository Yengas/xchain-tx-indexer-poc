import express from 'express';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
import config from './config';
import { bootstrapKnex } from './adapters/database/knex/bootstrap-knex';
import { bootstrapAlchemy } from './adapters/eth-api/alchemy/bootstrap-alchemy';
import { BlockChainNetwork } from './domain/analyzers/blockchain-types/network';
import { StreamLiveBlocks } from './infrastructure/stream-live-blocks/stream-live-blocks';
import { FullBlock } from './domain/analyzers/blockchain-types/full-block';
import { LiveBlockConsumerProcess } from './domain/blockchain/live-block-consumer/live-block-consumer-process';
import { AnalyzerPluginNative } from './domain/analyzers/plugin-native/plugin-native';

const BD_FOLDER = path.join(__dirname, '../data/bd');

const app = express();

// Use the body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

const NETWORK = BlockChainNetwork.ETH;
const TRACKED_ADDRESSES = ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'];
const PLUGINS = [
  new AnalyzerPluginNative({
    network: BlockChainNetwork.ETH,
    tokenName: 'ETH',
  }),
];

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function main() {
  const [
    { transactionRepository, streamLiveBlocksRepository },
    { streamLiveBlocksEthAdapter },
  ] = await Promise.all([
    bootstrapKnex(),
    bootstrapAlchemy({ network: NETWORK }),
  ]);

  const liveBlockConsumer = new LiveBlockConsumerProcess(
    {
      trackedAddresses: TRACKED_ADDRESSES,
    },
    transactionRepository,
    PLUGINS,
  );

  const streamLiveBlocks = new StreamLiveBlocks(
    NETWORK,
    streamLiveBlocksRepository,
    streamLiveBlocksEthAdapter,
    async function ({
      network,
      block,
    }: {
      network: BlockChainNetwork;
      block: FullBlock;
    }) {
      console.log(
        `processing block: '${block.number}' on network '${network}'`,
      );

      await saveToDiskForDebug(network, block);

      // send to live-block-consumer-process for processing
      await liveBlockConsumer.processBlock(block);
    },
  );

  await streamLiveBlocks.start();

  // Endpoint to retrieve all user records
  app.get('/transactions', (req, res) => {
    const { addresses, networks } = req.body;

    // Retrieve all user records from the database
    transactionRepository
      .getForAddressesAcrossNetworks({
        addresses,
        networks,
      })
      .then((transactions) => {
        res.json({ transactions });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error retrieving transactions');
      });
  });

  await app.listen(config.port);

  console.log(`Server listening on port ${config.port}`);
}

async function saveToDiskForDebug(
  network: BlockChainNetwork,
  block: FullBlock,
) {
  // save the block for debug purposes
  const fname = path.join(
    BD_FOLDER,
    `net-${network}-${block.number}-full.json`,
  );

  fs.writeFileSync(fname, JSON.stringify(block), 'utf-8');
}
