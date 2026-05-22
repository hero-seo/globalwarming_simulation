import assert from "node:assert/strict";
import test from "node:test";
import { simulateScenario } from "../js/model.js";

const zeroPolicies = () => ({
  fossilReduction: 0,
  renewables: 0,
  efficiency: 0,
  forests: 0,
  demandReduction: 0,
  carbonRemoval: 0
});

test("early combined action lowers 2100 emissions concentration and temperature", () => {
  const baseline = simulateScenario([{ year: 2030, policies: zeroPolicies() }]);
  const action = simulateScenario([{
    year: 2030,
    policies: {
      fossilReduction: 3,
      renewables: 3,
      efficiency: 3,
      forests: 2,
      demandReduction: 2,
      carbonRemoval: 1
    }
  }]);

  assert.ok(action.final.emissionsGt < baseline.final.emissionsGt);
  assert.ok(action.final.concentrationPpm < baseline.final.concentrationPpm);
  assert.ok(action.final.temperatureC < baseline.final.temperatureC);
});

test("the same fossil policy helps less when it starts late", () => {
  const early = simulateScenario([{ year: 2030, policies: { ...zeroPolicies(), fossilReduction: 3 } }]);
  const late = simulateScenario([{ year: 2080, policies: { ...zeroPolicies(), fossilReduction: 3 } }]);

  assert.ok(early.final.concentrationPpm < late.final.concentrationPpm);
  assert.ok(early.final.temperatureC < late.final.temperatureC);
});

test("sinks alone do not beat broad emissions reduction", () => {
  const sinks = simulateScenario([{
    year: 2030,
    policies: { ...zeroPolicies(), forests: 4, carbonRemoval: 4 }
  }]);
  const cuts = simulateScenario([{
    year: 2030,
    policies: { ...zeroPolicies(), fossilReduction: 3, renewables: 3, efficiency: 3, demandReduction: 2 }
  }]);

  assert.ok(cuts.final.emissionsGt < sinks.final.emissionsGt);
  assert.ok(cuts.final.temperatureC < sinks.final.temperatureC);
});

test("early balanced high action can reach the classroom two degree goal", () => {
  const result = simulateScenario([{
    year: 2030,
    policies: {
      fossilReduction: 4,
      renewables: 4,
      efficiency: 4,
      forests: 4,
      demandReduction: 4,
      carbonRemoval: 3
    }
  }]);

  assert.ok(result.final.temperatureC <= 2.0);
});

test("demand reduction trades development for lower emissions", () => {
  const baseline = simulateScenario([{ year: 2030, policies: zeroPolicies() }]).final;
  const reducedDemand = simulateScenario([{
    year: 2030,
    policies: { ...zeroPolicies(), demandReduction: 3 }
  }]).final;

  assert.ok(reducedDemand.emissionsGt < baseline.emissionsGt);
  assert.ok(reducedDemand.development < baseline.development);
});
