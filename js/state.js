import {
  BORROW_LIMIT_PER_TURN,
  EVENTS,
  MAINTENANCE_RATE,
  POLICY_EFFECTS,
  POLICY_MAX,
  POLICY_META,
  POLICY_MIN,
  TOTAL_BORROW_LIMIT,
  TURN_BUDGET,
  TURNS
} from "./config.js";

export function createGame(cityName) {
  return {
    cityName: cityName.trim(),
    turnIndex: 0,
    history: [],
    draftPolicies: zeroPolicies(),
    approvals: {},
    budgetApproval: false,
    budgetLoans: [],
    eventChoices: {},
    eventEffects: [],
    pendingEvent: null,
    reflections: {
      strategy: "",
      science: "",
      tradeoff: ""
    }
  };
}

export function setDraftPolicy(game, policyKey, level) {
  return {
    ...game,
    draftPolicies: {
      ...game.draftPolicies,
      [policyKey]: clampPolicy(level)
    }
  };
}

export function commitTurn(game) {
  const budget = getTurnBudgetStatus(game);
  if (!budget.canCommit) return game;
  const year = TURNS[game.turnIndex];
  const turnIndex = Math.min(game.turnIndex + 1, TURNS.length);
  const nextYear = TURNS[turnIndex];
  const budgetLoans = budget.loanNeeded > 0
    ? [...game.budgetLoans, { fromYear: year, dueYear: nextYear, amount: budget.loanNeeded }]
    : game.budgetLoans;

  return {
    ...game,
    turnIndex,
    history: [...game.history, { year, policies: { ...game.draftPolicies } }],
    approvals: {},
    budgetApproval: false,
    budgetLoans,
    pendingEvent: findPendingEvent(nextYear, game.eventChoices)
  };
}

export function applyEventChoice(game, eventKey, choiceKey) {
  const event = EVENTS[eventKey];
  const choice = event.choices[choiceKey];

  return {
    ...game,
    pendingEvent: null,
    eventChoices: { ...game.eventChoices, [eventKey]: choiceKey },
    eventEffects: [...game.eventEffects, { year: event.year, eventKey, choiceKey, ...choice }],
    draftPolicies: applyPolicyBoosts(game.draftPolicies, choice)
  };
}

export function approveBudgetLoan(game) {
  return { ...game, budgetApproval: true };
}

export function getTurnBudgetStatus(game) {
  const year = TURNS[game.turnIndex];
  const nextYear = TURNS[game.turnIndex + 1];
  const debtDue = game.budgetLoans
    .filter((loan) => loan.dueYear === year)
    .reduce((sum, loan) => sum + loan.amount, 0);
  const baseBudget = TURN_BUDGET - debtDue;
  const spend = calculatePolicyIncreaseSpend(game) + calculateTurnEventSpend(game, year);
  const shortfall = Math.max(0, spend - baseBudget);
  const totalBorrowed = game.budgetLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const borrowable = nextYear
    ? Math.max(0, Math.min(BORROW_LIMIT_PER_TURN, TOTAL_BORROW_LIMIT - totalBorrowed))
    : 0;
  const fitsLoanLimit = shortfall <= borrowable;
  const canCommit = shortfall === 0 || (fitsLoanLimit && game.budgetApproval);

  return {
    year,
    debtDue,
    baseBudget,
    spend,
    remaining: baseBudget - spend,
    shortfall,
    borrowable,
    loanNeeded: shortfall && fitsLoanLimit ? shortfall : 0,
    economyApproved: game.budgetApproval,
    canCommit,
    reason: shortfall > borrowable ? "borrow-limit" : shortfall > 0 && !game.budgetApproval ? "approval-needed" : "ok"
  };
}

function findPendingEvent(year, eventChoices) {
  return Object.entries(EVENTS).find(([key, event]) => {
    return event.year === year && !eventChoices[key];
  })?.[0] ?? null;
}

function applyPolicyBoosts(policies, choice) {
  return {
    ...policies,
    renewables: clampPolicy(policies.renewables + (choice.renewablesBoost ?? 0)),
    efficiency: clampPolicy(policies.efficiency + (choice.efficiencyBoost ?? 0)),
    forests: clampPolicy(policies.forests + (choice.forestsBoost ?? 0))
  };
}

function calculatePolicyIncreaseSpend(game) {
  const previous = game.history.at(-1)?.policies ?? zeroPolicies();
  return Object.keys(POLICY_META).reduce((sum, key) => {
    const increase = Math.max(0, game.draftPolicies[key] - previous[key]);
    const maintained = Math.min(game.draftPolicies[key], previous[key]);
    return sum + increase * POLICY_EFFECTS[key].budget
      + maintained * POLICY_EFFECTS[key].budget * MAINTENANCE_RATE;
  }, 0);
}

function calculateTurnEventSpend(game, year) {
  return game.eventEffects
    .filter((effect) => effect.year === year)
    .reduce((sum, effect) => sum + (effect.budget ?? 0), 0);
}

function clampPolicy(level) {
  return Math.min(POLICY_MAX, Math.max(POLICY_MIN, Number(level)));
}

function zeroPolicies() {
  return Object.fromEntries(Object.keys(POLICY_META).map((key) => [key, 0]));
}
