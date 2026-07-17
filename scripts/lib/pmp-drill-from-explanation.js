/**
 * Build lecture-style mini-drills from pmp-full-pmbok8-explanations.json.
 *
 * Output shape matches pmp-exam-prep-lecture.html:
 *   Câu N: <tình huống>. PM làm gì first?
 *   X. <đáp án đúng> ✓
 *   <sai> — <vì sao>
 */
const fs = require("fs");
const path = require("path");

const DEFAULT_PATH = path.join(
  __dirname,
  "..",
  "..",
  "data",
  "pmp-full-pmbok8-explanations.json",
);

let cache = null;
let cachePath = null;

function loadExplanations(filePath = DEFAULT_PATH) {
  if (cache && cachePath === filePath) return cache;
  if (!fs.existsSync(filePath)) {
    throw new Error(`Explanations not found: ${filePath}`);
  }
  cache = JSON.parse(fs.readFileSync(filePath, "utf8"));
  cachePath = filePath;
  return cache;
}

function trimClause(text, max = 110) {
  let s = String(text || "")
    .replace(/\s+/g, " ")
    .replace(/[…]+$/g, "")
    .trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

function parseAsk(plainBlock) {
  const m = plainBlock.match(
    /\*\*Lưu ý đề bài:\*\*[^\n]*\*\*(FIRST|NEXT|BEST)\*\*/i,
  );
  if (!m) return "làm gì";
  const kind = m[1].toUpperCase();
  if (kind === "FIRST") return "làm gì first";
  if (kind === "NEXT") return "làm gì next";
  if (kind === "BEST") return "làm gì best";
  return "làm gì";
}

/**
 * @returns {{ id: number|string, tinhHuong: string, ask: string, correctLetter: string, correctText: string, wrongs: { letter: string, text: string }[] } | null}
 */
function getDrill(id, filePath = DEFAULT_PATH) {
  const map = loadExplanations(filePath);
  const entry = map[String(id)] || map[id];
  const raw = entry?.explanation || "";
  if (!raw) return null;

  const tinhM = raw.match(/\*\*Tình huống:\*\*\s*([^\n]+)/i);
  const ansM = raw.match(
    /\*\*Đáp án đúng\s*\(([A-F](?:\s*,\s*[A-F])*)\):\*\*\s*([^\n]+)/i,
  );
  if (!tinhM || !ansM) return null;

  const plainStart = raw.indexOf("**Giải thích dễ hiểu**");
  const excludeStart = raw.indexOf("**Loại trừ phương án khác:**");
  const plainBlock =
    plainStart >= 0
      ? raw.slice(plainStart, excludeStart >= 0 ? excludeStart : undefined)
      : raw;

  const wrongs = [];
  if (excludeStart >= 0) {
    const afterExclude = raw.slice(excludeStart);
    const nextHeading = afterExclude.search(/\n\*\*(?!Loại trừ)[^*\n]+\*\*/);
    const excludeBlock =
      nextHeading >= 0 ? afterExclude.slice(0, nextHeading) : afterExclude;
    const re = /-\s*\*\*([A-F]):\*\*\s*([^\n]+)/gi;
    let m;
    while ((m = re.exec(excludeBlock)) !== null) {
      const letter = m[1].toUpperCase();
      const body = m[2]
        .replace(/\s+/g, " ")
        .replace(/[…]+$/g, "")
        .trim();
      if (!body) continue;
      wrongs.push({
        letter,
        text: trimClause(body, 130),
      });
    }
  }

  return {
    id,
    tinhHuong: tinhM[1].replace(/\s+/g, " ").replace(/\.$/, "").trim(),
    ask: parseAsk(plainBlock),
    correctLetter: ansM[1].replace(/\s+/g, "").toUpperCase(),
    correctText: trimClause(ansM[2], 100),
    wrongs,
  };
}

function resetDrillCache() {
  cache = null;
  cachePath = null;
}

module.exports = {
  DEFAULT_PATH,
  loadExplanations,
  getDrill,
  resetDrillCache,
  trimClause,
};
