import { POLICY_META } from "./config.js";

export function needsApproval(policyKey, level) {
  return level >= POLICY_META[policyKey].strongFrom;
}

export function hasRequiredApprovals(policyKey, approvedRoles = []) {
  return POLICY_META[policyKey].approvers.every((role) => approvedRoles.includes(role));
}
