import { Transfer } from './transfer';

export interface TransferRepository {
  /**
   * Given some addresses and networks, return all transfers which those
   * addresses where involved in (either in `from` or `to`) part,
   * across given networks.
   *
   * @param addresses for to scan in from / to
   * @param networks which networks to look for
   */
  getForAddressesAcrossNetworks({
    addresses,
    networks,
  }: {
    addresses: string[];
    networks: number[];
  }): Promise<Transfer[]>;
}
