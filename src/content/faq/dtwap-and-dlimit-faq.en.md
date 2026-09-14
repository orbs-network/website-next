## OVERVIEW

### When should I use a dTWAP order?

TWAP (Time-weighted Average Price) is a common order used in CeFi that breaks an order into smaller trade sizes and executes them at regular intervals. The main goal of a TWAP order is to reduce the order’s price impact. It can also be useful if a user wants to implement a dollar-cost averaging strategy (DCA) and buy a certain token on a consistent schedule (i.e. once a month).

Therefore, dTWAP is best used when the order size is large compared to the available liquidity, or when a user anticipates a high price volatility period with no clear up or downward trend.

### How does the dTWAP and dLIMIT protocol work?

The dLIMIT and dTWAP protocol defines two main actors:

- **Makers** - The first entity in the dTWAP protocol are DEX traders that submit new orders to the dTWAP EVM contract. They set all order parameters such as limit price and expiration. Maker orders are sent to the dTWAP smart contract, which enforces these requirements in a trustless manner.

- **Takers** - Incentivized third-party participants that monitor all live orders and submit bids on the best path to execute their next segment. The dTWAP contract selects the best bid and guarantees that the path that provides the best price to makers is the one executed.

The swap is ultimately executed directly between the user’s wallet and the applicable DEX pool, with the taker receiving the specified amount of the output token as a fee. All assets always go through the AMM’s main flow and smart contracts. No assets are diverted out of the DEX. The dTWAP smart contract is only responsible for ensuring that trades are executed according to the schedule and other parameters set by the user. The contract does not hold any user funds, has no owners, administrators or other roles and is entirely immutable once deployed on an EVM blockchain.

This entire mechanism is powered by Orbs L3 technology (see more on that below), ensuring the orders are executed in a decentralized and reliable manner.

### How should I configure my dTWAP order?

Users need to define 3 main parameters when setting up a dTWAP order:

- 1\. **No. of Intervals**: Allows the user to specify the number of individual trades. The UI slider starts with 1 trade and allows increasing the amount of trades or manually inputting the total number in the field directly. Please note, the maximum number of intervals may be limited based on the total order size to prevent excessive gas costs.

- 2\. **Trade Interval**: sets the time gap between each individual trade. The UI starts with the minimum allowed (2 mins), which leaves the minimum amount of time for the taker bidding war and block settlement between each chunk. The user can set it to be any duration desired. A trade will never execute before this time elapses after the previous trade.


- 3\. **Max Duration**: the maximum time during which the total amount of all individual trades making up the full dTWAP order may be executed. After this deadline the trade expires, regardless of actual amounts swapped. To reach full trade execution (100% of the total order amount swapped), users should allow time for all chunks to execute, and at least the interval between each chunk to elapse. Note that all chunks may not execute in limit orders, depending on whether the price stays within the set parameters. The default recommended duration is calculated by multiplying the number of intervals by the trade interval, and then doubling this amount in order to serve as a buffer to allow sufficient time for on-chain activity. This  “recommended” max duration is the default, unless the user changes it manually, at which point it is up to the user’s selection (note that setting a duration that is shorter than the above default may result in a partially filled order).

In addition to the above, users can choose to execute each trade chunk at market or limit. These parameters provide significant flexibility to the user, allowing them to customize their dTWAP orders taking into account factors such as market conditions, price volatility, gas fees, etc.

### Are dLIMIT and dTWAP the same protocol?

Yes. dLIMIT is a specific case of dTWAP where the individual trade size equals the total trade size (dTWAP order with a single trade).

### Should I use a dTWAP-market or dTWAP-limit order?

When choosing between a dTWAP-market and dTWAP-limit order, consider the following:
A dTWAP-limit order provides a safeguard by ensuring a minimum output token amount based on a specified limit price.

However, if the market price at execution is less favorable than the limit price, the order may only partially fill or remain unfilled by the order's expiration.
Conversely, a dTWAP-market order guarantees full execution by the order's expiry, but each segment of the order is executed at the available market price. This can result in unexpected prices, especially during periods of high volatility or when liquidity drops, potentially causing significant price impact.

## dSLTP

### Should I use a stop-loss limit or stop-loss market?

Both order types have their advantages and risks, and choosing between them depends on your priorities.

-   **Stop-loss market orders** ensure that your order will be executed once the stop price is triggered. However, in fast or volatile markets, slippage can occur, and the executed price may be significantly worse than the trigger price. This means the amount of output tokens received could be lower than expected.

-   **Stop-loss limit orders** protect against receiving a worse price than your specified limit. Once the stop price is triggered, the order will execute only at the limit price or better. The downside is that if the market price falls below your limit, the order may not execute at all.

**In summary:**

- Stop-loss **market orders** prioritize execution but not price.

- Stop-loss **limit orders** prioritize price but not execution.

### For a stop-loss limit order, how far apart should the trigger and stop price be?

It is recommended to set a **gap of at least 2%--3%** between the trigger price and the limit price to ensure the stop-loss order has a chance to execute.

When specifying a limit price, users will see in the UI the minimum amount of output tokens they will receive if the order is filled. Only Takers making bids equal or better than this amount will be eligible to fill the order. This amount takes into account gas costs and DEX's usual trading fees.

If Takers cannot satisfy the requirement of the minimum amount output because of additional gas costs & trading fees, the order will not be executed. 

Therefore, if there is a tiny small difference between the trigger and limit prices, orders may not execute as the taker will not be able to guarantee the minimal output token amount specified by the limit price. Setting a wider gap improves the likelihood that your stop-loss limit order will be filled successfully.

## TROUBLESHOOTING

### My limit orders seem to be using a lot of gas, why is that?

The protocol uses an [English auction](https://en.wikipedia.org/wiki/English_auction) bidding war mechanism to ensure that the execution price is as close as possible to the limit price set by the user. As a result, the winning taker has to send 2 transactions: bid and fill. This means that a limit order costs twice as much in gas in comparison to a regular swap order. In addition, due to the bidding war taking some time between the bid and fill, takers add a small slippage percent as buffer to their bid expected output (similar to what a user would do when executing a normal swap through the UI) to ensure their transactions go through in a reasonable time but still will win the bid as best output.

In most L1/L2 gas fees are mostly negligible which means the benefits of the bidding process far outweighs the additional gas costs. Still, users should be aware of this in times of gas spikes or when executing very small order sizes.

To visualize an example, suppose a normal swap costs $0.20 and gas prices are constant over time. Using TWAP for the exact same route over 10 chunks will cost 0.2 x 10 x 2 = $4, at least.

### My limit price was hit but my order was not executed, why is that?

When setting up a limit order and specifying a limit price, users will see in the UI the minimum amount of destination tokens they will receive if the order is filled. Only takers making bids equal or better than this amount will be eligible to fill the order. This amount takes into account gas costs and DEX’s usual trading fees.

Therefore, if the current market price hits the limit price but the takers cannot satisfy the requirement of the minimum amount output because of additional gas costs & trading fees, the order will not be executed. The order should get executed once the market price exceeds the limit price, including the additional costs.

In other words, as the trading fees are paid from the output token amount, the limit price includes the gas & trading fees and so users should take this into account when setting up the price. For example, a very small order’s gas fees can total a very large percentage of the order output, reflecting an actual limit price that is not competitive with the spot market price.

It should be noted that at present, dTWAP and dLIMIT do not impose any additional service fees. Users utilizing dTWAP and dLIMIT are charged the regular network gas fees and the DEX’s standard swap fees, similar to those incurred during a regular swap.

## POWERED BY ORBS L3

### What is the role of the Orbs network in the protocol?

The [Orbs Network](https://www.orbs.com/) is an open, decentralized and public blockchain infrastructure executed by a secure network of permissionless validators (known as “Guardians”) using Proof-of-Stake (PoS) consensus. Orbs is optimized to provide “L3” services, working in conjunction with existing L1 and L2 layers and acting as a “decentralized backend” that enhances the capabilities of EVM smart contracts. Orbs Network mainnet is live since 2019 and has dozens of active validators staked with over $100M.

The network provides its [L3 services](https://www.orbs.com/overview/) by operating as a decentralized serverless cloud that allows developers to design applications that extend the capabilities of their smart contracts without relying on traditional centralized server solutions. These applications are deployed to be executed by the Orbs Guardians in a decentralized way.

**As part of the dTWAP protocol, Orbs Guardians will run software utilizing [ORBS-VM](https://www.orbs.com/execution-services/) that acts as the single honest bidder that is required for the dTWAP protocol to run optimally,ensure the SLA and achieve prices that track the spot market price as closely as possible.**

The application run by Orbs Guardians will, in a decentralized manner, monitor the dTWAP Smart Contract. When an order has been sent and a chunk is open for bids, Orbs Guardians will automatically calculate and submit an honest bid. The fee component of the bid will include only a request to be compensated for the estimated gas fees.

By automatically creating honest bids that are hardcoded to only specify a minimal gas fee and utilizing the best available routing tools selected by the DEX doing the integration, the Orbs Guardians will provide a strong level of assurance that the trades executed through the DEX’s UI and the dTWAP contract track spot market prices as closely as possible.

## TECHNICAL DOCUMENTATION

### Is the protocol safe to use? Are there any risks?

As with any smart contract, there are certain associated risks.

However, the protocol has undergone extensive auditing by [PeckShield](https://github.com/orbs-network/twap/blob/master/Audit-Report-PeckShield.pdf) and [RDAuditors](https://github.com/orbs-network/twap/blob/master/Audit-Report-RDAuditors.pdf). In addition it should be noted that the protocol’s [smart contract](https://github.com/orbs-network/twap) does not hold any funds, has no owners, administrators or other roles and is entirely immutable once deployed on an EVM blockchain.

Lastly, the protocol has been in production since the beginning of 2023 and integrated by multiple leading DEXs (such as QuickSwap, SpookySwap, and more…), processing tens of millions of dollars in trading volume to date.

### I have more questions, who can I ask?

You can ask any question in the dTWAP&dLIMIT telegram [support group](https://t.me/dTWAPSupportGroup).

In addition, you can find more information on the protocol here:

[dTWAP Whitepaper](https://www.orbs.com/white-papers/dTWAP/)

[Github](https://github.com/orbs-network/twap)
