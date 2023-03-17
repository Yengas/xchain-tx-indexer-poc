import { readTestBlock } from '../../helper/read-test-block';
import { BlockChainNetwork } from '../../../src/domain/analyzers/blockchain-types/network';
import { AnalyzerPluginNative } from '../../../src/domain/analyzers/plugin-native/plugin-native';

const block = readTestBlock(BlockChainNetwork.ETH, 16844092);

describe('PluginNative', () => {
  const FROM_ADDR = '0x6e6cB478c4869e2d7a2024B29c18aEfEaa7934EC';
  const TO_ADDR = '0xB6E98884DF87B551445960c79839C3a37C6caf74';
  const DIFF_TYPE_FROM = '0xc4b74Ae89Ef93E683fB4AFba8e118d730313D45A';

  const pluginNative = new AnalyzerPluginNative({
    network: BlockChainNetwork.ETH,
    tokenName: 'ETH',
  });

  describe('#blockToStructuredData()', () => {
    it('should read empty with any tracked address', async () => {
      const result = await pluginNative.blockToStructuredData({
        block,
        trackedAddresses: [],
      });

      expect(result.length).toBe(0);
    });

    it('should read with tracked address', async () => {
      const result = await pluginNative.blockToStructuredData({
        block,
        trackedAddresses: [FROM_ADDR, TO_ADDR, DIFF_TYPE_FROM],
      });

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "amount": 6616283000000000,
            "blockId": 16844092,
            "from": "0x6e6cB478c4869e2d7a2024B29c18aEfEaa7934EC",
            "network": 1,
            "to": "0x1f793DB43c7Ec939D9A23ac37B40Ac39C88aD3Ff",
            "token": "ETH",
            "txHash": "0xfbef938613828bef58e02f9522d38a5c0f7e0db8083c0f3cdf97aecbc592704c",
            "txIdx": 69,
            "txTs": 1679014367,
          },
          {
            "amount": 13141680000000000,
            "blockId": 16844092,
            "from": "0x974CaA59e49682CdA0AD2bbe82983419A2ECC400",
            "network": 1,
            "to": "0xB6E98884DF87B551445960c79839C3a37C6caf74",
            "token": "ETH",
            "txHash": "0x7994541e273ad688c3e8746d4cf74a6c582a534b9e09af0f415bd21e28f4dd20",
            "txIdx": 75,
            "txTs": 1679014367,
          },
        ]
      `);
    });
  });
});
