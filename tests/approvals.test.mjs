import assert from "node:assert/strict";
import test from "node:test";
import { hasRequiredApprovals, needsApproval } from "../js/approvals.js";
import { POLICY_META } from "../js/config.js";

test("strong policy approval rules match the ministry design", () => {
  assert.deepEqual(POLICY_META.fossilReduction.approvers, ["environment", "economy", "energy"]);
  assert.deepEqual(POLICY_META.forests.approvers, ["environment", "economy"]);
  assert.deepEqual(POLICY_META.demandReduction.approvers, ["environment", "economy", "energy"]);
  assert.equal(POLICY_META.renewables.strongFrom, 3);
});

test("strong carbon removal waits for all required ministers", () => {
  assert.equal(needsApproval("carbonRemoval", 3), true);
  assert.equal(hasRequiredApprovals("carbonRemoval", ["environment", "science"]), false);
  assert.equal(hasRequiredApprovals("carbonRemoval", ["environment", "science", "economy"]), true);
});
