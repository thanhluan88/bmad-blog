const fs = require("fs");
const path = require("path");

const FILES = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
];

const MARKER = "parseRequirementsTraceabilityMatrix";

const parserBlock = `    function parseRequirementsTraceabilityMatrix(text) {
      const marker = "Requirements Traceability Matrix";
      const start = text.indexOf(marker);
      if (start < 0) return null;

      const intro = text.slice(0, start).trim();
      const afterMarker = text.slice(start + marker.length).trim();

      const headerRe =
        /ID\\s+Feature\\s+Requirements(?:\\s+Description)?\\s+Source(?:\\s+Assigned)?\\s+Status\\s+Priority/i;
      const headerMatch = afterMarker.match(headerRe);
      if (!headerMatch) return null;

      const headerIdx = afterMarker.search(headerRe);
      const metaBlock = afterMarker.slice(0, headerIdx).trim();
      const bodyStart = headerIdx + headerMatch[0].length;
      const hasAssigned = /Assigned/i.test(headerMatch[0]);

      const promptMatch = afterMarker.match(
        /\\s+((?:What should|Which two actions)[\\s\\S]*)$/i,
      );
      const bodyEnd = promptMatch ? promptMatch.index : afterMarker.length;
      const tableBody = afterMarker.slice(bodyStart, bodyEnd).trim();
      const questionPrompt = promptMatch ? promptMatch[1].trim() : "";

      const projectName =
        metaBlock.match(/Project Name\\s+(.+?)(?=\\s+Project Owner|\\s+Description|\\s+ID\\s+Feature|$)/i)?.[1]?.trim() ||
        "";
      const projectOwner =
        metaBlock.match(/Project Owner\\s+(.+?)(?=\\s+Project Description|\\s+Description|\\s+ID\\s+Feature|$)/i)?.[1]?.trim() ||
        "";
      const projectDescription =
        metaBlock.match(/Project Description\\s+(.+?)(?=\\s+ID\\s+Feature|$)/i)?.[1]?.trim() ||
        metaBlock.match(/Description\\s+(.+?)(?=\\s+ID\\s+Feature|$)/i)?.[1]?.trim() ||
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
        const reqMatch = segment.match(/^([A-E]\\d+)\\s+([\\s\\S]+)/);
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
      const re = /RQ-\\d{3}|[A-E]\\d+(?=\\s)/g;
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
        if (/^RQ-\\d{3}/.test(chunk)) {
          currentFeature = chunk.match(/^RQ-\\d{3}/)[0];
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
        projectName ? \`Project: \${projectName}\` : "",
        projectOwner ? \`Owner: \${projectOwner}\` : "",
        projectDescription ? \`Description: \${projectDescription}\` : "",
      ].filter(Boolean);

      return {
        intro,
        questionPrompt,
        caption: metaBits.length
          ? \`Requirements Traceability Matrix — \${metaBits.join(" · ")}\`
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

`;

const parseEmbeddedOld = `    function parseEmbeddedTable(text) {
      return (
        parseWeightedScoringTable(text) ||
        parseScheduleFragmentTable(text) ||
        parseTaskDurationTable(text) ||
        parseWorkPackageEvTable(text)
      );
    }`;

const parseEmbeddedNew = `    function parseEmbeddedTable(text) {
      return (
        parseRequirementsTraceabilityMatrix(text) ||
        parseWeightedScoringTable(text) ||
        parseScheduleFragmentTable(text) ||
        parseTaskDurationTable(text) ||
        parseWorkPackageEvTable(text)
      );
    }`;

for (const filePath of FILES) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skip (missing):", filePath);
    continue;
  }

  let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  if (html.includes(MARKER)) {
    const fnStart = html.indexOf(`    function ${MARKER}`);
    const fnEnd = html.indexOf("    function parseEmbeddedTable(text)", fnStart);
    if (fnStart < 0 || fnEnd < 0) {
      throw new Error(`Could not replace existing ${MARKER} in ${filePath}`);
    }
    html = html.slice(0, fnStart) + parserBlock.trimEnd() + "\n\n" + html.slice(fnEnd);
    fs.writeFileSync(filePath, html.replace(/\n/g, "\r\n"), "utf8");
    console.log("Updated:", path.basename(filePath));
    continue;
  }

  if (!html.includes(parseEmbeddedOld)) {
    throw new Error(`parseEmbeddedTable block not found in ${filePath}`);
  }

  html = html.replace(
    "    function parseEmbeddedTable(text) {",
    `${parserBlock}    function parseEmbeddedTable(text) {`,
  );
  html = html.replace(parseEmbeddedOld, parseEmbeddedNew);

  fs.writeFileSync(filePath, html.replace(/\n/g, "\r\n"), "utf8");
  console.log("Patched:", path.basename(filePath));
}
