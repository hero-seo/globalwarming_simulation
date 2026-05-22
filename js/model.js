import { BASELINE, FINAL_YEAR, POLICY_EFFECTS, POLICY_META, TURNS } from "./config.js";

const YEARS = [...TURNS, FINAL_YEAR];

export function simulateScenario(turns = []) {
  const policiesByYear = carryPoliciesForward(turns);
  let previousYear = TURNS[0];
  let previousConcentration = BASELINE.concentrationPpm[previousYear];
  let previousTemperature = BASELINE.temperatureC[previousYear];

  const series = YEARS.map((year, index) => {
    const policies = policiesByYear[year];
    const emissionsGt = calculateEmissions(year, policies);
    const concentrationPpm = index === 0
      ? calculateFirstConcentration(year, emissionsGt, policies)
      : calculateConcentration(year, previousYear, emissionsGt, policies, previousConcentration);
    const temperatureC = calculateTemperature(year, concentrationPpm, policies, previousTemperature);
    const society = calculateSociety(policies);

    previousYear = year;
    previousConcentration = concentrationPpm;
    previousTemperature = temperatureC;

    return { year, emissionsGt, concentrationPpm, temperatureC, ...society };
  });

  return { series, final: series.at(-1) };
}

export function carryPoliciesForward(turns) {
  const changes = new Map(turns.map((turn) => [turn.year, turn.policies]));
  const current = zeroPolicies();

  return YEARS.reduce((byYear, year) => {
    Object.assign(current, changes.get(year) ?? {});
    byYear[year] = { ...current };
    return byYear;
  }, {});
}

export function calculateEmissions(year, policies) {
  const directCut = Object.entries(policies).reduce((sum, [key, level]) => {
    return sum + (POLICY_EFFECTS[key].directEmissions ?? 0) * level;
  }, 0);
  const remainingShare = Math.max(0.18, 1 - directCut);
  return round1(BASELINE.emissionsGt[year] * remainingShare);
}

function calculateFirstConcentration(year, emissionsGt, policies) {
  const baselineRatio = emissionsGt / BASELINE.emissionsGt[year];
  const sinkSupport = calculateSinkSupport(policies);
  const avoided = (1 - baselineRatio) * 12 + sinkSupport * 10;
  return round1(BASELINE.concentrationPpm[year] - avoided);
}

function calculateConcentration(year, previousYear, emissionsGt, policies, previousConcentration) {
  const baselineStep = BASELINE.concentrationPpm[year] - BASELINE.concentrationPpm[previousYear];
  const emissionsRatio = emissionsGt / BASELINE.emissionsGt[year];
  const sinkSupport = calculateSinkSupport(policies);
  const adjustedStep = baselineStep * emissionsRatio * Math.max(0.42, 1 - sinkSupport);
  return round1(Math.max(410, previousConcentration + adjustedStep));
}

function calculateTemperature(year, concentrationPpm, policies, previousTemperature) {
  const baseline = BASELINE.temperatureC[year];
  const concentrationGap = concentrationPpm - BASELINE.concentrationPpm[year];
  const target = baseline + concentrationGap * 0.008;
  return round2(previousTemperature + (target - previousTemperature) * 0.7);
}

function calculateSinkSupport(policies) {
  return policies.forests * POLICY_EFFECTS.forests.sinkSupport
    + policies.carbonRemoval * POLICY_EFFECTS.carbonRemoval.sinkSupport;
}

function calculateSociety(policies) {
  return Object.keys(POLICY_META).reduce((totals, key) => {
    const level = policies[key];
    const effect = POLICY_EFFECTS[key];
    totals.budget += effect.budget * level;
    totals.burden += effect.burden * level;
    totals.development += effect.development * level;
    return totals;
  }, { budget: 0, burden: 0, development: 50 });
}

function zeroPolicies() {
  return Object.fromEntries(Object.keys(POLICY_META).map((key) => [key, 0]));
}

const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;
