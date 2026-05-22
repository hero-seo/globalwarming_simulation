import assert from "node:assert/strict";
import test from "node:test";
import { applyEventChoice, commitTurn, createGame, setDraftPolicy } from "../js/state.js";

test("policy levels carry forward after a committed turn", () => {
  let game = createGame("해솔시");
  game = setDraftPolicy(game, "renewables", 2);
  const next = commitTurn(game);

  assert.equal(next.turnIndex, 1);
  assert.equal(next.draftPolicies.renewables, 2);
  assert.equal(next.history[0].year, 2030);
});

test("planned policy events appear at 2040 and 2060 once", () => {
  let game = createGame("해솔시");
  game = commitTurn(game);
  assert.equal(game.pendingEvent, "electricityDemand");

  game = applyEventChoice(game, "electricityDemand", "cleanBuildout");
  game = commitTurn(game);
  assert.equal(game.pendingEvent, "forestExpansion");

  game = applyEventChoice(game, "forestExpansion", "forestShield");
  assert.equal(game.pendingEvent, null);
  assert.equal(game.eventChoices.forestExpansion, "forestShield");
});
