# xchain-tx-indexer-poc - Notes

Before starting the design and the PoC for the requirements defined in [README.md](./README.md), the problematic part of the challenge was identified as backfilling the index database.

Below is an explanation of the challenge with bakfilling, some possible mitations and assumptions that will drive the design and implementation of the PoC.

## Challenge of Indexing Only a Tracked List of Addresses

In EVM compatible networks, we can use the block(s) transaction data, receipts and logs to understand what happened in a transaction and who were affected.

For simple transactions, we can look at the `from` and `to` fields of the transaction, and for Smart Contract calls, we can utilize the ABI of the Contract to understand individual function calls(tx `data`) and what kind of events where emitted(`logs`).

To understand whether an address was effected by a transaction or not, we can look at 4 individual scenarios in which a tracked address may have been effected;

- **Scenario 1.** Our tracked address is part of a simple transfer transaction.
- **Scenario 2.** Our tracked address intereacted with a Smart Contract via a function call.
- **Scenario 3.** Our tracked address was a parameter to a Smart Contract function call. E.g. ERC20 Token Transfer Recepient.
- **Scenario 4.** Our tracked address was part of an emitted event, without being part of Smart Contract function parameters. E.g. NFT Royalty Owner receiving royalty.

Whilst it is easy to query the blockchain for Scenario #1 and Scenario #2, the latter scenarios require more complex processing. Meaning if we want to understand if an address was involved in some transaction, we need to understand contract functions and event logs.

This situation is not problematic if we are working with live blocks, since it would not be expensive to get all transactions and logs for a single block and process it in memory. Considering 10~ seconds per 1 MB block. This should be pretty inexpensive for most chains.

However backfilling missing data for an address that does not exist in our indexed database is problematic. It may mean we need to scan whole blockchain data from scratch.

## Mitigation of Backfilling Performance Issues

To backfill indexing for a new address we haven't been tracking before. We have some optimizations we can do:

### Option 1. Using Already Indexed Transfer Data

If we are indexing data such as ERC20, ERC721 transactions. There could be APIs which already provide access to indexed data. If such APIs exist, we may think about using those.

In this scenario, for each new address being added, we could use the APIs to query with our interested address to get indexed data.

Later we can map this data to a format which our system would understand and then store it.

We need to be careful about how many new address additions are being done, and how expensive this APIs are. This option can work for the low-scale address additions.

### Option 2. Querying the Blockchain for Specific Events

We can utilize `eth_getLogs` with specific protocol address / and or specific topics. This could be useful in case you are indexing something like AAVE Deposit operations for example.

We can further utilize [indexed fields](https://ethereum.stackexchange.com/a/8659) in the events to specifically query events that our address was involved in.

If we have low number of protocols / events we are interested in. This could be a viable approach.

For each address that we need to backfill. We can run `eth_getLogs` with specific event topic, indexed parameter as the address if possible etc.

### Option 3. Indexing Data for All Addresses

Considering we are indexing some unpopular Smart Contract events. We may opt-in to index all of the transactions instead of just the ones that blonged to the tracked addresses.

This way, when a new address is added, we don't need to do any additional work.

If the protocol / operations we are indexing is not too popular. Storing everything could be feasible and not very expensive.

### Option 4. Scanning the Whole Blockchain

In case we cannot use the above approaches and we have a lot of different protocols and a lot of different addresses getting added every day. We may think about scanning the whole blockchain for new addresses being added.

This operation maybe optimized by batching addresses to index, maintaining a full node for the networks we are interested in, and in some other ways.

This would mean storing terabytes of data in our server or paying a lot of money to ETH full node API providers. However if we have the necessary scale, it maybe more performant / less expensive than the other options.

## Assumptions

According to the business use-case any of the above options maybe used in combination to build an index of transactions we are interested in.

To provide a design and to make a PoC. Below assumptions were made:

1. We want to index only transactions such as native token transfers and ERC20 token transfers, things like AAVE deposits etc. maybe added in the coming future.
2. We have a handful addresses we want to track. E.g. couple of thousand.
3. The address addition is not very common. We get less than hundred of address additions every day.
4. We don't want to store all indexed data because there maybe a lot of ERC20 transactions, but only very small percentage of them belong to the addresses we are tracking.

Considering these assumptions. You can find the high level design and PoC in the repository.

- [High Level Design](./docs/high-level-design.md) contains the High Level Design for a production ready system with above assumptions in mind.
- [Proof of Concept](./docs/proof-of-concept.md) contains the implementation related details, shortcomings compared to HLD, setup and quickstart notes for the PoC.
