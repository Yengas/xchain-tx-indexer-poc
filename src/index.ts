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
import { AnalyzerPluginERC20 } from './domain/analyzers/plugin-erc20/plugin-erc20';

const BD_FOLDER = path.join(__dirname, '../data/bd');

const app = express();

// Use the body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

const NETWORK = BlockChainNetwork.ETH;
const TRACKED_ADDRESSES = [
  // Binance 7 - ETH
  '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8',
  // Binance 8 - ETH
  '0xf977814e90da44bfa03b6295a0616a897441acec',
  // Binance 28 - ETH
  '0x5a52e96bacdabb82fd05763e25335261b270efcb',
  // Binance 14 - ETH
  '0x28c6c06298d514db089934071355e5743bf21d60',
  // Binance 18 - ETH
  '0x9696f59e4d72e237be84ffd425dcad154bf96976',
  // Binance 15 - ETH
  '0x21a31ee1afc51d94c2efccaa2092ad1028285549',
  // Binance 16 - ETH
  '0xdfd5293d8e347dfe59e90efd55b2956a1343963d',
  // Binance 17 - ETH
  '0x56eddb7aa87536c09ccc2793473599fd21a8b17f',
  // Binance 20 - ETH
  '0x4976a4a02f38326660d17bf34b431dc6e2eb2327',
];
const PLUGINS = [
  new AnalyzerPluginNative({
    network: BlockChainNetwork.ETH,
    tokenName: 'ETH',
  }),
  new AnalyzerPluginERC20({
    network: BlockChainNetwork.ETH,
    tokenContracts: [
      // usdc
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      // usdt
      '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      // dai
      '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    ],
  }),
];

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function main() {
  const [
    { transferRepository, streamLiveBlocksRepository },
    { streamLiveBlocksEthAdapter },
  ] = await Promise.all([
    bootstrapKnex(),
    bootstrapAlchemy({ network: NETWORK }),
  ]);

  const liveBlockConsumer = new LiveBlockConsumerProcess(
    {
      trackedAddresses: TRACKED_ADDRESSES,
    },
    transferRepository,
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
      const { count } = await liveBlockConsumer.processBlock(block);

      console.log(
        `processed block: '${block.number}' and saved 'count(${count})' results into the database`,
      );
      console.log('===========');
    },
  );

  await streamLiveBlocks.start();

  // Endpoint to retrieve all user records
  app.get('/transfers', (req, res) => {
    const { addresses, networks } = req.body;

    // Retrieve all user records from the database
    transferRepository
      .getForAddressesAcrossNetworks({
        addresses,
        networks,
      })
      .then((transfers) => {
        res.json({ transfers });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error retrieving transfers');
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
