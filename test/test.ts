import { Signer } from "@ethersproject/abstract-signer";
import fs from "fs";
import path from "path";
import { ethers, waffle } from "hardhat";
import { expect } from "chai";
import { utils } from "ethers";
import { ApolloFetch, FetchResult } from "apollo-fetch";

// Contract Artifacts
import COMPArtifact from "../artifacts/contracts/COMP.sol/Comp.json";
import GovernorAlphaArtifact from "../artifacts/contracts/GovernorAlpha.sol/GovernorAlpha.json";
import TimelockArtifact from "../artifacts/contracts/Timelock.sol/Timelock.json";

// misc
const { deployContract } = waffle;
const srcDir = path.join(__dirname, "..");

// Utils
import { waitForSubgraphToBeSynced, fetchSubgraph, exec } from "./utils";

// Subgraph Types
import { SubgraphResponseType } from "./types";

// Contract Types
import { Comp } from "../typechain/Comp";
import { GovernorAlpha } from "../typechain/GovernorAlpha";
import { Timelock } from "../typechain/Timelock";

// Queries
import { queryTokenHolderById } from "./queries";

// Subgraph Name
const subgraphUser = "tally";
const subgraphName = "compound-governance";

// Yaml Creator
import { getYAML } from "./YAML";

// Test
describe("Token", function() {
  let token: Comp;
  let gov: GovernorAlpha;
  let timelock: Timelock;

  let subgraph: ApolloFetch;
  let signers: Signer[];

  let syncDelay = 2000;

  before(async function() {
    this.timeout(50000); // sometimes it takes a long time

    signers = await ethers.getSigners();

    // Deploy contracts
    token = (await deployContract(signers[0], COMPArtifact, [
      await signers[0].getAddress(),
    ])) as Comp;
    timelock = (await deployContract(signers[0], TimelockArtifact, [
      await signers[0].getAddress(),
      86400 * 2,
    ])) as Timelock;
    gov = (await deployContract(signers[0], GovernorAlphaArtifact, [
      timelock.address,
      token.address,
      await signers[0].getAddress(),
    ])) as GovernorAlpha;

    // Write YAML file
    fs.writeFileSync(
      "subgraph.yaml",
      getYAML({
        tokenAddress: token.address,
        governanceAddress: gov.address,
        timelockAddress: timelock.address,
      })
    );

    // Create Subgraph Connection
    subgraph = fetchSubgraph(subgraphUser, subgraphName);

    // Build and Deploy Subgraph
    console.log("Build and deploy subgraph...");
    exec(`npx hardhat compile`);
    exec(`yarn codegen`);
    exec(`yarn build`);
    exec(`yarn create-local`);
    exec(`yarn deploy-local`);

    await waitForSubgraphToBeSynced(syncDelay);
  });

  after(async function() {
    process.stdout.write("Clean up, removing subgraph....");

    exec(`yarn remove-local`);

    process.stdout.write("Clean up complete.");
  });

  it("indexes token transfers", async function() {
    // note there was a  transfer on the deployment of the token
    const transferAmount = 1;
    const recipient = (await signers[1].getAddress()).toLocaleLowerCase();

    // Transfer a token
    await token.transfer(recipient, transferAmount);

    await waitForSubgraphToBeSynced(syncDelay);

    const query = await queryTokenHolderById(recipient);
    const response = (await subgraph({ query })) as FetchResult;
    const result = response.data as SubgraphResponseType;

    expect(result.tokenHolder.id).to.be.equal(recipient);
    expect(result.tokenHolder.tokenBalanceRaw).to.be.equal(transferAmount.toString());

  });
});
