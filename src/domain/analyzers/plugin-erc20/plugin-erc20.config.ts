import { BlockChainNetwork } from '../blockchain-types/network';

export type AnalyzerPluginERC20Config = {
  network: BlockChainNetwork;
  // which token contracts to listen for
  tokenContracts: string[];
};
