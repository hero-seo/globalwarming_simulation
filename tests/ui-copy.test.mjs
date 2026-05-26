import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../globalwarming_simulation.html", import.meta.url), "utf8");

test("classroom copy names the game and the city growth threshold clearly", () => {
  assert.match(html, /<title>지구온난화로부터 우리 도시를 지켜라<\/title>/);
  assert.match(html, /지구온난화로부터<\/span>\s*<span>우리 도시를 지켜라<\/span>/);
  assert.match(html, /70점 미만이면 성장 부족/);
  assert.doesNotMatch(html, /낮으면 성장 부족/);
});

test("final report copy keeps the year labels and hides the loan metric", () => {
  assert.match(html, /\$\{game\.cityName\} 2100년 기후 결과 보고서/);
  assert.match(html, /2100년 기온 변화/);
  assert.doesNotMatch(html, /\["누적 대출"/);
  assert.doesNotMatch(html, /정책 선택 -> 배출량 -> 대기 중 농도 -> 기온 변화/);
});

test("policy interaction stays on partial refresh instead of re-rendering the whole grid", () => {
  assert.match(html, /function updatePolicy\(event\)[\s\S]*syncPolicyCards\(\);[\s\S]*renderScenario\(\);/);
  assert.match(html, /function toggleApproval\(event\)[\s\S]*syncPolicyCards\(\);[\s\S]*renderScenario\(\);/);
});

test("approval count message is refreshed on turn changes and approval edits", () => {
  assert.match(html, /function updateApprovalMessage\(\)/);
  assert.match(html, /function renderTurn\(\)[\s\S]*updateApprovalMessage\(\);/);
  assert.match(html, /function updatePolicy\(event\)[\s\S]*updateApprovalMessage\(\);/);
  assert.match(html, /function toggleApproval\(event\)[\s\S]*updateApprovalMessage\(\);/);
  assert.match(html, /function commitTurn\(\)[\s\S]*updateApprovalMessage\(\);/);
});

test("policy cards show budget cost beside development impact", () => {
  assert.match(html, /도시 발전도[\s\S]*예산 사용/);
  assert.doesNotMatch(html, /발전도 영향/);
  assert.match(html, /data-policy-budget-value/);
  assert.match(html, /policy\.budget/);
});

test("approval limit copy says approval count exceeded", () => {
  assert.match(html, /승인 횟수 초과/);
  assert.doesNotMatch(html, /한도초과/);
});

test("fullscreen mode has a css fallback that survives native fullscreen exit", () => {
  assert.match(html, /html\.app-fullscreen/);
  assert.match(html, /classList\.add\("app-fullscreen"\)/);
  assert.match(html, /classList\.remove\("app-fullscreen"\)/);
  assert.match(html, /function isFullscreenActive\(\)[\s\S]*app-fullscreen/);
  assert.doesNotMatch(html, /els\.fullscreen\.hidden = true/);
});
