import {
  TokenHolder,
  Delegate,
  Proposal,
  Governance,
  Vote
} from "../../generated/schema";
import {
  Address,
  BigInt,
  Bytes,
  log
} from "@graphprotocol/graph-ts";
import { DEFAULT_DECIMALS, toDecimal } from "./decimals";
import {
  ZERO_ADDRESS,
  BIGINT_ZERO,
  BIGINT_ONE,
  BIGDECIMAL_ZERO
} from "./constants";

export function getOrCreateTokenHolder(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = true
): TokenHolder {
  let tokenHolder = TokenHolder.load(id);

  if (tokenHolder == null && createIfNotFound) {
    tokenHolder = new TokenHolder(id);
    tokenHolder.tokenBalanceRaw = BIGINT_ZERO;
    tokenHolder.tokenBalance = BIGDECIMAL_ZERO;
    tokenHolder.totalTokensHeldRaw = BIGINT_ZERO;
    tokenHolder.totalTokensHeld = BIGDECIMAL_ZERO;

    if (id != ZERO_ADDRESS) {
      let governance = getGovernanceEntity();
      governance.totalTokenHolders = governance.totalTokenHolders.plus(BIGINT_ONE);
      governance.save();
    }

    if (save) {
      tokenHolder.save();
    }
  }

  return tokenHolder as TokenHolder;
}

export function getOrCreateDelegate(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = true
): Delegate {
  let delegate = Delegate.load(id);

  if (delegate == null && createIfNotFound) {
    delegate = new Delegate(id);
    delegate.delegatedVotesRaw = BIGINT_ZERO;
    delegate.delegatedVotes = BIGDECIMAL_ZERO;
    delegate.tokenHoldersRepresentedAmount = 0;

    if (id != ZERO_ADDRESS) {
      let governance = getGovernanceEntity();
      governance.totalDelegates = governance.totalDelegates.plus(BIGINT_ONE);
      governance.save();
    }

    if (save) {
      delegate.save();
    }
  }

  return delegate as Delegate;
}

export function getOrCreateVote(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = false
): Vote {
  let vote = Vote.load(id);

  if (vote == null && createIfNotFound) {
    vote = new Vote(id);

    if (save) {
      vote.save();
    }
  }

  return vote as Vote;
}

export function getOrCreateProposal(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = false
): Proposal {
  let proposal = Proposal.load(id);

  if (proposal == null && createIfNotFound) {
    proposal = new Proposal(id);

    let governance = getGovernanceEntity();

    governance.proposals = governance.proposals.plus(BIGINT_ONE);
    governance.save();

    if (save) {
      proposal.save();
    }
  }

  return proposal as Proposal;
}

export function getGovernanceEntity(): Governance {
  let governance = Governance.load("GOVERNANCE");

  if (governance == null) {
    governance = new Governance("GOVERNANCE");
    governance.proposals = BIGINT_ZERO;
    governance.totalTokenHolders = BIGINT_ZERO;
    governance.currentTokenHolders = BIGINT_ZERO;
    governance.currentDelegates = BIGINT_ZERO;
    governance.totalDelegates = BIGINT_ZERO;
    governance.delegatedVotesRaw = BIGINT_ZERO;
    governance.delegatedVotes = BIGDECIMAL_ZERO;
    governance.proposalsQueued = BIGINT_ZERO;
  }

  return governance as Governance;
}
