import fs from 'fs';
import path from 'path';
import { BigNumber } from '@ethersproject/bignumber';
import { FullBlock } from '../../src/domain/analyzers/blockchain-types/full-block';
import { BlockChainNetwork } from '../../src/domain/analyzers/blockchain-types/network';

const BLOCKS_FOLDER = path.join(__dirname, '../assets/blocks');

export function readTestBlock(
  network: BlockChainNetwork,
  blockNumber: number,
): FullBlock {
  const filePath = path.join(
    BLOCKS_FOLDER,
    `net-${network}-${blockNumber}-full.json`,
  );
  const buffer = fs.readFileSync(filePath, 'utf-8');

  return JSON.parse(buffer, (_, value) => {
    if (value && typeof value === 'object' && value.type === 'BigNumber') {
      return BigNumber.from(value.hex);
    }

    return value;
  });
}
