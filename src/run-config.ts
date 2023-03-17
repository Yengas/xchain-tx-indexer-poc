import { BlockChainNetwork } from './domain/analyzers/blockchain-types/network';
import { AnalyzerPluginNative } from './domain/analyzers/plugin-native/plugin-native';
import { AnalyzerPluginERC20 } from './domain/analyzers/plugin-erc20/plugin-erc20';

export default {
  trackedAddresses: [
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
  ],
  instances: [
    {
      network: BlockChainNetwork.ETH,
      alchemy: { apiKey: process.env.ALCHEMY_API_KEY_ETH! },
      tickerMS: 3000,
      plugins: [
        new AnalyzerPluginNative({
          network: BlockChainNetwork.ETH,
          tokenName: 'ETH',
        }),
        new AnalyzerPluginERC20({
          network: BlockChainNetwork.ETH,
          tokenContracts: [
            // usdc - ETH
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            // usdt - ETH
            '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            // dai - ETH
            '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          ],
        }),
      ],
    },
  ],
};
