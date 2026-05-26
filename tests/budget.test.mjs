import assert from "node:assert/strict";
import test from "node:test";
import { BORROW_LIMIT_PER_TURN, MAINTENANCE_RATE, TURN_BUDGET } from "../js/config.js";
import {
  approveBudgetLoan,
  commitTurn,
  createGame,
  getTurnBudgetStatus,
  setDraftPolicy
} from "../js/state.js";

test("a turn pays full cost for increases and maintenance for carried policy levels", () => {
  let game = createGame("해솔시");
  game = setDraftPolicy(game, "renewables", 2);

  assert.equal(getTurnBudgetStatus(game).spend, 18);

  game = commitTurn(game);

  assert.equal(getTurnBudgetStatus(game).spend, 18 * MAINTENANCE_RATE);
});

test("a policy lowered and raised again pays maintenance plus the new increase", () => {
  let game = createGame("해솔시");
  game = setDraftPolicy(game, "renewables", 4);
  game = approveBudgetLoan(game);
  game = commitTurn(game);

  game = setDraftPolicy(game, "renewables", 2);
  assert.equal(getTurnBudgetStatus(game).spend, 18 * MAINTENANCE_RATE);
  game = commitTurn(game);

  game = setDraftPolicy(game, "renewables", 4);
  assert.equal(getTurnBudgetStatus(game).spend, 18 + 18 * MAINTENANCE_RATE);
});

test("economy approval borrows a capped shortfall from the next turn", () => {
  let game = createGame("해솔시");
  game = setDraftPolicy(game, "renewables", 4);
  game = setDraftPolicy(game, "efficiency", 4);

  const beforeApproval = getTurnBudgetStatus(game);
  assert.equal(beforeApproval.baseBudget, TURN_BUDGET);
  assert.equal(beforeApproval.shortfall, 24);
  assert.equal(beforeApproval.borrowable, BORROW_LIMIT_PER_TURN);
  assert.equal(beforeApproval.canCommit, false);

  game = approveBudgetLoan(game);
  const afterApproval = getTurnBudgetStatus(game);
  assert.equal(afterApproval.canCommit, false);
  assert.equal(afterApproval.reason, "borrow-limit");
});

test("approved affordable borrowing is charged against the next turn budget", () => {
  let game = createGame("해솔시");
  game = setDraftPolicy(game, "renewables", 3);
  game = setDraftPolicy(game, "efficiency", 3);

  game = approveBudgetLoan(game);
  assert.equal(getTurnBudgetStatus(game).loanNeeded, 8);

  game = commitTurn(game);
  const nextTurn = getTurnBudgetStatus(game);

  assert.equal(nextTurn.baseBudget, TURN_BUDGET - 8);
  assert.equal(nextTurn.debtDue, 8);
});
