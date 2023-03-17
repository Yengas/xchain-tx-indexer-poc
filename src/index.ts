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
import { TransferRepositoryKnex } from './adapters/database/knex/transfer-repository.knex';
import { StreamLiveBlocksRepositoryKnex } from './adapters/database/knex/stream-live-blocks-repository.knex';
import { AnalyzerPlugin } from './domain/analyzers/analyzer-plugin/analyzer-plugin';
import { Transfer } from './domain/structured-data/transfer/transfer';
import runConfig from './run-config';

const BD_FOLDER = path.join(__dirname, '../data/bd');

const app = express();

// Use the body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function main() {
  const [{ transferRepository, streamLiveBlocksRepository }] =
    await Promise.all([bootstrapKnex()]);

  // for each network, start a live-streaming listener
  await Promise.all(
    runConfig.instances.map(({ alchemy, network, tickerMS, plugins }) =>
      runForSpecificNetwork({
        trackedAddresses: runConfig.trackedAddresses,
        network,
        alchemy,
        tickerMS,
        plugins,
        transferRepository,
        streamLiveBlocksRepository,
      }),
    ),
  );

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

async function runForSpecificNetwork({
  network,
  alchemy,
  tickerMS,
  trackedAddresses,
  plugins,
  transferRepository,
  streamLiveBlocksRepository,
}: {
  network: BlockChainNetwork;
  alchemy: { apiKey: string };
  tickerMS: number;
  trackedAddresses: string[];
  plugins: AnalyzerPlugin<Transfer>[];
  transferRepository: TransferRepositoryKnex;
  streamLiveBlocksRepository: StreamLiveBlocksRepositoryKnex;
}) {
  const { streamLiveBlocksEthAdapter } = await bootstrapAlchemy({
    network,
    apiKey: alchemy.apiKey,
  });

  const liveBlockConsumer = new LiveBlockConsumerProcess(
    { trackedAddresses },
    transferRepository,
    plugins,
  );

  const streamLiveBlocks = new StreamLiveBlocks(
    { network, tickerMS },
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

  return { streamLiveBlocks };
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
