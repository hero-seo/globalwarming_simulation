import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

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
});
