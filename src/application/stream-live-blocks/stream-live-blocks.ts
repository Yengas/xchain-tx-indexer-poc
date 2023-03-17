import { BlockChainNetwork } from '../../domain/analyzers/blockchain-types/network';
import { StreamLiveBlocksEthAdapter } from './stream-live-blocks-eth-adapter';
import { StreamLiveBlocksRepository } from './stream-live-blocks.repository';
import { FullBlock } from '../../domain/analyzers/blockchain-types/full-block';

type HandlerFunc = ({
  network,
  block,
}: {
  network: BlockChainNetwork;
  block: FullBlock;
}) => Promise<void>;

export class StreamLiveBlocks {
  private state:
    | { status: 'IDLE' }
    | { status: 'IN_PROGRESS'; timeoutHandle: NodeJS.Timeout }
    | { status: 'STOPPED' } = {
    status: 'IDLE',
  };

  constructor(
    private readonly config: { network: BlockChainNetwork; tickerMS: number },
    private readonly repository: StreamLiveBlocksRepository,
    private readonly ethAdapter: StreamLiveBlocksEthAdapter,
    private readonly handler: HandlerFunc,
  ) {}

  async start(): Promise<void> {
    if (this.state.status !== 'IDLE') {
      throw new Error(
        'can not start live block streaming because the status is not IDLE',
      );
    }

    this.state = {
      status: 'IN_PROGRESS',
      timeoutHandle: setTimeout(() => this.step(), 0),
    };
  }

  async step() {
    if (this.state.status !== 'IN_PROGRESS') {
      return;
    }

    try {
      const [lastBlockInfo, ethLastBlock]: [
        { blockNumber: number } | undefined,
        number,
      ] = await Promise.all([
        this.repository.getLastProcessed(this.config.network),
        this.ethAdapter.getLatestBlockNumber(),
      ]);

      if (lastBlockInfo && lastBlockInfo.blockNumber >= ethLastBlock) {
        return;
      }

      const blockToProcess = lastBlockInfo
        ? lastBlockInfo.blockNumber + 1
        : ethLastBlock;

      const block = await this.ethAdapter.getFullBlock(blockToProcess);

      await this.handler({ network: this.config.network, block });

      await this.repository.setLastProcessedBlock({
        network: this.config.network,
        blockNumber: blockToProcess,
      });
    } catch (err) {
      console.error('an error occurred when fetching / processing live blocks');
      console.error(err);
    } finally {
      if (this.state.status === 'IN_PROGRESS') {
        this.state.timeoutHandle = setTimeout(
          () => this.step(),
          this.config.tickerMS,
        );
      }
    }
  }

  async stop(): Promise<void> {
    if (this.state.status === 'IN_PROGRESS') {
      clearTimeout(this.state.timeoutHandle);
    }
    this.state = { status: 'STOPPED' };
  }
}
