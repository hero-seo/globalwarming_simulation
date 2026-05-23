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
