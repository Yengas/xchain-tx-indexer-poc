import { Alchemy, Network } from 'alchemy-sdk';
import config from '../../../config';
import { AlchemyCoreAdapter } from './alchemy-core-adapter';
import { BlockChainNetwork } from '../../../domain/analyzers/blockchain-types/network';

function getAlchemyNetworkByBlockChainNetwork(
  blockChainNetwork: BlockChainNetwork,
): Network {
  switch (blockChainNetwork) {
    case BlockChainNetwork.ETH:
      return Network.ETH_MAINNET;
    case BlockChainNetwork.POLYGON:
      return Network.MATIC_MAINNET;
    default:
      // make sure at compile time all options are exhausted
      const network: never = blockChainNetwork;

      throw new Error(`unhandled network: ${network}`);
  }
}

export async function bootstrapAlchemy({
  network,
}: {
  network: BlockChainNetwork;
}) {
  const alchemy = new Alchemy({
    apiKey: config.alchemy.apiKey,
    network: getAlchemyNetworkByBlockChainNetwork(network),
  });

  const coreAdapter = new AlchemyCoreAdapter(alchemy.core);

  return {
    streamLiveBlocksEthAdapter: coreAdapter,
  };
}
