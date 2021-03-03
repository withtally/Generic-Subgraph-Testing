## Compound Governance Subgraph

This subgraph was originally built by [Protofire](https://protofire.io/) and indexes and exposes in GraphQL all the event data related to the GovernorAlpha and CompoundToken contracts from Compound, providing an easy access to Token holder and Delegates information, Proposals and votes casted, and all the relationships between those entities.

At [withTally.com](https://www.withTally.com) we have added to this repo the ability to do unit testing on your governance contracts to help users feel confident building on Compound Style Governances. If you are looking to add your Governance to [withTally.com](https://www.withTally.com), feel free to email me: [dennison@withTally.com](mailto://dennison@withTally.com).

A live version of Protofire's subgraph can be found [here](https://thegraph.com/explorer/subgraph/protofire/compound-governance), along with useful queries and examples already available on the playground.

## Unit Testing

While we wait for true unit testing to be developed for [TheGraph](www.thegraph.com) this system provides a good environment for running a local version of the governance contracts on Ganache-cli, with a local dockerized subgraph that can be called from the tests. 

### Test folder Structure

Inside the test folder are: 

    - queries.ts    // The Subgraph queries that are called by the test
    - test.ts       // The actual tests
    - types.ts      // Types for the code
    - utils.ts      // Utils for managing a local subgraph node
    - YAML.ts       // Template for generated YAML file

### Setup

First, run `npm i`. 

Start `ganache-cli` in one terminal window. Copy the `mnemonic` that is generated. In the future you can start ganache with `ganache-cli --mnemonic "twelve words including quotes"` to start ganache. 

Edit the `.env` file to hold your `mnemonic`. A sample `sample.env` is included. 

In a new terminal window, navigate to the docker. Once `ganache-cli` is running, start the graph node with `docker-compose up` command.

In another terminal window, run the command `npx hardhat test`. This should start the test files which should: 

    1) Compile the smart contracts
    2) Deploy the smart contracts to `ganache-cli`
    3) Generate a new YAML file using the addresses of the deployed contracts
    4) Run `codegen` to generate the Graph node artifacts
    5) Run `build` to build the Assembly script wasm code
    6) Deploy the built subgraph to the local node
    7) Start running actual tests, waiting for the subgraph to synch, performing a query returning the result. 
    8) Remove the local subgraph to start fresh. 

Whew! Thats a lot. There might be some tweaks to get it started, but once it's running it seems pretty reliable, and it's been a lifesaver!
-dennison
