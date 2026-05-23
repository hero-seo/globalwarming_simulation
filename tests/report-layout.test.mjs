import assert from "node:assert/strict";
import test from "node:test";
import { buildReportSummaryLayout, wrappedLineCount } from "../js/report-layout.js";

const measureMono = (text) => text.length * 10;

test("wrapped report lines keep all characters by adding lines", () => {
  assert.equal(wrappedLineCount("1234567890", 40, measureMono), 3);
  assert.equal(wrappedLineCount("발표용 보고서 문장", 50, measureMono), 2);
});

test("long reflections grow report summary cards and PNG height", () => {
  const shortLayout = buildReportSummaryLayout({
    measureText: measureMono,
    policyText: "정책",
    eventText: "이벤트",
    reflections: {
      strategy: "짧은 전략",
      science: "짧은 해석",
      tradeoff: "짧은 선택"
    }
  });
  const longLayout = buildReportSummaryLayout({
    measureText: measureMono,
    policyText: "정책",
    eventText: "이벤트",
    reflections: {
      strategy: "성장과 배출 감축을 함께 설명할 발표 문장을 충분히 길게 작성한다".repeat(8),
      science: "농도 그래프와 기온 그래프의 관계를 근거로 설명한다".repeat(8),
      tradeoff: "모둠이 고민한 선택의 장점과 단점을 발표 자료에 남긴다".repeat(10)
    }
  });

  assert.ok(longLayout.rows.strategy.height > shortLayout.rows.strategy.height);
  assert.ok(longLayout.rows.science.height > shortLayout.rows.science.height);
  assert.ok(longLayout.rows.tradeoff.y > longLayout.rows.strategy.y + longLayout.rows.strategy.height);
  assert.ok(longLayout.canvasHeight > shortLayout.canvasHeight);
});

test("science and tradeoff cards align to the right edge of the top cards", () => {
  const layout = buildReportSummaryLayout({
    measureText: measureMono,
    policyText: "정책",
    eventText: "이벤트",
    reflections: {
      strategy: "짧은 전략",
      science: "짧은 해석",
      tradeoff: "짧은 선택"
    }
  });

  assert.equal(layout.rows.policy.x + layout.rows.policy.width, layout.rows.event.x + layout.rows.event.width);
  assert.equal(layout.rows.science.x + layout.rows.science.width, layout.rows.policy.x + layout.rows.policy.width);
  assert.equal(layout.rows.tradeoff.x + layout.rows.tradeoff.width, layout.rows.policy.x + layout.rows.policy.width);
});
