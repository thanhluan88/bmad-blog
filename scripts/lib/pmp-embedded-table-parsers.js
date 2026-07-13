/**
 * Embedded table parsers for PMP question stems (quiz + teach).
 * Synced to public/pmp/pmp-full-questions.html via scripts/sync-pmp-table-parsers-to-html.js
 */

function isNumericTableCell(cell) {
  return /^[\d,.]+$/.test(String(cell).trim());
}

function parseWeightedScoringTable(text) {
  const marker = "Weighted Scoring Model";
  const start = text.indexOf(marker);
  if (start < 0) return null;

  const section = text.slice(start);
  const questionMatch = section.match(/\s+(What should[\s\S]*)$/i);
  if (!questionMatch) return null;

  const questionPrompt = questionMatch[1].trim();
  const tablePart = section.slice(marker.length, section.length - questionMatch[0].length);
  const headerMatch = tablePart.match(/Criteria\s+Weight\s+((?:Project\s+\d+\s*)+)/i);
  if (!headerMatch) return null;

  const projects = [...headerMatch[1].matchAll(/Project\s+(\d+)/gi)].map(m => `Project ${m[1]}`);
  const numCols = 1 + projects.length;
  const criteriaList = [
    "Supports key business objectives",
    "Uses standard technology",
    "Can be completed within project timeframe",
    "Provides positive NPV",
  ];

  const bodyAfterHeader = tablePart.replace(/Criteria\s+Weight\s+(?:Project\s+\d+\s*)+/i, "").trim();
  const rows = [];
  for (const criterion of criteriaList) {
    const pos = bodyAfterHeader.indexOf(criterion);
    if (pos < 0) continue;
    const after = bodyAfterHeader.slice(pos + criterion.length).trim();
    const numMatch = after.match(/^(\d+(?:\s+\d+){0,10})/);
    if (!numMatch) continue;
    const nums = numMatch[1].trim().split(/\s+/).map(Number);
    if (nums.length !== numCols) continue;
    rows.push([criterion, String(nums[0]), ...nums.slice(1).map(String)]);
  }

  if (rows.length === 0) return null;
  return {
    intro: text.slice(0, start).trim(),
    questionPrompt,
    caption: "Weighted Scoring Model",
    columns: ["Criteria", "Weight", ...projects],
    rows,
  };
}

function parseScheduleFragmentTable(text) {
  const headerRe = /ID\s+Activity\s+Predecessor\(s\)\s+Original\s+Duration\s*\(days\)\s+Original\s+Finish\s+Notes/i;
  const headerMatch = text.match(headerRe);
  if (!headerMatch) return null;

  const intro = text.slice(0, headerMatch.index).trim();
  const body = text.slice(headerMatch.index + headerMatch[0].length).trim();
  const promptMatch =
    body.match(/\s+(A key stakeholder[\s\S]*)$/i) ||
    body.match(/\s+(What should[\s\S]*)$/i) ||
    body.match(/\s+(The project manager[\s\S]*)$/i);
  const tableBody = promptMatch
    ? body.slice(0, body.length - promptMatch[0].length).trim()
    : body;
  const questionPrompt = promptMatch ? promptMatch[1].trim() : "";

  const rowRe = /([A-Z])\s+(.+?)\s+([\u2212\-]|(?:[A-Z](?:,\s*[A-Z])*))\s+(\d+)\s+(Day\s+\d+)\s+(.+?)(?=\s+[A-Z]\s+[A-Za-z]|$)/g;
  const rows = [];
  let match;
  while ((match = rowRe.exec(tableBody)) !== null) {
    rows.push([
      match[1],
      match[2].trim(),
      match[3].trim(),
      match[4],
      match[5].trim(),
      match[6].trim(),
    ]);
  }

  if (rows.length === 0) return null;
  return {
    intro,
    questionPrompt,
    caption: "Schedule fragment",
    columns: [
      "ID",
      "Activity",
      "Predecessor(s)",
      "Duration (days)",
      "Original Finish",
      "Notes",
    ],
    rows,
  };
}

function parseTaskDurationTable(text) {
  const headerRe = /Task\s+Duration\s+Start\s+Predecessor\(s\)/i;
  const headerMatch = text.match(headerRe);
  if (!headerMatch) return null;

  const intro = text.slice(0, headerMatch.index).trim();
  const body = text.slice(headerMatch.index + headerMatch[0].length).trim();
  const promptMatch = body.match(/\s+(What[\s\S]*)$/i);
  const tableBody = promptMatch
    ? body.slice(0, body.length - promptMatch[0].length).trim()
    : body;
  const questionPrompt = promptMatch ? promptMatch[1].trim() : "";

  const rowRe = /([A-Z])\s+(\d+\s+days)\s+(.+?)(?=\s+[A-Z]\s+\d+\s+days|\s+What\s+is|$)/g;
  const rows = [];
  let match;
  while ((match = rowRe.exec(tableBody)) !== null) {
    const rest = match[3].trim();
    if (rest.startsWith("Project start")) {
      rows.push([
        match[1],
        match[2],
        "Project start",
        rest.includes("None") ? "None" : "—",
      ]);
    } else {
      rows.push([match[1], match[2], rest, "—"]);
    }
  }

  if (rows.length === 0) return null;
  return {
    intro,
    questionPrompt,
    caption: "Activities and durations",
    columns: ["Task", "Duration", "Start", "Predecessor(s)"],
    rows,
  };
}

function parseWorkPackageEvTable(text) {
  const headerRe =
    /Work Package\s+Planned Value\s*\(PV\)\s+Earned Value\s*\(E[V P][V ]?\)(?:\s+Actual Cost\s*\(AC\))?/i;
  const headerMatch = text.match(headerRe);
  if (!headerMatch) return null;

  const intro = text.slice(0, headerMatch.index).trim();
  const body = text.slice(headerMatch.index + headerMatch[0].length).trim();
  const promptMatch =
    body.match(/\s+(Based on[\s\S]*)$/i) ||
    body.match(/\s+(What[\s\S]*)$/i);
  const tableBody = promptMatch
    ? body.slice(0, body.length - promptMatch[0].length).trim()
    : body;
  const questionPrompt = promptMatch ? promptMatch[1].trim() : "";

  const hasAc = /Actual Cost\s*\(AC\)/i.test(headerMatch[0]);
  const rowRe = hasAc
    ? /([A-Za-z][A-Za-z\s]*?)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)/g
    : /([A-Za-z][A-Za-z\s]*?)\s+([\d,]+)\s+([\d,]+)/g;
  const rows = [];
  let match;
  while ((match = rowRe.exec(tableBody)) !== null) {
    const name = match[1].trim();
    if (/work package|planned value|earned value|actual cost/i.test(name)) continue;
    rows.push(
      hasAc
        ? [name, match[2], match[3], match[4]]
        : [name, match[2], match[3]],
    );
  }

  if (rows.length === 0) return null;
  return {
    intro,
    questionPrompt,
    caption: "Work package performance (USD)",
    columns: hasAc
      ? [
          "Work Package",
          "Planned Value (PV)",
          "Earned Value (EV)",
          "Actual Cost (AC)",
        ]
      : ["Work Package", "Planned Value (PV)", "Earned Value (EV)"],
    rows,
  };
}

function parseWorkUnitPerformanceTable(text) {
  const headerRe =
    /Work Unit\s+Completion Date\s+Budget Per Unit\s+Work Performance\s+Actual Cost/i;
  const headerMatch = text.match(headerRe);
  if (!headerMatch) return null;

  const intro = text.slice(0, headerMatch.index).trim();
  const body = text.slice(headerMatch.index + headerMatch[0].length).trim();
  const promptMatch =
    body.match(/\s+(Based on[\s\S]*)$/i) ||
    body.match(/\s+(What should[\s\S]*)$/i) ||
    body.match(/\s+(What[\s\S]*)$/i);
  const tableBody = promptMatch
    ? body.slice(0, body.length - promptMatch[0].length).trim()
    : body;
  const questionPrompt = promptMatch ? promptMatch[1].trim() : "";

  const rowRe =
    /([A-Z])\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+(\$?[\d,]+)\s+(\$?[\d,]+)\s+(\$?[\d,]+)/g;
  const rows = [];
  let match;
  while ((match = rowRe.exec(tableBody)) !== null) {
    rows.push([match[1], match[2], match[3], match[4], match[5]]);
  }

  if (rows.length < 2) return null;
  return {
    intro,
    questionPrompt,
    caption: "Work unit schedule and cost performance (USD)",
    columns: [
      "Work Unit",
      "Completion Date",
      "Budget Per Unit (PV)",
      "Work Performance (EV)",
      "Actual Cost (AC)",
    ],
    rows,
  };
}

function parseProbabilityImpactMatrix(text) {
  const headerRe = /ID\s+Risk\s+Probability\s+Impact/i;
  const headerMatch = text.match(headerRe);
  if (!headerMatch) return null;

  const intro = text.slice(0, headerMatch.index).trim();
  const body = text.slice(headerMatch.index + headerMatch[0].length).trim();
  const promptMatch =
    body.match(/\s+(An organization[\s\S]*)$/i) ||
    body.match(/\s+(Based on[\s\S]*)$/i) ||
    body.match(/\s+(What should[\s\S]*)$/i);
  const tableBody = promptMatch
    ? body.slice(0, body.length - promptMatch[0].length).trim()
    : body;
  const questionPrompt = promptMatch ? promptMatch[1].trim() : "";

  const rowRe = /(R\d+)\s+(.+?)\s+(\d+)\s+(\d+)(?=\s+R\d+\s+|$)/g;
  const rows = [];
  let match;
  while ((match = rowRe.exec(tableBody)) !== null) {
    rows.push([match[1], match[2].trim(), match[3], match[4]]);
  }

  if (rows.length < 2) return null;
  return {
    intro,
    questionPrompt,
    caption: "Probability and impact matrix",
    columns: ["ID", "Risk", "Probability", "Impact"],
    rows,
  };
}

function parseRequirementsTraceabilityMatrix(text) {
  const marker = "Requirements Traceability Matrix";
  const start = text.indexOf(marker);
  if (start < 0) return null;

  const intro = text.slice(0, start).trim();
  const afterMarker = text.slice(start + marker.length).trim();

  const headerRe =
    /ID\s+Feature\s+Requirements(?:\s+Description)?\s+Source(?:\s+Assigned)?\s+Status\s+Priority/i;
  const headerMatch = afterMarker.match(headerRe);
  if (!headerMatch) return null;

  const headerIdx = afterMarker.search(headerRe);
  const metaBlock = afterMarker.slice(0, headerIdx).trim();
  const bodyStart = headerIdx + headerMatch[0].length;
  const hasAssigned = /Assigned/i.test(headerMatch[0]);

  const promptMatch = afterMarker.match(
    /\s+((?:What should|Which two actions)[\s\S]*)$/i,
  );
  const bodyEnd = promptMatch ? promptMatch.index : afterMarker.length;
  const tableBody = afterMarker.slice(bodyStart, bodyEnd).trim();
  const questionPrompt = promptMatch ? promptMatch[1].trim() : "";

  const projectName =
    metaBlock.match(/Project Name\s+(.+?)(?=\s+Project Owner|\s+Description|\s+ID\s+Feature|$)/i)?.[1]?.trim() ||
    "";
  const projectOwner =
    metaBlock.match(/Project Owner\s+(.+?)(?=\s+Project Description|\s+Description|\s+ID\s+Feature|$)/i)?.[1]?.trim() ||
    "";
  const projectDescription =
    metaBlock.match(/Project Description\s+(.+?)(?=\s+ID\s+Feature|$)/i)?.[1]?.trim() ||
    metaBlock.match(/Description\s+(.+?)(?=\s+ID\s+Feature|$)/i)?.[1]?.trim() ||
    "";

  const PRIORITIES = ["Highest", "High", "Medium", "Low"];
  const STATUSES = [
    "In progress",
    "In Progress",
    "Not started",
    "Not Started",
    "Completed",
  ];

  function peelTailFields(rest) {
    let priority = "";
    for (const p of PRIORITIES) {
      if (rest.endsWith(p)) {
        priority = p;
        rest = rest.slice(0, -p.length).trim();
        break;
      }
    }
    let status = "";
    for (const s of STATUSES) {
      if (rest.endsWith(s)) {
        status = s;
        rest = rest.slice(0, -s.length).trim();
        break;
      }
    }
    return { rest, status, priority };
  }

  const ASSIGNED_ROLES = [
    "Quality Assurance (QA) Team",
    "Business Analyst",
    "Security Lead",
    "Team Lead",
    "Developer",
    "QA Lead",
    "Engineer",
    "Designers",
    "DevOps",
    "PMO",
  ];
  const SOURCE_VALUES = [
    "CEO / Stakeholders",
    "Development Team",
    "Quality Assurance (QA) Team",
    "Project Manager",
    "Engineers",
    "Security",
    "IT Dept.",
    "User",
  ];

  function peelFromList(rest, values) {
    const sorted = [...values].sort((a, b) => b.length - a.length);
    for (const value of sorted) {
      if (rest.endsWith(value)) {
        return {
          rest: rest.slice(0, -value.length).trim(),
          value,
        };
      }
    }
    return { rest, value: "" };
  }

  function parseRowSegment(segment, featureId) {
    const reqMatch = segment.match(/^([A-E]\d+)\s+([\s\S]+)/);
    if (!reqMatch) return null;
    const reqId = reqMatch[1];
    const { rest, status, priority } = peelTailFields(reqMatch[2].trim());

    if (hasAssigned) {
      const assignedPeel = peelFromList(rest, ASSIGNED_ROLES);
      const sourcePeel = peelFromList(assignedPeel.rest, SOURCE_VALUES);
      return [
        featureId,
        reqId,
        sourcePeel.rest,
        "",
        sourcePeel.value,
        assignedPeel.value,
        status,
        priority,
      ];
    }

    const sourcePeel = peelFromList(rest, SOURCE_VALUES);
    return [
      featureId,
      reqId,
      sourcePeel.rest,
      "",
      sourcePeel.value,
      status,
      priority,
    ];
  }

  const tokens = [];
  const re = /RQ-\d{3}|[A-E]\d+(?=\s)/g;
  let match;
  while ((match = re.exec(tableBody)) !== null) {
    tokens.push({ index: match.index, token: match[0] });
  }
  if (!tokens.length) return null;

  const rows = [];
  let currentFeature = "";
  for (let i = 0; i < tokens.length; i++) {
    const start = tokens[i].index;
    const end = i + 1 < tokens.length ? tokens[i + 1].index : tableBody.length;
    const chunk = tableBody.slice(start, end).trim();
    if (/^RQ-\d{3}/.test(chunk)) {
      currentFeature = chunk.match(/^RQ-\d{3}/)[0];
      const remainder = chunk.slice(currentFeature.length).trim();
      if (!remainder) continue;
      const row = parseRowSegment(remainder, currentFeature);
      if (row) rows.push(row);
      continue;
    }
    const row = parseRowSegment(chunk, currentFeature);
    if (row) rows.push(row);
  }

  if (!rows.length) return null;

  const metaBits = [
    projectName ? `Project: ${projectName}` : "",
    projectOwner ? `Owner: ${projectOwner}` : "",
    projectDescription ? `Description: ${projectDescription}` : "",
  ].filter(Boolean);

  return {
    intro,
    questionPrompt,
    caption: metaBits.length
      ? `Requirements Traceability Matrix — ${metaBits.join(" · ")}`
      : "Requirements Traceability Matrix",
    columns: hasAssigned
      ? [
          "ID",
          "Feature",
          "Requirements",
          "Description",
          "Source",
          "Assigned",
          "Status",
          "Priority",
        ]
      : [
          "ID",
          "Feature",
          "Requirements",
          "Description",
          "Source",
          "Status",
          "Priority",
        ],
    rows,
  };
}

function parseUserStoryFeatureTable(text) {
  const headerRe = /Feature\s+User\s+Story\s+Estimated\s+Story\s+Points/i;
  const headerMatch = text.match(headerRe);
  if (!headerMatch) return null;

  const intro = text.slice(0, headerMatch.index).trim();
  const tableBody = text.slice(headerMatch.index + headerMatch[0].length).trim();

  const storyRe = /(As the .+?\.)\s+(\d+)/g;
  const rows = [];
  let match;
  let prevEnd = 0;
  while ((match = storyRe.exec(tableBody)) !== null) {
    const feature = tableBody.slice(prevEnd, match.index).trim();
    if (!feature) continue;
    rows.push([feature, match[1].trim(), match[2]]);
    prevEnd = match.index + match[0].length;
  }

  if (rows.length === 0) return null;
  return {
    intro,
    questionPrompt: "",
    caption: "User stories and estimated story points",
    columns: ["Feature", "User Story", "Estimated Story Points"],
    rows,
  };
}

function parseThreePointEstimateTable(text) {
  const headerRe =
    /Activity\s+Optimistic\s*\(days\)\s+Most\s+Likely\s*\(days\)\s+Pessimistic\s*\(days\)/i;
  const headerMatch = String(text || "").match(headerRe);
  if (!headerMatch) return null;

  const intro = text.slice(0, headerMatch.index).trim();
  const body = text.slice(headerMatch.index + headerMatch[0].length).trim();
  const promptMatch = body.match(/\s+(What should[\s\S]*)$/i);
  const tableBody = promptMatch
    ? body.slice(0, body.length - promptMatch[0].length).trim()
    : body;
  const questionPrompt = promptMatch ? promptMatch[1].trim() : "";

  const rowRe = /\b([A-Z])\s+(\d+)\s+(\d+)\s+(\d+)/g;
  const rows = [];
  let match;
  while ((match = rowRe.exec(tableBody)) !== null) {
    rows.push([match[1], match[2], match[3], match[4]]);
  }

  if (rows.length === 0) return null;
  return {
    intro,
    questionPrompt,
    caption: "Three-point activity estimates (days)",
    columns: ["Activity", "Optimistic (days)", "Most Likely (days)", "Pessimistic (days)"],
    rows,
  };
}

function parseFeatureColumnMatrixTable(text) {
  if (/Feature\s+User\s+Story/i.test(text)) return null;

  const tableStart = text.search(/(?:End of Sprint \d+ Status\s+)?Feature\s+(?:[A-E]\s+){2,}/i);
  if (tableStart < 0) return null;

  let offset = tableStart;
  const statusMatch = text.slice(offset).match(/^End of Sprint \d+ Status\s+/i);
  const statusPrefix = statusMatch ? statusMatch[0].trim() : "";
  if (statusMatch) offset += statusMatch[0].length;

  const columnMatch = text.slice(offset).match(/^Feature\s+((?:[A-E]\s+)+)/i);
  if (!columnMatch) return null;

  const columns = columnMatch[1].trim().split(/\s+/);
  if (columns.length < 2) return null;

  const afterColumns = text.slice(offset + columnMatch[0].length);
  const promptMatch = afterColumns.match(/\s+(What[\s\S]*)$/i);
  const tableBody = promptMatch
    ? afterColumns.slice(0, afterColumns.length - promptMatch[0].length).trim()
    : afterColumns.trim();
  const questionPrompt = promptMatch ? promptMatch[1].trim() : "";
  const intro = text.slice(0, tableStart).trim();

  const metricLabels = ["Backlog", "Story Points"];
  const rows = [];
  for (const label of metricLabels) {
    const pos = tableBody.indexOf(label);
    if (pos < 0) continue;
    const after = tableBody.slice(pos + label.length).trim();
    const numMatch = after.match(/^(\d+(?:\s+\d+)*)/);
    if (!numMatch) continue;
    const nums = numMatch[1].trim().split(/\s+/);
    if (nums.length !== columns.length) continue;
    rows.push([label, ...nums]);
  }

  if (rows.length === 0) return null;
  return {
    intro,
    questionPrompt,
    caption: statusPrefix || "Feature story points by column",
    columns: ["Metric", ...columns],
    rows,
  };
}

function parseEmbeddedTable(text) {
  return (
    parseWorkUnitPerformanceTable(text) ||
    parseProbabilityImpactMatrix(text) ||
    parseRequirementsTraceabilityMatrix(text) ||
    parseUserStoryFeatureTable(text) ||
    parseFeatureColumnMatrixTable(text) ||
    parseThreePointEstimateTable(text) ||
    parseWeightedScoringTable(text) ||
    parseScheduleFragmentTable(text) ||
    parseTaskDurationTable(text) ||
    parseWorkPackageEvTable(text)
  );
}

function parseEmbeddedTableForStem(text) {
  return parseEmbeddedTable(text);
}

function renderStemTableHtml(table, escapeHtmlFn) {
  const esc =
    escapeHtmlFn ||
    ((s) =>
      String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;"));
  const header = table.columns.map((col) => `<th>${esc(col)}</th>`).join("");
  const bodyRows = table.rows
    .map(
      (row) =>
        `<tr>${row
          .map((cell, colIndex) => {
            const numClass =
              colIndex > 0 && isNumericTableCell(cell) ? ' class="num"' : "";
            return `<td${numClass}>${esc(cell)}</td>`;
          })
          .join("")}</tr>`,
    )
    .join("");
  return `<div class="score-table-wrap">
          <table class="score-table">
            <caption>${esc(table.caption)}</caption>
            <thead><tr>${header}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </div>`;
}

module.exports = {
  isNumericTableCell,
  parseEmbeddedTable,
  parseEmbeddedTableForStem,
  renderStemTableHtml,
};
