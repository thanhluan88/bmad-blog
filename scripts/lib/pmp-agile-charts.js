/** Agile chart definitions + SVG renderer for PMP exam questions missing images. */

const CHARTS = {
  16: {
    type: "burndown",
    title: "Sprint burndown — 15-day sprint (day 4 marked)",
    caption: "Actual remaining work (solid) nằm dưới ideal line (dashed) → team đang ahead of schedule tại day 4.",
    days: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    ideal: [60, 56, 52, 48, 44, 40, 36, 32, 28, 24, 20, 16, 12, 8, 4, 0],
    actual: [60, 55, 49, 42, 32, null, null, null, null, null, null, null, null, null, null, null],
    markerDay: 4,
    yLabel: "Remaining work (SP)",
    xLabel: "Sprint day",
  },
  285: {
    type: "burnup",
    title: "Sprint burnup — 7-day sprint",
    caption: "Scope line (blue) tăng từ day 3 → work được thêm vào sprint sau khi đã bắt đầu.",
    days: [0, 1, 2, 3, 4, 5, 6, 7],
    scope: [40, 40, 40, 55, 55, 55, 55, 55],
    completed: [0, 8, 16, 22, 30, 36, 42, 48],
    markerDay: 3,
    yLabel: "Work (SP)",
    xLabel: "Sprint day",
  },
  1373: {
    type: "burndown",
    title: "Burndown với spike (time-boxed investigation)",
    caption: "Đoạn phẳng (days 3–5): remaining work không giảm trong khi team chạy spike.",
    days: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    ideal: [50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0],
    actual: [50, 44, 38, 38, 38, 38, 30, 22, 15, 8, 0],
    yLabel: "Remaining work (SP)",
    xLabel: "Sprint day",
    highlightFlat: [3, 4, 5],
  },
  456: {
    type: "cfd",
    title: "Cumulative flow diagram — several sprints",
    caption: '"In Progress" band mở rộng; "Done" band không tăng 3 sprint gần nhất → bottleneck.',
    periods: [1, 2, 3, 4, 5, 6, 7, 8],
    todo: [20, 22, 24, 26, 28, 30, 32, 34],
    inProgress: [10, 12, 15, 18, 22, 28, 34, 40],
    done: [10, 14, 18, 24, 30, 36, 36, 36],
    yLabel: "Work items",
    xLabel: "Sprint",
  },
  625: {
    type: "release_burndown",
    title: "Release burndown — 10 iterations",
    caption: "Tại Iteration 9: actual remaining (red) cao hơn expected (dashed) → chậm hơn kế hoạch.",
    iterations: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    expected: [900, 810, 720, 630, 540, 450, 360, 270, 180, 90],
    actual: [900, 820, 750, 690, 640, 590, 550, 510, 480, 450],
    markerIteration: 9,
    yLabel: "Remaining work (SP)",
    xLabel: "Iteration",
  },
  631: {
    type: "cfd",
    title: "Cumulative flow diagram — daily coordination",
    caption: "Done tăng đều; WIP ổn định đến Period 7 — cần xác nhận Definition of Done trước khi thêm scope.",
    periods: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    todo: [30, 28, 26, 24, 22, 20, 18, 16, 14, 12],
    inProgress: [8, 8, 8, 8, 8, 8, 8, 10, 12, 14],
    done: [2, 6, 10, 16, 22, 30, 38, 48, 58, 68],
    yLabel: "Work items",
    xLabel: "Period",
  },
  772: {
    type: "burnup",
    title: "Hybrid project burnup — backlog vs delivered",
    caption: "Scope/backlog (blue) tăng nhanh hơn Completed (green) → backlog growth outpacing delivery.",
    days: [1, 2, 3, 4, 5, 6],
    scope: [100, 110, 125, 145, 165, 190],
    completed: [100, 105, 112, 118, 125, 132],
    yLabel: "Story points",
    xLabel: "Iteration",
  },
  1036: {
    type: "burndown",
    title: "Iteration burndown — velocity spike",
    caption: "Day 6: độ dốc actual line đột ngột cao hơn → velocity tăng nhờ công nghệ mới.",
    days: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    ideal: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0],
    actual: [100, 92, 85, 78, 72, 66, 48, 40, 32, 24, 16],
    markerDay: 6,
    yLabel: "Remaining work (SP)",
    xLabel: "Sprint day",
  },
};

function getChartForQuestion(q) {
  if (q?.id != null && CHARTS[q.id]) return CHARTS[q.id];
  const text = String(q?.text || "").toLowerCase();
  if (/burnup chart for the last 7-day sprint/.test(text)) return CHARTS[285];
  if (/burndown chart is shown below/.test(text) && /15-day sprint/.test(text)) return CHARTS[16];
  if (/how does a spike typically appear/.test(text)) return CHARTS[1373];
  if (/burndown chart showing actual remaining work compared to expected.*10 iterations/.test(text)) return CHARTS[625];
  if (/impact of this technology on the iteration burndown/.test(text)) return CHARTS[1036];
  if (/"in progress" band has continued to grow/.test(text)) return CHARTS[456];
  if (/cfd.*period 7|period 7.*cfd|tasks remain stable until period 7/i.test(text)) return CHARTS[631];
  if (/backlog growth outpacing delivery/.test(text)) return CHARTS[772];
  return null;
}

function svgEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linePath(points, xFn, yFn) {
  return points
    .map((v, i) => (v == null ? null : `${i === 0 || points[i - 1] == null ? "M" : "L"}${xFn(i).toFixed(1)},${yFn(v).toFixed(1)}`))
    .filter(Boolean)
    .join(" ");
}

function renderBurndownSvg(def) {
  const W = 520;
  const H = 280;
  const pad = { l: 52, r: 24, t: 40, b: 44 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const labels = def.days;
  const series = [...def.ideal, ...(def.actual || []).filter((v) => v != null)];
  const maxY = Math.max(...series, 1) * 1.08;
  const n = labels.length;
  const x = (i) => pad.l + (i / (n - 1)) * plotW;
  const y = (v) => pad.t + plotH - (v / maxY) * plotH;

  const idealPath = linePath(def.ideal, x, y);
  const actualVals = def.actual || def.ideal.map((_, i) => def.ideal[i]);
  const actualPath = linePath(actualVals, x, y);

  let marker = "";
  if (def.markerDay != null) {
    const idx = labels.indexOf(def.markerDay);
    if (idx >= 0 && actualVals[idx] != null) {
      marker = `<circle cx="${x(idx)}" cy="${y(actualVals[idx])}" r="5" fill="#dc2626"/><text x="${x(idx)}" y="${pad.t - 8}" text-anchor="middle" font-size="11" fill="#dc2626">Day ${def.markerDay}</text>`;
    }
  }

  let flatHighlight = "";
  if (def.highlightFlat?.length) {
    const i0 = labels.indexOf(def.highlightFlat[0]);
    const i1 = labels.indexOf(def.highlightFlat[def.highlightFlat.length - 1]);
    if (i0 >= 0 && i1 >= 0) {
      flatHighlight = `<rect x="${x(i0) - 8}" y="${pad.t}" width="${x(i1) - x(i0) + 16}" height="${plotH}" fill="#fef3c7" opacity="0.45"/>`;
    }
  }

  return `<svg viewBox="0 0 ${W} ${H}" class="agile-chart-svg" role="img" aria-label="${svgEscape(def.title)}">
    <text x="${W / 2}" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="#1e293b">${svgEscape(def.title)}</text>
    ${flatHighlight}
    <line x1="${pad.l}" y1="${pad.t + plotH}" x2="${W - pad.r}" y2="${pad.t + plotH}" stroke="#94a3b8"/>
    <line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t + plotH}" stroke="#94a3b8"/>
    <path d="${idealPath}" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
    <path d="${actualPath}" fill="none" stroke="#2563eb" stroke-width="2.5"/>
    ${marker}
    <text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#64748b">${svgEscape(def.xLabel || "Day")}</text>
    <text transform="translate(14 ${pad.t + plotH / 2}) rotate(-90)" text-anchor="middle" font-size="11" fill="#64748b">${svgEscape(def.yLabel || "Remaining")}</text>
    <text x="${W - pad.r - 4}" y="${pad.t + 14}" text-anchor="end" font-size="10" fill="#64748b">— Ideal</text>
    <text x="${W - pad.r - 4}" y="${pad.t + 28}" text-anchor="end" font-size="10" fill="#2563eb">— Actual</text>
  </svg>`;
}

function renderBurnupSvg(def) {
  const W = 520;
  const H = 280;
  const pad = { l: 52, r: 24, t: 40, b: 44 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const labels = def.days;
  const maxY = Math.max(...def.scope, ...def.completed, 1) * 1.08;
  const n = labels.length;
  const x = (i) => pad.l + (i / (n - 1)) * plotW;
  const y = (v) => pad.t + plotH - (v / maxY) * plotH;
  const scopePath = linePath(def.scope, x, y);
  const completedPath = linePath(def.completed, x, y);

  let marker = "";
  if (def.markerDay != null) {
    const idx = labels.indexOf(def.markerDay);
    if (idx >= 0) {
      marker = `<line x1="${x(idx)}" y1="${pad.t}" x2="${x(idx)}" y2="${pad.t + plotH}" stroke="#f59e0b" stroke-dasharray="4 3"/><text x="${x(idx)}" y="${pad.t - 8}" text-anchor="middle" font-size="11" fill="#b45309">Day ${def.markerDay}</text>`;
    }
  }

  return `<svg viewBox="0 0 ${W} ${H}" class="agile-chart-svg" role="img" aria-label="${svgEscape(def.title)}">
    <text x="${W / 2}" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="#1e293b">${svgEscape(def.title)}</text>
    ${marker}
    <line x1="${pad.l}" y1="${pad.t + plotH}" x2="${W - pad.r}" y2="${pad.t + plotH}" stroke="#94a3b8"/>
    <line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t + plotH}" stroke="#94a3b8"/>
    <path d="${scopePath}" fill="none" stroke="#2563eb" stroke-width="2.5"/>
    <path d="${completedPath}" fill="none" stroke="#16a34a" stroke-width="2.5"/>
    <text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#64748b">${svgEscape(def.xLabel || "Day")}</text>
    <text transform="translate(14 ${pad.t + plotH / 2}) rotate(-90)" text-anchor="middle" font-size="11" fill="#64748b">${svgEscape(def.yLabel || "Work")}</text>
    <text x="${W - pad.r - 4}" y="${pad.t + 14}" text-anchor="end" font-size="10" fill="#2563eb">— Scope</text>
    <text x="${W - pad.r - 4}" y="${pad.t + 28}" text-anchor="end" font-size="10" fill="#16a34a">— Completed</text>
  </svg>`;
}

function renderReleaseBurndownSvg(def) {
  const W = 520;
  const H = 280;
  const pad = { l: 52, r: 24, t: 40, b: 44 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const labels = def.iterations;
  const maxY = Math.max(...def.expected, ...def.actual, 1) * 1.08;
  const n = labels.length;
  const x = (i) => pad.l + (i / (n - 1)) * plotW;
  const y = (v) => pad.t + plotH - (v / maxY) * plotH;
  const expectedPath = linePath(def.expected.slice(0, n), x, y);
  const actualPath = linePath(def.actual.slice(0, n), x, y);

  let marker = "";
  if (def.markerIteration != null) {
    const idx = labels.indexOf(def.markerIteration);
    if (idx >= 0) {
      marker = `<line x1="${x(idx)}" y1="${pad.t}" x2="${x(idx)}" y2="${pad.t + plotH}" stroke="#dc2626" stroke-dasharray="4 3"/><text x="${x(idx)}" y="${pad.t - 8}" text-anchor="middle" font-size="11" fill="#dc2626">Iter ${def.markerIteration}</text>`;
    }
  }

  return `<svg viewBox="0 0 ${W} ${H}" class="agile-chart-svg" role="img" aria-label="${svgEscape(def.title)}">
    <text x="${W / 2}" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="#1e293b">${svgEscape(def.title)}</text>
    ${marker}
    <line x1="${pad.l}" y1="${pad.t + plotH}" x2="${W - pad.r}" y2="${pad.t + plotH}" stroke="#94a3b8"/>
    <line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t + plotH}" stroke="#94a3b8"/>
    <path d="${expectedPath}" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
    <path d="${actualPath}" fill="none" stroke="#dc2626" stroke-width="2.5"/>
    <text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#64748b">${svgEscape(def.xLabel || "Iteration")}</text>
    <text transform="translate(14 ${pad.t + plotH / 2}) rotate(-90)" text-anchor="middle" font-size="11" fill="#64748b">${svgEscape(def.yLabel || "Remaining")}</text>
    <text x="${W - pad.r - 4}" y="${pad.t + 14}" text-anchor="end" font-size="10" fill="#64748b">— Expected</text>
    <text x="${W - pad.r - 4}" y="${pad.t + 28}" text-anchor="end" font-size="10" fill="#dc2626">— Actual</text>
  </svg>`;
}

function renderCfdSvg(def) {
  const W = 520;
  const H = 280;
  const pad = { l: 52, r: 24, t: 40, b: 44 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const n = def.periods.length;
  const x = (i) => pad.l + (i / (n - 1)) * plotW;
  const maxY = Math.max(...def.todo.map((t, i) => t + def.inProgress[i] + def.done[i])) * 1.08;
  const y = (v) => pad.t + plotH - (v / maxY) * plotH;

  const topDone = def.done;
  const topProg = def.done.map((d, i) => d + def.inProgress[i]);
  const topTodo = def.done.map((d, i) => d + def.inProgress[i] + def.todo[i]);

  function areaPath(top, bottom) {
    const upper = top.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    const lower = bottom
      .map((v, i) => `L${x(n - 1 - i).toFixed(1)},${y(bottom[n - 1 - i]).toFixed(1)}`)
      .join(" ");
    return `${upper} ${lower} Z`;
  }

  return `<svg viewBox="0 0 ${W} ${H}" class="agile-chart-svg" role="img" aria-label="${svgEscape(def.title)}">
    <text x="${W / 2}" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="#1e293b">${svgEscape(def.title)}</text>
    <line x1="${pad.l}" y1="${pad.t + plotH}" x2="${W - pad.r}" y2="${pad.t + plotH}" stroke="#94a3b8"/>
    <line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t + plotH}" stroke="#94a3b8"/>
    <path d="${areaPath(topTodo, topProg)}" fill="#dbeafe" stroke="none"/>
    <path d="${areaPath(topProg, topDone)}" fill="#fde68a" stroke="none"/>
    <path d="${areaPath(topDone, def.periods.map(() => 0))}" fill="#bbf7d0" stroke="none"/>
    <text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#64748b">${svgEscape(def.xLabel || "Period")}</text>
    <text transform="translate(14 ${pad.t + plotH / 2}) rotate(-90)" text-anchor="middle" font-size="11" fill="#64748b">${svgEscape(def.yLabel || "Items")}</text>
    <text x="${W - pad.r - 4}" y="${pad.t + 14}" text-anchor="end" font-size="10" fill="#16a34a">Done</text>
    <text x="${W - pad.r - 4}" y="${pad.t + 28}" text-anchor="end" font-size="10" fill="#ca8a04">In Progress</text>
    <text x="${W - pad.r - 4}" y="${pad.t + 42}" text-anchor="end" font-size="10" fill="#2563eb">To Do</text>
  </svg>`;
}

function renderChartSvg(def) {
  if (!def) return "";
  switch (def.type) {
    case "burndown":
      return renderBurndownSvg(def);
    case "burnup":
      return renderBurnupSvg(def);
    case "release_burndown":
      return renderReleaseBurndownSvg(def);
    case "cfd":
      return renderCfdSvg(def);
    default:
      return "";
  }
}

function renderChartHtml(def) {
  if (!def) return "";
  const svg = renderChartSvg(def);
  const caption = def.caption ? `<figcaption class="agile-chart-caption">${svgEscape(def.caption)}</figcaption>` : "";
  return `<figure class="agile-chart">${svg}${caption}</figure>`;
}

module.exports = {
  CHARTS,
  getChartForQuestion,
  renderChartSvg,
  renderChartHtml,
};
