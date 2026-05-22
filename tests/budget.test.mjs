import assert from "node:assert/strict";
import test from "node:test";
import { BORROW_LIMIT_PER_TURN, TURN_BUDGET } from "../js/config.js";
import {
  approveBudgetLoan,
  commitTurn,
  createGame,
  getTurnBudgetStatus,
  setDraftPolicy
} from "../js/state.js";

test("a turn pays for policy increases instead of carried policy levels", () => {
  let game = createGame("해솔시");
  game = setDraftPolicy(game, "renewables", 2);

  assert.equal(getTurnBudgetStatus(game).spend, 18);

  game = commitTurn(game);

  assert.equal(getTurnBudgetStatus(game).spend, 0);
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
