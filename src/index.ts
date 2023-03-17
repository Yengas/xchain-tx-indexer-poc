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

const BD_FOLDER = path.join(__dirname, '../data/bd');

const app = express();

// Use the body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

const network = BlockChainNetwork.ETH;

async function main() {
  const [
    { transactionRepository, streamLiveBlocksRepository },
    { streamLiveBlocksEthAdapter },
  ] = await Promise.all([bootstrapKnex(), bootstrapAlchemy({ network })]);

  const streamLiveBlocks = new StreamLiveBlocks(
    network,
    streamLiveBlocksRepository,
    streamLiveBlocksEthAdapter,
    async function ({
      network,
      block,
    }: {
      network: BlockChainNetwork;
      block: FullBlock;
    }) {
      const fname = path.join(
        BD_FOLDER,
        `net-${network}-${block.number}-full.json`,
      );

      fs.writeFileSync(fname, JSON.stringify(block), 'utf-8');
    },
  );

  await streamLiveBlocks.start();

  // Endpoint to create a new user record
  app.post('/transactions', (_, res) => {
    // Insert the new user record into the database
    transactionRepository
      .bulkInsert([
        {
          network: 1,
          blockId: 100,
          txIdx: 1,
          txHash: '0xhash1',
          txTs: 1627920000,
          from: '0xaddress1',
          to: '0xaddress2',
          token: '0xcontract1',
          amount: 100,
        },
      ])
      .then(() => {
        res.send('New transaction created successfully');
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error creating user');
      });
  });

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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
