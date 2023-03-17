import { FullBlock } from '../../analyzers/blockchain-types/full-block';
import { AnalyzerPlugin } from '../../analyzers/analyzer-plugin/analyzer-plugin';
import { Transfer } from '../../structured-data/transfer/transfer';
import { LiveBlockConsumerRepository } from './live-block-consumer.repository';

export class LiveBlockConsumerProcess {
  constructor(
    private readonly config: { trackedAddresses: string[] },
    private readonly repository: LiveBlockConsumerRepository,
    private readonly plugins: AnalyzerPlugin<Transfer>[],
  ) {}

  async processBlock(block: FullBlock): Promise<void> {
    const transfers: Transfer[] = (
      await Promise.all(
        this.plugins.map((plugin) =>
          plugin.blockToStructuredData({
            block,
            trackedAddresses: this.config.trackedAddresses,
          }),
        ),
      )
    ).reduce((acc, curr) => acc.concat(curr), []);

    if (transfers.length > 0) {
      await this.repository.bulkInsert(transfers);
    }
  }
}
