/** PMBOK Guide 8th Edition — curated reference for PMP exam explanation generation. */

const PMI_PMBOK8 = "https://www.pmi.org/standards/pmbok";

const DOMAIN_REFS = {
  Governance: "https://projectmanagement.com.br/issue-log/",
  Scope: "https://pmstudycircle.com/pmbok-guide-8th-edition/",
  Schedule: "https://pmstudycircle.com/pmbok-guide-8th-edition/",
  Finance: "https://pmstudycircle.com/pmbok-guide-8th-edition/",
  Stakeholders: "https://pmstudycircle.com/pmbok-guide-8th-edition/",
  Resources: "https://pmstudycircle.com/pmbok-guide-8th-edition/",
  Risk: "https://projectmanagement.com.br/risk-register/",
};

const DOMAIN_KEYWORDS = {
  Governance: [
    "governance", "issue log", "issue", "compliance", "policy", "change control",
    "change request", "approval", "contract", "procurement", "audit", "charter",
    "lessons learned", "closing", "handover", "legal", "regulation",
  ],
  Scope: [
    "scope", "requirement", "wbs", "deliverable", "acceptance", "baseline",
    "feature", "product backlog", "mvp", "definition of done", "quality",
    "specification", "exclusion", "inclusion",
  ],
  Schedule: [
    "schedule", "timeline", "critical path", "milestone", "delay", "duration",
    "dependency", "gantt", "lead time", "deadline", "late", "overrun", "float",
    "crashing", "fast track",
  ],
  Finance: [
    "budget", "cost", "finance", "roi", "investment", "expense", "contingency",
    "reserve", "earned value", "evm", "cpi", "spi", "actual cost", "estimate",
    "funding", "profit", "revenue",
  ],
  Stakeholders: [
    "stakeholder", "customer", "sponsor", "communication", "expectation",
    "engagement", "feedback", "review", "presentation", "report", "notify",
    "inform", "collaborate", "consensus", "conflict", "negotiat",
  ],
  Resources: [
    "resource", "team member", "training", "skill", "competenc", "hire",
    "onboard", "motivat", "performance", "coaching", "mentor", "virtual team",
    "collaboration tool", "team building", "empower", "servant",
  ],
  Risk: [
    "risk", "threat", "opportunit", "uncertain", "mitigat", "contingenc",
    "risk register", "response plan", "materializ", "issue from risk",
    "probability", "impact", "escalat",
  ],
};

const AGILE_KEYWORDS = [
  "agile", "scrum", "sprint", "iteration", "backlog", "standup", "daily",
  "retrospective", "review", "product owner", "scrum master", "kanban",
  "story point", "velocity", "increment", "servant leader", "impediment",
];

const FOCUS_AREA_RULES = [
  { area: "Closing", keywords: ["closing", "handover", "final deliver", "project end", "lessons learned", "archive"] },
  { area: "Initiating", keywords: ["charter", "initiat", "business case", "feasibility", "new project", "kickoff", "starting"] },
  { area: "Planning", keywords: ["planning phase", "during planning", "plan for", "create a plan", "develop the plan", "define how"] },
  { area: "Monitoring & Controlling", keywords: ["monitor", "control", "track", "variance", "performance report", "status report", "materializ", "overrun", "deviat"] },
  { area: "Executing", keywords: ["implement", "deliver", "execute", "perform", "carry out", "complete the task", "during execution"] },
];

const PROCESS_BY_DOMAIN = {
  Governance: ["Manage Project Execution", "Perform Integrated Change Control", "Close Project or Phase"],
  Scope: ["Define Scope", "Validate Scope", "Control Scope"],
  Schedule: ["Develop Schedule", "Control Schedule"],
  Finance: ["Estimate Costs", "Determine Budget", "Control Costs"],
  Stakeholders: ["Identify Stakeholders", "Plan Stakeholder Engagement", "Manage Stakeholder Engagement"],
  Resources: ["Plan Resources", "Acquire Resources", "Develop Team", "Manage Team"],
  Risk: ["Identify Risks", "Perform Risk Analysis", "Plan Risk Responses", "Monitor Risks"],
};

const PRINCIPLE_KEYWORDS = {
  "Adopt a holistic view": ["holistic", "integrated", "across domains", "big picture", "system"],
  "Focus on value": ["value", "benefit", "roi", "priorit", "mvp", "business value"],
  "Embed quality": ["quality", "defect", "standard", "acceptance criteria", "testing"],
  "Lead accountably": ["accountab", "responsible", "apolog", "mistake", "transparen", "honest"],
  "Integrate sustainability": ["sustainab", "environment", "social impact", "long-term"],
  "Build an empowered culture": ["empower", "self-organiz", "consensus", "facilitat", "team decision", "servant"],
};

/** Common PMP exam distractor patterns → rejection reason (Vietnamese). */
const WRONG_OPTION_PATTERNS = [
  {
    re: /\bignore\b|\bassume\b|without (?:any )?action|do nothing|disregard/i,
    reason:
      "PMI kỳ vọng PM chủ động và có trách nhiệm (Lead accountably), không bỏ qua vấn đề hay giả định mọi người tự hiểu.",
  },
  {
    re: /delete (?:the )?(?:message|email)|without reading|recall the email/i,
    reason:
      "Che giấu lỗi hoặc yêu cầu xóa thông tin không minh bạch; PMBOK 8 nhấn mạnh Lead accountably và quản trị stakeholder.",
  },
  {
    re: /exclude|remove (?:the )?(?:task|feature|requirement)|reduce scope|cut scope/i,
    reason:
      "Thay đổi phạm vi cần quy trình change control và thống nhất stakeholder — không phải phản ứng mặc định khi gặp trở ngại.",
  },
  {
    re: /lessons learned|document|update (?:the )?(?:log|register|report)/i,
    reason:
      "Ghi nhận lessons learned / cập nhật log là quan trọng nhưng thường là bước sau khi đã xử lý tình huống — không phải hành động ưu tiên khi câu hỏi hỏi FIRST/NEXT.",
    priorityOnly: true,
  },
  {
    re: /revise (?:the )?(?:plan|schedule|baseline)|move the task|change the schedule/i,
    reason:
      "Sửa kế hoạch có thể cần thiết nhưng PM nên tham chiếu artifact hiện có (risk register, change control, baseline) trước khi tự ý điều chỉnh.",
    priorityOnly: true,
  },
  {
    re: /direct(?:ed|ing)? (?:the )?team|tell (?:the )?team|order|command|mandate/i,
    reason:
      "Trong môi trường Agile/Hybrid, PMBOK 8 khuyến khích Build an empowered culture — PM định hướng và loại bỏ impediment, không micromanage giải pháp.",
    agileContext: true,
  },
  {
    re: /escalat/i,
    reason:
      "Leo thang quá sớm khi PM chưa thử các biện pháp trong phạm vi quyền hạn; chỉ escalate khi vượt quyền hoặc cần quyết định cấp trên.",
  },
  {
    re: /majority vote|voting|vote/i,
    reason:
      "Consensus building ưu tiên thống nhất qua thảo luận, không phải đa số phiếu — đặc biệt với team đa dạng cần sự đồng thuận thực sự.",
  },
  {
    re: /reduce (?:the )?number of (?:approver|change request)|fixed number of change/i,
    reason:
      "Giảm kiểm soát thay đổi bằng cách hạn chế approver hoặc quota change request vi phạm governance — nên giảm uncertainty qua iteration/incremental delivery.",
  },
  {
    re: /daily (?:standup|meeting).*customer|include (?:the )?customer in daily/i,
    reason:
      "Mời customer tham gia daily standup không phải cách tiêu chuẩn để review deliverable; nên plan review phù hợp (iteration review/demo).",
  },
  {
    re: /all requirements at the start|clarify all requirements/i,
    reason:
      "Agile ưu tiên progressive elaboration và feedback liên tục, không yêu cầu làm rõ toàn bộ requirements ngay đầu iteration.",
    agileContext: true,
  },
  {
    re: /sponsor approval for all change/i,
    reason:
      "Yêu cầu sponsor duyệt mọi change request làm chậm delivery; governance cân bằng kiểm soát và tốc độ thích hợp với phương pháp.",
  },
];

const SCENARIO_RULES = [
  {
    id: "risk_materialized",
    match: (q) =>
      /risk/i.test(q.text) &&
      (/materializ|occurred|happened|emergency|leave|unavailable|not be available/i.test(q.text) ||
        /risk register|planned risk response/i.test(
          q.options.find((o) => o.key === q.correct.split(",")[0])?.text || "",
        )),
    whyCorrect:
      "Rủi ro đã được identify và lập response plan trong risk register. Theo miền Risk (PMBOK 8), khi rủi ro materialize, PM phải triển khai planned response đã chuẩn bị — đây là hành động có hệ thống, không phải phản ứng ngẫu nhiên.",
    domains: ["Risk", "Resources"],
    focusArea: "Monitoring & Controlling",
    processes: ["Monitor Risks", "Implement Risk Responses"],
    principles: ["Lead accountably", "Focus on value"],
  },
  {
    id: "agile_impediment",
    match: (q) =>
      AGILE_KEYWORDS.some((k) => q.text.toLowerCase().includes(k)) &&
      /impediment|delay|blocker|concern/i.test(q.text),
    whyCorrect:
      "Trong Agile, servant leader trao quyền cho team tự cải thiện quy trình và loại bỏ impediment. PMBOK 8 — Build an empowered culture — PM tạo điều kiện để team tự giải quyết, không chỉ đạo giải pháp cụ thể.",
    domains: ["Resources", "Stakeholders"],
    focusArea: "Executing",
    processes: ["Develop Team", "Manage Team"],
    principles: ["Build an empowered culture"],
  },
  {
    id: "stakeholder_review",
    match: (q) =>
      /review|feedback|customer|stakeholder/i.test(q.text) &&
      /iteration|sprint|deliverable/i.test(q.text),
    whyCorrect:
      "Stakeholder engagement (miền Stakeholders) yêu cầu plan cách review và nhận feedback phù hợp. PM chủ động định nghĩa review approach thay vì để customer tự hiểu hoặc tham gia sai ceremony.",
    domains: ["Stakeholders", "Scope"],
    focusArea: "Executing",
    processes: ["Manage Stakeholder Engagement", "Validate Scope"],
    principles: ["Focus on value"],
  },
  {
    id: "consensus",
    match: (q) => /consensus/i.test(q.text),
    whyCorrect:
      "Consensus building đạt thống nhất qua thảo luận và lắng nghe — phù hợp team đa dạng. PMBOK 8 (Build an empowered culture) ưu tiên tham gia có ý nghĩa hơn bỏ phiếu đa số.",
    domains: ["Stakeholders", "Resources"],
    focusArea: "Executing",
    processes: ["Develop Team", "Manage Stakeholder Engagement"],
    principles: ["Build an empowered culture"],
  },
  {
    id: "agile_stakeholder_education",
    match: (q) =>
      AGILE_KEYWORDS.some((k) => q.text.toLowerCase().includes(k)) &&
      /predictive|traditional|director|executive|sponsor|background/i.test(q.text) &&
      /misunderstand|concern|question|report/i.test(q.text),
    whyCorrect:
      "Khi stakeholder chưa quen Agile, PM cần giáo dục và đồng thuận giải pháp phù hợp (transparency + collaboration). Miền Stakeholders — quản lý kỳ vọng và alignment.",
    domains: ["Stakeholders", "Governance"],
    focusArea: "Executing",
    processes: ["Manage Stakeholder Engagement"],
    principles: ["Lead accountably", "Adopt a holistic view"],
  },
  {
    id: "change_uncertainty",
    match: (q) =>
      /change request|uncertainty|innovation/i.test(q.text) &&
      /approver|change/i.test(q.text),
    whyCorrect:
      "Với dự án uncertainty cao, giảm change request bằng iteration/incremental delivery (Focus on value) hiệu quả hơn siết governance cứng. PMBOK 8 hỗ trợ adaptive approach.",
    domains: ["Scope", "Governance"],
    focusArea: "Executing",
    processes: ["Manage Project Execution", "Control Scope"],
    principles: ["Focus on value", "Adopt a holistic view"],
  },
  {
    id: "vision_communication",
    match: (q) =>
      /vision|sprint goal|product owner.*expectation|retrospective/i.test(q.text),
    whyCorrect:
      "PM/leader phải communicate project vision và sprint goals rõ ràng để team alignment. Miền Stakeholders + Resources — shared understanding là nền tảng delivery hiệu quả.",
    domains: ["Stakeholders", "Resources"],
    focusArea: "Executing",
    processes: ["Manage Stakeholder Engagement", "Develop Team"],
    principles: ["Focus on value"],
  },
];

module.exports = {
  PMI_PMBOK8,
  DOMAIN_REFS,
  DOMAIN_KEYWORDS,
  AGILE_KEYWORDS,
  FOCUS_AREA_RULES,
  PROCESS_BY_DOMAIN,
  PRINCIPLE_KEYWORDS,
  WRONG_OPTION_PATTERNS,
  SCENARIO_RULES,
};
