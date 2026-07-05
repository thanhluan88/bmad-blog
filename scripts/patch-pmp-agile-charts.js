const fs = require("fs");
const path = require("path");
const { CHARTS, renderChartSvg } = require("./lib/pmp-agile-charts");

const CSS_START = "/* PMP_AGILE_CHARTS_CSS_START */";
const CSS_END = "/* PMP_AGILE_CHARTS_CSS_END */";
const JS_START = "/* PMP_AGILE_CHARTS_JS_START */";
const JS_END = "/* PMP_AGILE_CHARTS_JS_END */";

const FILES = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
  path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
];

const CSS_BLOCK = `${CSS_START}
    .agile-chart {
      margin: 0.85rem 0 1rem;
      padding: 0.75rem 0.85rem 0.65rem;
      border: 1px solid #bae6fd;
      border-radius: 12px;
      background: #f8fafc;
    }
    .agile-chart-svg {
      display: block;
      width: 100%;
      max-width: 520px;
      height: auto;
      margin: 0 auto;
    }
    .agile-chart-caption {
      margin: 0.55rem 0 0;
      font-size: 0.86rem;
      line-height: 1.55;
      color: var(--muted);
      text-align: center;
    }
${CSS_END}`;

function buildJsBlock() {
  const chartJson = JSON.stringify(CHARTS);
  return `${JS_START}
    const PMP_AGILE_CHARTS = ${chartJson};

    function renderAgileChartSvg(def) {
      if (!def) return "";
      const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
      const W = 520, H = 280, pad = { l: 52, r: 24, t: 40, b: 44 };
      const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
      const linePath = (vals, xFn, yFn) => vals.map((v, i) => (v == null ? null : (i === 0 || vals[i-1] == null ? "M" : "L") + xFn(i).toFixed(1) + "," + yFn(v).toFixed(1))).filter(Boolean).join(" ");

      if (def.type === "burndown" || def.type === "release_burndown") {
        const labels = def.type === "release_burndown" ? def.iterations : def.days;
        const ideal = def.type === "release_burndown" ? def.expected.slice(0, labels.length) : def.ideal;
        const actual = def.type === "release_burndown" ? def.actual.slice(0, labels.length) : (def.actual || def.ideal);
        const maxY = Math.max(...ideal, ...actual.filter(v => v != null), 1) * 1.08;
        const n = labels.length;
        const x = i => pad.l + (i / (n - 1)) * plotW;
        const y = v => pad.t + plotH - (v / maxY) * plotH;
        let marker = "";
        const mark = def.type === "release_burndown" ? def.markerIteration : def.markerDay;
        if (mark != null) {
          const idx = labels.indexOf(mark);
          if (idx >= 0 && actual[idx] != null) {
            marker = '<circle cx="' + x(idx) + '" cy="' + y(actual[idx]) + '" r="5" fill="#dc2626"/><text x="' + x(idx) + '" y="' + (pad.t - 8) + '" text-anchor="middle" font-size="11" fill="#dc2626">' + (def.type === "release_burndown" ? "Iter " : "Day ") + mark + '</text>';
          }
        }
        let flat = "";
        if (def.highlightFlat?.length) {
          const i0 = labels.indexOf(def.highlightFlat[0]), i1 = labels.indexOf(def.highlightFlat[def.highlightFlat.length - 1]);
          if (i0 >= 0 && i1 >= 0) flat = '<rect x="' + (x(i0)-8) + '" y="' + pad.t + '" width="' + (x(i1)-x(i0)+16) + '" height="' + plotH + '" fill="#fef3c7" opacity="0.45"/>';
        }
        return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="agile-chart-svg" role="img"><text x="' + (W/2) + '" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="#1e293b">' + esc(def.title) + '</text>' + flat +
          '<line x1="' + pad.l + '" y1="' + (pad.t+plotH) + '" x2="' + (W-pad.r) + '" y2="' + (pad.t+plotH) + '" stroke="#94a3b8"/><line x1="' + pad.l + '" y1="' + pad.t + '" x2="' + pad.l + '" y2="' + (pad.t+plotH) + '" stroke="#94a3b8"/>' +
          '<path d="' + linePath(ideal, x, y) + '" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>' +
          '<path d="' + linePath(actual, x, y) + '" fill="none" stroke="' + (def.type === "release_burndown" ? "#dc2626" : "#2563eb") + '" stroke-width="2.5"/>' + marker +
          '<text x="' + (W/2) + '" y="' + (H-8) + '" text-anchor="middle" font-size="11" fill="#64748b">' + esc(def.xLabel||"Day") + '</text></svg>';
      }

      if (def.type === "burnup") {
        const labels = def.days, maxY = Math.max(...def.scope, ...def.completed, 1) * 1.08, n = labels.length;
        const x = i => pad.l + (i / (n - 1)) * plotW, y = v => pad.t + plotH - (v / maxY) * plotH;
        let marker = "";
        if (def.markerDay != null) {
          const idx = labels.indexOf(def.markerDay);
          if (idx >= 0) marker = '<line x1="' + x(idx) + '" y1="' + pad.t + '" x2="' + x(idx) + '" y2="' + (pad.t+plotH) + '" stroke="#f59e0b" stroke-dasharray="4 3"/><text x="' + x(idx) + '" y="' + (pad.t-8) + '" text-anchor="middle" font-size="11" fill="#b45309">Day ' + def.markerDay + '</text>';
        }
        return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="agile-chart-svg" role="img"><text x="' + (W/2) + '" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="#1e293b">' + esc(def.title) + '</text>' + marker +
          '<line x1="' + pad.l + '" y1="' + (pad.t+plotH) + '" x2="' + (W-pad.r) + '" y2="' + (pad.t+plotH) + '" stroke="#94a3b8"/><line x1="' + pad.l + '" y1="' + pad.t + '" x2="' + pad.l + '" y2="' + (pad.t+plotH) + '" stroke="#94a3b8"/>' +
          '<path d="' + linePath(def.scope, x, y) + '" fill="none" stroke="#2563eb" stroke-width="2.5"/>' +
          '<path d="' + linePath(def.completed, x, y) + '" fill="none" stroke="#16a34a" stroke-width="2.5"/>' +
          '<text x="' + (W/2) + '" y="' + (H-8) + '" text-anchor="middle" font-size="11" fill="#64748b">' + esc(def.xLabel||"Day") + '</text>' +
          '<text x="' + (W-pad.r-4) + '" y="' + (pad.t+14) + '" text-anchor="end" font-size="10" fill="#2563eb">— Scope</text>' +
          '<text x="' + (W-pad.r-4) + '" y="' + (pad.t+28) + '" text-anchor="end" font-size="10" fill="#16a34a">— Completed</text></svg>';
      }

      if (def.type === "cfd") {
        const n = def.periods.length, x = i => pad.l + (i / (n - 1)) * plotW;
        const maxY = Math.max(...def.todo.map((t,i)=>t+def.inProgress[i]+def.done[i])) * 1.08;
        const y = v => pad.t + plotH - (v / maxY) * plotH;
        const topDone = def.done, topProg = def.done.map((d,i)=>d+def.inProgress[i]), topTodo = def.done.map((d,i)=>d+def.inProgress[i]+def.todo[i]);
        const area = (top, bottom) => {
          const upper = top.map((v,i)=>(i===0?"M":"L")+x(i).toFixed(1)+","+y(v).toFixed(1)).join(" ");
          const lower = bottom.map((v,i)=>"L"+x(n-1-i).toFixed(1)+","+y(bottom[n-1-i]).toFixed(1)).join(" ");
          return upper + " " + lower + " Z";
        };
        return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="agile-chart-svg" role="img"><text x="' + (W/2) + '" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="#1e293b">' + esc(def.title) + '</text>' +
          '<line x1="' + pad.l + '" y1="' + (pad.t+plotH) + '" x2="' + (W-pad.r) + '" y2="' + (pad.t+plotH) + '" stroke="#94a3b8"/><line x1="' + pad.l + '" y1="' + pad.t + '" x2="' + pad.l + '" y2="' + (pad.t+plotH) + '" stroke="#94a3b8"/>' +
          '<path d="' + area(topTodo, topProg) + '" fill="#dbeafe"/><path d="' + area(topProg, topDone) + '" fill="#fde68a"/><path d="' + area(topDone, def.periods.map(()=>0)) + '" fill="#bbf7d0"/>' +
          '<text x="' + (W/2) + '" y="' + (H-8) + '" text-anchor="middle" font-size="11" fill="#64748b">' + esc(def.xLabel||"Period") + '</text></svg>';
      }
      return "";
    }

    function getAgileChartDef(q) {
      if (q?.id != null && PMP_AGILE_CHARTS[q.id]) return PMP_AGILE_CHARTS[q.id];
      const t = String(q?.text || "").toLowerCase();
      if (/burnup chart for the last 7-day sprint/.test(t)) return PMP_AGILE_CHARTS[285];
      if (/burndown chart is shown below/.test(t) && /15-day sprint/.test(t)) return PMP_AGILE_CHARTS[16];
      if (/how does a spike typically appear/.test(t)) return PMP_AGILE_CHARTS[1373];
      if (/10 iterations/.test(t) && /burndown chart/.test(t)) return PMP_AGILE_CHARTS[625];
      if (/impact of this technology on the iteration burndown/.test(t)) return PMP_AGILE_CHARTS[1036];
      if (/"in progress" band has continued to grow/.test(t)) return PMP_AGILE_CHARTS[456];
      if (/period 7/.test(t) && /cumulative flow/.test(t)) return PMP_AGILE_CHARTS[631];
      if (/backlog growth outpacing delivery/.test(t)) return PMP_AGILE_CHARTS[772];
      return null;
    }

    function renderAgileChart(q) {
      const def = getAgileChartDef(q);
      if (!def) return "";
      const svg = renderAgileChartSvg(def);
      const cap = def.caption ? '<figcaption class="agile-chart-caption">' + escapeHtml(def.caption) + '</figcaption>' : '';
      return '<figure class="agile-chart">' + svg + cap + '</figure>';
    }
${JS_END}`;
}

function stripOld(html) {
  html = html.replace(/\/\* PMP_AGILE_CHARTS_CSS_START \*\/[\s\S]*?\/\* PMP_AGILE_CHARTS_CSS_END \*\//g, "");
  html = html.replace(/\/\* PMP_AGILE_CHARTS_JS_START \*\/[\s\S]*?\/\* PMP_AGILE_CHARTS_JS_END \*\//g, "");
  return html;
}

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skip (missing):", filePath);
    return;
  }
  let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  html = stripOld(html);

  const cssAnchor = "/* PMP_PMBOK8_CSS_END */";
  if (!html.includes(cssAnchor)) throw new Error(`CSS anchor not found in ${filePath}`);
  html = html.replace(cssAnchor, `${cssAnchor}\n${CSS_BLOCK}`);

  const jsAnchor = "    function escapeHtml(s) {";
  if (!html.includes(jsAnchor)) throw new Error(`JS anchor not found in ${filePath}`);
  html = html.replace(jsAnchor, `${buildJsBlock()}\n${jsAnchor}`);

  const oldBody = `      if (!table) {
        return \`<p class="q-text highlightable" data-qid="\${q.id}" data-field="text">\${escapeHtml(q.text)}</p>\`;
      }`;
  const newBody = `      if (!table) {
        const chart = renderAgileChart(q);
        return \`<p class="q-text highlightable" data-qid="\${q.id}" data-field="text">\${escapeHtml(q.text)}</p>\${chart}\`;
      }`;
  if (html.includes(oldBody)) {
    html = html.replace(oldBody, newBody);
  } else if (!html.includes("renderAgileChart(q)")) {
    throw new Error(`renderQuestionBody anchor not found in ${filePath}`);
  }

  fs.writeFileSync(filePath, html);
  console.log("Patched agile charts:", path.basename(filePath));
}

for (const file of FILES) patchFile(file);

// sanity check server-side renderer matches
const sample = renderChartSvg(CHARTS[285]);
if (!sample.includes("Scope") && !sample.includes("2563eb")) {
  console.warn("Chart SVG sanity check: unexpected output for Q285");
}
