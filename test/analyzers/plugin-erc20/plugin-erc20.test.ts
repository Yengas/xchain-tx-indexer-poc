import { readTestBlock } from '../../helper/read-test-block';
import { BlockChainNetwork } from '../../../src/domain/analyzers/blockchain-types/network';
import { AnalyzerPluginERC20 } from '../../../src/domain/analyzers/plugin-erc20/plugin-erc20';

const block = readTestBlock(BlockChainNetwork.ETH, 16844092);

describe('PluginERC20', () => {
  const USDC_CONTRACT_ADDR = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const USDT_CONTRACT_ADDR = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const FROM_ADDR = '0x8DBe34c01c836A423C78228c7ff09261442fC385';
  const TO_ADDR = '0x0fEfAc2efC353e050Eeb42621103758134478DB4';
  const DIFF_TYPE_FROM = '0xE17B6c2e3DBb00a1907Ef3395deB467e4276d27F';

  const pluginERC20 = new AnalyzerPluginERC20({
    network: BlockChainNetwork.ETH,
    tokenContracts: [USDC_CONTRACT_ADDR, USDT_CONTRACT_ADDR],
  });

  describe('#blockToStructuredData()', () => {
    it('should read empty with any tracked address', async () => {
      const result = await pluginERC20.blockToStructuredData({
        block,
        trackedAddresses: [],
      });

      expect(result.length).toBe(0);
    });

    it('should read with tracked address', async () => {
      const result = await pluginERC20.blockToStructuredData({
        block,
        trackedAddresses: [FROM_ADDR, TO_ADDR, DIFF_TYPE_FROM],
      });

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "amount": 102000000,
            "blockId": 16844092,
            "from": "0x3018018c44338B9728d02be12d632C6691E020d1",
            "network": 1,
            "to": "0x0fEfAc2efC353e050Eeb42621103758134478DB4",
            "token": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            "txHash": "0x488badb8b90bffeba8f6e9aff77996d564dcf764fa8225d494249cb301387f08",
            "txIdx": 22,
            "txTs": 1679014367,
          },
          {
            "amount": 525000000,
            "blockId": 16844092,
            "from": "0x8DBe34c01c836A423C78228c7ff09261442fC385",
            "network": 1,
            "to": "0x28C6c06298d514Db089934071355E5743bf21d60",
            "token": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            "txHash": "0x2dd4c3c92606c10a80cf92aaea8aeb713cb0f81ebe5dc013b24a491c58d4987e",
            "txIdx": 48,
            "txTs": 1679014367,
          },
        ]
      `);
    });
  });
});
