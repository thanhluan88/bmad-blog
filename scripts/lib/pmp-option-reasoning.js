/** Comparative reasoning: classify PM actions and explain wrong options vs correct answer. */

const ACTION_TYPES = [
  { id: "apologize_accountable", label: "thừa nhận lỗi và giải trình minh bạch", re: /apolog|acknowledge the mistake|take responsibility|admit|transparen/i },
  { id: "listen_support", label: "lắng nghe và hỗ trợ cá nhân", re: /actively listen|listen to the|understand.*concern|support (?:their|the) needs|empath|one-on-one|1-on-1/i },
  { id: "facilitate_retro", label: "facilitate retrospective / phân tích root cause", re: /retrospective|root cause|continuous improvement|process improvement|start.?stop.?continue/i },
  { id: "consult_artifact", label: "tham chiếu artifact / kế hoạch đã có", re: /consult.*(?:register|plan|log)|review the (?:risk|issue|change|project management plan|charter|backlog)|refer to the|check the (?:risk|issue|plan|register)|risk register for|issue log|change log|project charter|business case/i },
  { id: "risk_register", label: "ghi nhận / cập nhật risk register", re: /(?:enter|log|record|update).*(?:risk register|risk log)|risk register|risk log/i },
  { id: "issue_log", label: "ghi nhận issue / theo dõi vấn đề", re: /issue log|log the issue|enter.*issue|track the issue/i },
  { id: "change_control", label: "change control / change request", re: /change request|change control|submit.*change|integrated change|formal change/i },
  { id: "stakeholder_engagement", label: "engagement stakeholder / làm rõ kỳ vọng", re: /stakeholder|customer|sponsor|clarify.*expect|negotiat|manage expectations|product owner/i },
  { id: "meet_discuss", label: "họp / thảo luận trực tiếp", re: /meet with|talk to|speak with|discuss with|discuss the|set up a meeting|schedule a meeting|facilitate a (?:meeting|session|workshop)/i },
  { id: "communicate_inform", label: "thông báo / truyền đạt thông tin", re: /inform the|notify|communicate|send.*(?:report|update|email)|share.*with|present.*to|brief the/i },
  { id: "allow_empower", label: "trao quyền / để team tự quyết", re: /allow the team|empower|enable the team|give the team (?:authority|autonomy)|self-organiz|delegate.*decision/i },
  { id: "encourage_collaborate", label: "khuyến khích collaboration / hợp tác", re: /encourage the team|promote collaboration|foster|build trust|collaborate with/i },
  { id: "team_building", label: "team building / hoạt động nhóm", re: /team.?building|team building|social activit|group activit|offsite|icebreaker/i },
  { id: "coach_develop", label: "coaching / phát triển năng lực", re: /coach|mentor|training|develop.*skill|capability|competenc|onboard/i },
  { id: "prioritize_value", label: "ưu tiên theo giá trị / MVP", re: /priorit|mvp|value delivery|business value|backlog.*prior|highest value|focus on value/i },
  { id: "quality_embed", label: "đảm bảo chất lượng / kiểm soát quality", re: /quality|defect|inspection|testing|acceptance criteria|verification|validation|control chart/i },
  { id: "vendor_procurement", label: "quản lý vendor / procurement", re: /vendor|supplier|contract|procurement|sow|rfp|subcontract/i },
  { id: "add_resources", label: "bổ sung nguồn lực / hire", re: /hire|add.*resource|get additional|onboard.*resource|staff up|external consult|consultancy|outsource/i },
  { id: "revise_plan", label: "sửa kế hoạch / baseline / schedule", re: /revise.*plan|update the (?:project management plan|schedule|baseline|timeline)|rebaseline|move the task|adjust the (?:schedule|plan|timeline)|crash|fast.?track/i },
  { id: "change_scope", label: "thay đổi phạm vi", re: /exclude|remove.*(?:task|feature|requirement)|reduce scope|cut scope|descope|change scope|de-scope/i },
  { id: "shift_responsibility", label: "đẩy trách nhiệm cho người khác tự xử lý", re: /unavoidable|find a solution|figure out|deal with it|their responsibility|ask the team member to find|ask them to resolve|tell them to/i },
  { id: "ask_team_act", label: "yêu cầu team hành động (chưa rõ facilitation)", re: /ask the (?:project )?team|ask team members|request the team|tell the team to|direct the team/i },
  { id: "escalate", label: "leo thang lên cấp trên", re: /escalat|inform the sponsor|report to (?:management|senior)|involve (?:senior|executive)|steering committee/i },
  { id: "document_first", label: "ghi nhận / tài liệu hóa", re: /document|lessons learned|write.*report|record in|update the log|capture.*decision/i },
  { id: "direct_command", label: "chỉ đạo cứng / ra lệnh", re: /\bdirect(?:ed|ing)?\b|\bcommand\b|\bmandate\b|\brequire them to\b|\border the/i },
  { id: "wait_delay", label: "chờ / trì hoãn", re: /wait until|wait for|delay|postpone|hold off|defer until|do nothing|take no action|ignore/i },
  { id: "proceed_continue", label: "tiếp tục theo kế hoạch hiện tại", re: /proceed with|continue with|move forward|as planned|keep going|maintain the current/i },
  { id: "incentive_reward", label: "khuyến khích bằng incentive/thưởng", re: /incentive|reward|bonus|offer.*program/i },
  { id: "evaluate_individual", label: "đánh giá cá nhân / skill gap", re: /evaluate the skill|skill set|technical gap|performance review|replace the team member|remove.*member/i },
  { id: "work_with_party", label: "phối hợp với bên liên quan", re: /work with the|partner with|coordinate with|reach out to|contact the/i },
  { id: "ensure_compliance", label: "đảm bảo tuân thủ / compliance", re: /ensure.*compliance|regulatory|policy|standard|audit|governance/i },
  { id: "agile_ceremony", label: "Agile ceremony / iteration event", re: /daily standup|sprint planning|iteration planning|iteration review|demo|backlog refinement|grooming/i },
];

const STEM_ISSUES = [
  { id: "member_struggle", re: /overwhelmed|struggling|not happy|unhappy|having difficulty|difficulty delivering|burned out|demotivat|underperform|complexity of the tasks|not able to complete assigned/i, label: "thành viên quá tải hoặc bất mãn" },
  { id: "schedule_delay", re: /schedule.*(?:delay|overrun|slip)|behind schedule|late|deadline|critical path.*delay|project is late/i, label: "trễ tiến độ / áp lực schedule" },
  { id: "cost_issue", re: /over budget|cost overrun|budget.*exceed|financial|funding|cpi|overrun cost/i, label: "vấn đề chi phí / ngân sách" },
  { id: "quality_issue", re: /defect|bug|quality|poor quality|rework|failed inspection|does not meet.*standard/i, label: "vấn đề chất lượng / defect" },
  { id: "stakeholder_issue", re: /stakeholder.*(?:concern|unhappy|dissatisf|complain|escalat)|customer.*(?:unhappy|complain|concern)|sponsor.*(?:concern|unhappy)|product owner.*expect/i, label: "stakeholder không hài lòng / kỳ vọng lệch" },
  { id: "conflict", re: /conflict|disagree|argument|tension|dispute|confrontation|not getting along/i, label: "xung đột trong team hoặc stakeholder" },
  { id: "communication_error", re: /mistake.*(?:email|message|sent)|wrong.*(?:email|message)|miscommunicat|failed to communicate|not informed/i, label: "lỗi truyền thông / thông tin sai" },
  { id: "risk_materialized", re: /risk.*(?:materializ|occurred|happened)|identified a risk|planned risk response|emergency|unexpected event/i, label: "rủi ro đã/sắp xảy ra" },
  { id: "change_requested", re: /change request|requested a change|new requirement|additional feature|scope change|change in scope/i, label: "yêu cầu thay đổi phạm vi/kế hoạch" },
  { id: "resource_gap", re: /resource.*(?:unavailable|shortage|constraint)|not enough|lack of|skill.*(?:gap|missing)|vacant|leave of absence/i, label: "thiếu hụt nguồn lực / kỹ năng" },
  { id: "vendor_issue", re: /vendor|supplier|contractor|subcontract|procurement.*(?:issue|delay|fail)/i, label: "vấn đề vendor / procurement" },
  { id: "new_team", re: /newly formed|new team|just formed|recently assembled|forming stage|team is new/i, label: "team mới hình thành" },
  { id: "virtual_team", re: /virtual|remote|distributed|different (?:countries|time zones)|geographically/i, label: "team phân tán / virtual" },
  { id: "agile_context", re: /agile|scrum|sprint|iteration|backlog|product owner|scrum master|kanban/i, label: "ngữ cảnh Agile/Scrum" },
  { id: "ethics_compliance", re: /ethic|integrity|compliance|regulation|legal|policy violation|unethical/i, label: "đạo đức / tuân thủ" },
  { id: "uncertainty", re: /uncertain|unclear|ambigu|unknown|volatile|innovation|highly dynamic/i, label: "mức độ uncertainty cao" },
];

const STEM_PROFILES = [
  {
    id: "member_struggle",
    re: /overwhelmed|struggling|not happy|unhappy|having difficulty|difficulty delivering|burned out|demotivat|underperform|complexity of the tasks/i,
    domains: ["Resources", "Stakeholders"],
    principles: ["Build an empowered culture", "Lead accountably"],
    processes: ["Develop Team", "Manage Team"],
    summaryHint: "Thành viên quá tải/bất mãn — PM lắng nghe, hỗ trợ cụ thể trước; không đẩy trách nhiệm hay team building chung chung.",
    rejectByAction: {
      shift_responsibility: "Đẩy member tự xử lý khi đã overwhelmed — thiếu empathy; PM phải hỗ trợ (servant leadership).",
      team_building: "Team building nhóm không giải quyết nhu cầu cá nhân — cần listen/support 1-on-1 trước.",
      risk_register: "Ghi risk khi chưa hiểu root cause và chưa hỗ trợ member — sai thứ tự.",
      ask_team_act: "Yêu cầu team tự giải quyết thay vì PM hỗ trợ member đang gặp khó.",
      evaluate_individual: "Đánh giá skill cá nhân thay vì hỗ trợ — có thể gây mất tin tưởng.",
    },
    preferCorrect: ["listen_support"],
  },
  {
    id: "communication_error",
    re: /mistake.*(?:email|message)|wrong.*(?:email|message|sent)|miscommunicat|sent to the entire|unintended/i,
    domains: ["Stakeholders", "Governance"],
    principles: ["Lead accountably"],
    processes: ["Manage Stakeholder Engagement"],
    summaryHint: "Lỗi truyền thông — PM thừa nhận, xin lỗi minh bạch và khắc phục hậu quả (Lead accountably).",
    rejectByAction: {
      ignore: "Bỏ qua lỗi email/truyền thông — vi phạm accountability và làm mất tin tưởng.",
      wait_delay: "Chờ đợi thay vì thừa nhận lỗi — stakeholder cần phản hồi kịp thời.",
      document_first: "Ghi nhận thay vì acknowledge trực tiếp — thiếu con người trong phản hồi.",
    },
    preferCorrect: ["apologize_accountable", "communicate_inform"],
  },
  {
    id: "risk_materialized",
    re: /risk.*(?:materializ|occurred|happened|identified)|planned risk response|emergency|not be available when needed/i,
    domains: ["Risk", "Resources"],
    principles: ["Lead accountably", "Focus on value"],
    processes: ["Monitor Risks", "Implement Risk Responses"],
    summaryHint: "Risk đã trigger — thực thi planned response từ risk register trước khi đổi plan hay ghi log.",
    rejectByAction: {
      document_first: "Ghi lessons/risk log trước khi hành động — sai thứ tự khi đã có response plan.",
      change_scope: "Cắt scope ngay — quá nặng nếu chưa thực thi planned response.",
      revise_plan: "Sửa baseline tùy tiện trước khi consult risk register.",
    },
    preferCorrect: ["consult_artifact"],
  },
  {
    id: "conflict",
    re: /conflict|disagree|argument|tension|dispute|confrontation|not getting along/i,
    domains: ["Stakeholders", "Resources"],
    principles: ["Lead accountably", "Build an empowered culture"],
    summaryHint: "Xung đột — PM facilitate giải quyết trực tiếp, không ignore hay escalate sớm.",
    rejectByAction: {
      escalate: "Escalate trước khi facilitate — PM nên thử giải quyết ở cấp team trước.",
      wait_delay: "Bỏ qua/trì hoãn xung đột — vấn đề sẽ leo thang.",
      direct_command: "Ra lệnh một chiều thay vì facilitate consensus.",
    },
    preferCorrect: ["meet_discuss", "listen_support"],
  },
  {
    id: "stakeholder_dissatisfaction",
    re: /stakeholder.*(?:concern|unhappy|dissatisf)|customer.*(?:unhappy|complain|concern)|not meeting.*expect|expectation.*not met/i,
    domains: ["Stakeholders"],
    principles: ["Focus on value"],
    processes: ["Manage Stakeholder Engagement"],
    summaryHint: "Stakeholder không hài lòng — engage, làm rõ kỳ vọng và thống nhất hướng xử lý.",
    rejectByAction: {
      ignore: "Bỏ qua stakeholder concern — vi phạm miền Stakeholders.",
      proceed_continue: "Tiếp tục như cũ khi stakeholder chưa được engage — rủi ro leo thang kỳ vọng.",
      change_scope: "Đổi scope ngay mà chưa thảo luận — cần engagement trước.",
    },
    preferCorrect: ["stakeholder_engagement", "meet_discuss"],
  },
  {
    id: "change_requested",
    re: /change request|requested a change|new requirement|additional feature|wants to add|scope change/i,
    domains: ["Governance", "Scope"],
    principles: ["Focus on value"],
    processes: ["Perform Integrated Change Control"],
    summaryHint: "Có yêu cầu thay đổi — phải qua change control, đánh giá impact trước khi chấp nhận.",
    rejectByAction: {
      change_scope: "Chấp nhận thay đổi trực tiếp không qua change control — vi phạm Governance.",
      proceed_continue: "Bỏ qua change request — scope creep hoặc stakeholder bị bỏ qua.",
      revise_plan: "Sửa plan ngay mà chưa đánh giá impact và approval.",
    },
    preferCorrect: ["change_control"],
  },
  {
    id: "quality_retro",
    re: /(?:bug|defect|quality).*(?:release|product|feedback)|retrospective|root cause|continuous improvement/i,
    domains: ["Resources", "Scope"],
    principles: ["Embed quality", "Build an empowered culture"],
    processes: ["Develop Team", "Validate Scope"],
    summaryHint: "Vấn đề chất lượng sau delivery — retrospective/root cause và cải tiến hệ thống.",
    rejectByAction: {
      add_resources: "Thuê ngoài/test hộ — không thay thế cải thiện nội bộ (Embed quality).",
      incentive_reward: "Incentive sửa bug — tạo hành vi lệch, không fix root cause.",
      evaluate_individual: "Đánh giá cá nhân thay vì systemic improvement qua retro.",
      team_building: "Team building không thay retrospective phân tích root cause.",
    },
    preferCorrect: ["facilitate_retro"],
  },
  {
    id: "virtual_team",
    re: /virtual|remote|distributed|different (?:countries|time zones)|geographically|not able to collaborate/i,
    domains: ["Resources", "Stakeholders"],
    principles: ["Build an empowered culture"],
    processes: ["Develop Team", "Plan Resources"],
    summaryHint: "Team phân tán — cải thiện collaboration tools/process, không chỉ họp face-to-face.",
    rejectByAction: {
      wait_delay: "Chờ collocate — không realistic với distributed team.",
      direct_command: "Micromanage remote team — giảm autonomy và trust.",
    },
    preferCorrect: ["encourage_collaborate", "coach_develop"],
  },
  {
    id: "resource_unavailable",
    re: /resource.*(?:unavailable|not available|shortage|leave|absence)|key.*(?:resource|person).*unavailable/i,
    domains: ["Resources", "Risk"],
    principles: ["Lead accountably"],
    processes: ["Acquire Resources", "Monitor Risks"],
    summaryHint: "Resource không sẵn sàng — xem risk register / response plan hoặc reallocate có kiểm soát.",
    rejectByAction: {
      change_scope: "Cắt scope ngay — phản ứng nặng trước khi thử mitigations.",
      ignore: "Bỏ qua resource gap — schedule/quality sẽ bị ảnh hưởng.",
    },
    preferCorrect: ["consult_artifact", "revise_plan"],
  },
  {
    id: "ethics_issue",
    re: /ethic|integrity|unethical|policy violation|bribe|discriminat|harassment/i,
    domains: ["Governance"],
    principles: ["Lead accountably"],
    processes: ["Manage Project Execution"],
    summaryHint: "Vấn đề đạo đức — hành động minh bạch, tuân thủ policy, escalate nếu cần.",
    rejectByAction: {
      ignore: "Bỏ qua vi phạm đạo đức — không chấp nhận được.",
      wait_delay: "Trì hoãn xử lý ethics issue — rủi ro pháp lý và uy tín.",
    },
    preferCorrect: ["ensure_compliance", "escalate"],
  },
];

const CONTRAST_MATRIX = {
  listen_support: {
    shift_responsibility: "Member cần được lắng nghe/hỗ trợ — không nên yêu cầu tự gánh trách nhiệm.",
    team_building: "Vấn đề cá nhân cần xử lý trực tiếp, không thay bằng hoạt động nhóm chung.",
    risk_register: "Chưa listen/support mà đã ghi risk — sai thứ tự ưu tiên.",
    ask_team_act: "Yêu cầu team tự xử lý thay vì PM hỗ trợ member đang gặp khó.",
    direct_command: "Chỉ đạo cứng thay vì lắng nghe — vi phạm empowered culture.",
    document_first: "Documentation trước khi xử lý con người.",
    evaluate_individual: "Đánh giá/blame cá nhân thay vì hỗ trợ.",
  },
  apologize_accountable: {
    ignore: "Bỏ qua lỗi — vi phạm Lead accountably.",
    wait_delay: "Trì hoãn acknowledge — stakeholder mất tin tưởng.",
    document_first: "Chỉ ghi nhận mà không acknowledge trực tiếp.",
    communicate_inform: "Thông báo một chiều chưa đủ nếu chưa apologize khi PM có lỗi.",
  },
  consult_artifact: {
    revise_plan: "Sửa plan trước khi tham chiếu artifact/plan đã có.",
    change_scope: "Đổi scope khi chưa follow quy trình trong plan/register.",
    shift_responsibility: "Phản ứng tùy hứng thay vì dùng planned approach.",
    document_first: "Ghi log trước khi thực thi planned response.",
    proceed_continue: "Tiếp tục mù quáng thay vì consult register/plan.",
  },
  facilitate_retro: {
    add_resources: "Thuê ngoài thay vì team tự cải thiện qua retro.",
    incentive_reward: "Incentive tạo hành vi lệch — không fix root cause.",
    evaluate_individual: "Focus cá nhân thay vì systemic improvement.",
    team_building: "Team building ≠ retrospective phân tích root cause.",
    direct_command: "PM chỉ đạo giải pháp thay vì facilitate team.",
  },
  change_control: {
    change_scope: "Thay đổi scope trực tiếp — bỏ qua change control.",
    proceed_continue: "Implements change mà không formal approval.",
    revise_plan: "Sửa plan trước khi submit/đánh giá change request.",
  },
  stakeholder_engagement: {
    escalate: "Escalate trước khi engage stakeholder trực tiếp.",
    ignore: "Bỏ qua stakeholder — vi phạm miền Stakeholders.",
    proceed_continue: "Tiếp tục mà chưa align kỳ vọng stakeholder.",
    direct_command: "Ra lệnh thay vì collaborate/negotiate.",
  },
  meet_discuss: {
    wait_delay: "Trì hoãn thảo luận khi vấn đề cần giải quyết ngay.",
    escalate: "Escalate trước khi meet/facilitate ở cấp PM.",
    document_first: "Ghi nhận thay vì discuss trực tiếp.",
  },
  prioritize_value: {
    proceed_continue: "Làm tất cả features — không prioritize theo value.",
    change_scope: "Thêm scope thay vì prioritize backlog/MVP.",
  },
  coach_develop: {
    evaluate_individual: "Đánh giá/punish thay vì coach phát triển.",
    shift_responsibility: "Đẩy member tự học thay vì PM coach/support.",
    direct_command: "Chỉ đạo thay vì develop capability.",
  },
  allow_empower: {
    direct_command: "Micromanage thay vì trao quyền team tự quyết.",
    shift_responsibility: "PM không remove impediment mà đẩy trách nhiệm.",
  },
};

function classifyAction(text) {
  const t = String(text || "");
  for (const type of ACTION_TYPES) {
    if (type.re.test(t)) return type;
  }
  return null;
}

function extractStemIssues(stem) {
  return STEM_ISSUES.filter((s) => s.re.test(stem));
}

function matchStemProfile(stem) {
  return STEM_PROFILES.find((p) => p.re.test(stem)) || null;
}

function describeOptionIntent(text) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  const short = t.length > 85 ? `${t.slice(0, 82)}…` : t;
  const type = classifyAction(t);
  if (type) return type.label;
  if (/^ask the/i.test(t)) return "yêu cầu bên liên quan/team thực hiện hành động";
  if (/^update the/i.test(t)) return "cập nhật tài liệu/kế hoạch";
  if (/^review the/i.test(t)) return "rà soát tài liệu/kế hoạch";
  if (/^ensure/i.test(t)) return "đảm bảo điều kiện/tuân thủ";
  if (/^request/i.test(t)) return "đề xuất/yêu cầu formal";
  return `"${short}"`;
}

function contrastRejection(wrongType, correctType, stemProfile, stemIssues) {
  if (stemProfile?.rejectByAction?.[wrongType.id]) {
    return stemProfile.rejectByAction[wrongType.id];
  }
  if (correctType && CONTRAST_MATRIX[correctType.id]?.[wrongType.id]) {
    return CONTRAST_MATRIX[correctType.id][wrongType.id];
  }
  const issueLabel = stemIssues[0]?.label || "tình huống trong đề bài";
  return `Tập trung "${wrongType.label}" không giải quyết ${issueLabel} — đáp án đúng cần "${correctType?.label || "hành động phù hợp hơn"}".`;
}

function buildContextualSummary(q, correctKeys, correctType, stemProfile, stemIssues, domains) {
  if (stemProfile?.summaryHint) return stemProfile.summaryHint;
  const correctOpt = (q.options || []).find((o) => correctKeys.includes(o.key));
  const action = (correctOpt?.text || "").replace(/\s+/g, " ").trim();
  const short = action.length > 85 ? `${action.slice(0, 82)}…` : action;
  const issue = stemIssues[0]?.label;

  if (issue && correctType) {
    return `Với ${issue}, PM nên ${correctType.label} — "${short}" (miền ${domains.join(", ")}, PMBOK 8).`;
  }
  if (correctType) {
    return `PM nên ${correctType.label}: "${short}" — phù hợp miền ${domains.join(", ")} (PMBOK 8).`;
  }
  return `"${short}" là hành động phù hợp nhất cho bối cảnh câu hỏi (miền ${domains.join(", ")}).`;
}

function buildContextualWhy(q, correctKeys, correctType, stemProfile, stemIssues, domains, focusArea, priorityCue, agile) {
  const correctOpt = (q.options || []).find((o) => correctKeys.includes(o.key));
  const stem = q.text.replace(/\s+/g, " ").trim();
  const issue = stemIssues[0]?.label;
  const parts = [];

  if (stemProfile) {
    parts.push(
      `Đáp án **${correctKeys.join(", ")}** đúng vì PM ${correctType?.label || "xử lý đúng trọng tâm"} — phù hợp miền ${domains.join(" + ")} (Focus Area: ${focusArea}).`,
    );
  } else if (issue && correctType) {
    parts.push(`Bối cảnh: ${issue}.`);
    parts.push(
      `**${correctKeys.join(", ")}** chọn ${correctType.label} vì đây là cách PM xử lý trực tiếp vấn đề cốt lõi, align PMBOK 8 miền ${domains.join(" + ")}.`,
    );
  } else {
    parts.push(`Bối cảnh: ${stem.slice(0, 140)}${stem.length > 140 ? "…" : ""}.`);
    parts.push(
      `**${correctKeys.join(", ")}** — "${(correctOpt?.text || "").slice(0, 90)}${(correctOpt?.text || "").length > 90 ? "…" : ""}" — hành động phù hợp nhất theo logic PMP/PMBOK 8.`,
    );
  }

  if (priorityCue === "FIRST" || priorityCue === "NEXT") {
    parts.push(`Câu hỏi hỏi **${priorityCue}** — ưu tiên hành động xử lý trước documentation/thay đổi baseline.`);
  } else if (agile) {
    parts.push("Agile/Hybrid: ưu tiên empowered culture, collaboration và continuous improvement.");
  }

  return parts.join(" ");
}

function inferWrongReason(opt, q, correctKeys, patternRejectFn) {
  const patternReason = patternRejectFn(opt);
  if (patternReason) return patternReason;

  const correctOpt = (q.options || []).find((o) => correctKeys.includes(o.key));
  if (!correctOpt) return null;

  const wrongType = classifyAction(opt.text);
  const correctType = classifyAction(correctOpt.text);
  const stemProfile = matchStemProfile(q.text);
  const stemIssues = extractStemIssues(q.text);

  if (wrongType && correctType && wrongType.id === correctType.id) {
    const wrongShort = opt.text.replace(/\s+/g, " ").trim().slice(0, 70);
    const correctShort = correctOpt.text.replace(/\s+/g, " ").trim().slice(0, 70);
    return `Cùng nhóm hành động nhưng "${wrongShort}…" kém phù hợp hơn "${correctShort}…" với bối cảnh câu hỏi.`;
  }

  if (wrongType) {
    return contrastRejection(wrongType, correctType, stemProfile, stemIssues);
  }

  const t = opt.text.toLowerCase();
  const issue = stemIssues[0]?.label || "vấn đề trong đề bài";
  const correctIntent = describeOptionIntent(correctOpt.text);
  const wrongIntent = describeOptionIntent(opt.text);

  if (/unavoidable|find a solution|figure out|their responsibility/i.test(t)) {
    return `Đẩy trách nhiệm cho người khác — không phù hợp khi ${issue}; đáp án đúng: ${correctIntent}.`;
  }
  if (/team building|team-building/i.test(t)) {
    return `Team building chung không xử lý trực tiếp ${issue}; cần ${correctIntent}.`;
  }
  if (/risk register|risk log/i.test(t) && !/risk.*materializ/i.test(q.text)) {
    return `Ghi risk sớm khi ${issue} chưa được phân tích — cần ${correctIntent} trước.`;
  }
  if (/ignore|assume|wait|delay|do nothing|take no action/i.test(t)) {
    return `Thiếu hành động chủ động — PM phải xử lý ${issue}, không bỏ qua/trì hoãn.`;
  }
  if (/escalat/i.test(t)) {
    return `Leo thang quá sớm — thử ${correctIntent} trong phạm vi PM trước.`;
  }
  if (/^ask the (?:team|project)/i.test(opt.text)) {
    return `Yêu cầu team tự xử lý — PM vẫn chịu trách nhiệm facilitate; đáp án đúng: ${correctIntent}.`;
  }
  if (/^update the project management plan|^revise the plan/i.test(opt.text)) {
    return `Sửa plan trước khi xử lý ${issue} đúng cách — cần ${correctIntent} trước.`;
  }
  if (/^proceed with|^continue with|^move forward/i.test(opt.text)) {
    return `Tiếp tục như cũ bỏ qua ${issue} — không giải quyết root cause.`;
  }

  return `${wrongIntent} không phù hợp ${issue} — đáp án đúng tập trung ${correctIntent}.`;
}

module.exports = {
  classifyAction,
  matchStemProfile,
  extractStemIssues,
  buildContextualSummary,
  buildContextualWhy,
  inferWrongReason,
  STEM_PROFILES,
};
