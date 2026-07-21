const fs = require("fs");
const path = require("path");

const files = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
  path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
];

let failed = false;

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const label = path.basename(file);
  const checks = [
    ["user-scoped exam key", html.includes("function getExamStorageKey(")],
    ["user-scoped used key", html.includes("function getUsedStorageKey(")],
    ["exam owner persisted", html.includes("nickname: getActiveUser()")],
    [
      "user loaded before exam restore",
      html.indexOf("const existingUser = loadStoredUser()") <
        html.lastIndexOf("restoreExamState();"),
    ],
    ["countdown updater retained", html.includes("function updateExamTimer()")],
    ["countdown interval retained", html.includes("setInterval(updateExamTimer, 1000)")],
    ["countdown gets a fresh deadline", html.includes("endAt: Date.now() + MOCK_EXAM_SECONDS * 1000")],
    ["countdown starts for active exam", html.includes("startExamTimer();")],
    ["auto-submit retained", html.includes("submitMockExam(true)")],
    ["no direct global exam read", !html.includes("localStorage.getItem(EXAM_KEY)")],
    ["no direct global exam delete", !html.includes("localStorage.removeItem(EXAM_KEY)")],
  ];

  for (const [name, ok] of checks) {
    if (ok) continue;
    failed = true;
    console.error(`FAIL ${label}: ${name}`);
  }

  for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    try {
      new Function(match[1]);
    } catch (error) {
      failed = true;
      console.error(`FAIL ${label}: invalid inline script (${error.message})`);
    }
  }
}

if (failed) process.exit(1);
console.log("PMP mock exam timer and user isolation verified.");
