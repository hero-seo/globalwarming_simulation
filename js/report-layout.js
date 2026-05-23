const SUMMARY_Y = 1422;
const SUMMARY_TITLE_BOTTOM = 1492;
const ROW_GAP = 8;
const TEXT_TOP = 55;
const TEXT_BOTTOM = 18;
const LINE_HEIGHT = 27;
const MIN_CANVAS_HEIGHT = 1840;

export function wrappedLineCount(text, maxWidth, measureText) {
  const value = String(text || "");
  let lines = 0;

  value.split("\n").forEach((paragraph) => {
    if (!paragraph) {
      lines += 1;
      return;
    }

    let line = "";
    for (const char of paragraph) {
      const next = line + char;
      if (!line || measureText(next) <= maxWidth) {
        line = next;
        continue;
      }

      lines += 1;
      line = char;
    }
    if (line) lines += 1;
  });

  return Math.max(lines, 1);
}

export function buildReportSummaryLayout({ measureText, policyText, eventText, reflections }) {
  const heightFor = (text, width, minHeight) => {
    const lines = wrappedLineCount(text, width - 32, measureText);
    return Math.max(minHeight, TEXT_TOP + (lines - 1) * LINE_HEIGHT + TEXT_BOTTOM);
  };
  const policy = { x: 92, y: SUMMARY_TITLE_BOTTOM, width: 1170 };
  policy.height = heightFor(policyText, policy.width, 64);
  const event = { x: 92, y: policy.y + policy.height + ROW_GAP, width: 1170 };
  event.height = heightFor(eventText, event.width, 56);
  const strategy = { x: 92, y: event.y + event.height + ROW_GAP, width: 560 };
  strategy.height = heightFor(reflections.strategy, strategy.width, 104);
  const science = { x: 684, y: strategy.y, width: 578 };
  science.height = heightFor(reflections.science, science.width, 104);
  const reflectionHeight = Math.max(strategy.height, science.height);
  strategy.height = reflectionHeight;
  science.height = reflectionHeight;
  const tradeoff = { x: 92, y: strategy.y + reflectionHeight + ROW_GAP, width: 1170 };
  tradeoff.height = heightFor(reflections.tradeoff, tradeoff.width, 76);
  const summaryHeight = tradeoff.y + tradeoff.height - SUMMARY_Y + 20;

  return {
    summaryY: SUMMARY_Y,
    summaryHeight,
    canvasHeight: Math.max(MIN_CANVAS_HEIGHT, SUMMARY_Y + summaryHeight + 18),
    rows: { policy, event, strategy, science, tradeoff }
  };
}
