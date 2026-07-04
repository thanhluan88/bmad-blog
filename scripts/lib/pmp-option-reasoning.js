/** Comparative reasoning: classify PM actions and explain wrong options vs correct answer. */

const ACTION_TYPES = [
  {
    id: "listen_support",
    label: "lắng nghe và hỗ trợ cá nhân",
    re: /actively listen|listen to the|understand.*concern|support (?:their|the) needs|empath|coaching|mentor|one-on-one|1-on-1|meet with.*(?:member|person)/i,
  },
  {
    id: "team_building",
    label: "team building / cải thiện quan hệ nhóm",
    re: /team.?building|team building|social activit|group activit|offsite|icebreaker/i,
  },
  {
    id: "risk_register",
    label: "ghi nhận rủi ro / cập nhật register",
    re: /risk register|risk log|enter.*risk|log the risk|update.*risk register/i,
  },
  {
    id: "shift_responsibility",
    label: "đẩy trách nhiệm cho người khác tự xử lý",
    re: /unavoidable|find a solution|figure out|deal with it|their responsibility|ask the team member to|tell them to/i,
  },
  {
    id: "escalate",
    label: "leo thang lên cấp trên",
    re: /escalat|inform the sponsor|report to management|involve senior|executive/i,
  },
  {
    id: "change_scope",
    label: "thay đổi phạm vi / loại bỏ công việc",
    re: /exclude|remove.*task|reduce scope|cut scope|descope|change scope/i,
  },
  {
    id: "revise_plan",
    label: "sửa kế hoạch / baseline",
    re: /revise.*plan|change.*schedule|move the task|update.*baseline|rebaseline/i,
  },
  {
    id: "document_first",
    label: "ghi nhận / tài liệu hóa trước",
    re: /document|update.*log|lessons learned|write.*report|record in/i,
  },
  {
    id: "direct_command",
    label: "chỉ đạo trực tiếp / ra lệnh",
    re: /\bdirect(?:ed|ing)?\b|\btell (?:the )?team\b|\border\b|\bcommand\b|\bmandate\b|\brequire them to\b/i,
  },
  {
    id: "facilitate_retro",
    label: "facilitate retrospective / cải tiến quy trình",
    re: /retrospective|root cause|lessons.*meeting|continuous improvement|process improvement/i,
  },
  {
    id: "stakeholder_engagement",
    label: "engagement stakeholder / làm rõ kỳ vọng",
    re: /stakeholder|customer|sponsor|clarify.*expect|negotiat|communicat.*with/i,
  },
  {
    id: "consult_artifact",
    label: "tham chiếu artifact / kế hoạch có sẵn",
    re: /consult.*register|review.*plan|refer to|check the|project charter|change request|issue log/i,
  },
];

const STEM_PROFILES = [
  {
    id: "member_struggle",
    re: /overwhelmed|struggling|not happy|unhappy|having difficulty|difficulty delivering|burned out|burnout|demotivat|underperform|not able to complete|complexity of the tasks/i,
    domains: ["Resources", "Stakeholders"],
    principles: ["Build an empowered culture", "Lead accountably"],
    processes: ["Develop Team", "Manage Team"],
    summaryHint:
      "Thành viên đang quá tải hoặc bất mãn — PM cần lắng nghe và hỗ trợ trước, không ghi risk hay team building chung chung.",
    rejectByAction: {
      shift_responsibility:
        "Đẩy member tự tìm giải pháp khi họ đã overwhelmed — thiếu empathy và servant leadership; PM phải hỗ trợ, không đổ lỗi.",
      team_building:
        "Team building cho cả nhóm không giải quyết trực tiếp nhu cầu cá nhân đang quá tải — cần 1-on-1 listen/support trước.",
      risk_register:
        "Ghi risk register khi chưa hiểu root cause và chưa hỗ trợ member — documentation sớm, chưa xử lý con người.",
      direct_command:
        "Chỉ đạo cứng hoặc yêu cầu tự xử lý không phù hợp khi member cần được lắng nghe và được hỗ trợ cụ thể.",
      escalate:
        "Leo thang quá sớm — PM nên lắng nghe và hỗ trợ trong phạm vi quyền hạn trước khi escalate.",
    },
    preferCorrect: ["listen_support"],
  },
  {
    id: "conflict",
    re: /conflict|disagree|argument|tension|dispute|confrontation/i,
    domains: ["Stakeholders", "Resources"],
    principles: ["Lead accountably", "Build an empowered culture"],
    summaryHint: "Xung đột cần facilitation và giải quyết trực tiếp — không bỏ qua hay escalate ngay.",
    rejectByAction: {
      ignore: "Bỏ qua xung đột làm leo thang vấn đề — PM phải chủ động facilitate.",
      escalate: "Escalate ngay khi chưa thử giải quyết ở cấp team — quá sớm trừ khi vượt quyền PM.",
    },
    preferCorrect: ["listen_support", "stakeholder_engagement"],
  },
  {
    id: "risk_triggered",
    re: /risk.*materializ|occurred|happened|emergency|identified a risk|planned risk response/i,
    domains: ["Risk", "Resources"],
    principles: ["Lead accountably", "Focus on value"],
    summaryHint: "Risk đã/ sắp xảy ra — ưu tiên thực thi planned response từ risk register.",
    rejectByAction: {
      document_first: "Ghi nhận trước khi hành động — cần implement response plan trước.",
      change_scope: "Đổi scope là phản ứng nặng — không phải bước đầu khi đã có risk response.",
      revise_plan: "Sửa plan tùy tiện trước khi consult risk register — thiếu hệ thống.",
    },
    preferCorrect: ["consult_artifact", "risk_register"],
  },
];

function classifyAction(text) {
  const t = String(text || "");
  for (const type of ACTION_TYPES) {
    if (type.re.test(t)) return type;
  }
  return null;
}

function matchStemProfile(stem) {
  return STEM_PROFILES.find((p) => p.re.test(stem)) || null;
}

function contrastRejection(wrongType, correctType, stemProfile) {
  if (stemProfile?.rejectByAction?.[wrongType.id]) {
    return stemProfile.rejectByAction[wrongType.id];
  }

  const contrasts = {
    listen_support: {
      shift_responsibility: "Tình huống cần PM lắng nghe và hỗ trợ — không nên yêu cầu member tự gánh toàn bộ.",
      team_building: "Vấn đề cá nhân/cụ thể cần xử lý trực tiếp, không thay bằng hoạt động nhóm chung.",
      risk_register: "Chưa lắng nghe và hỗ trợ member mà đã ghi risk — sai thứ tự ưu tiên.",
      direct_command: "Micromanage/chỉ đạo thay vì lắng nghe — vi phạm Build empowered culture.",
      document_first: "Documentation trước khi xử lý con người — không phải hành động ưu tiên.",
    },
    consult_artifact: {
      revise_plan: "Sửa plan trước khi tham chiếu artifact/plan đã có — phản ứng thiếu hệ thống.",
      change_scope: "Thay đổi scope không phải bước đầu khi đã có quy trình/artifact hướng dẫn.",
      shift_responsibility: "Đẩy trách nhiệm thay vì follow planned approach trong register/plan.",
    },
    facilitate_retro: {
      shift_responsibility: "Thuê ngoài/incentive/đánh giá cá nhân thay vì team tự cải thiện qua retrospective.",
      team_building: "Team building không thay thế retrospective để phân tích root cause.",
      direct_command: "PM chỉ đạo giải pháp thay vì facilitate team improvement.",
    },
    stakeholder_engagement: {
      escalate: "Chưa engage stakeholder trực tiếp đã leo thang — quá sớm.",
      ignore: "Bỏ qua stakeholder concern — vi phạm miền Stakeholders.",
    },
  };

  if (correctType && contrasts[correctType.id]?.[wrongType.id]) {
    return contrasts[correctType.id][wrongType.id];
  }

  return `Hành động "${wrongType.label}" không phù hợp bối cảnh — đáp án đúng tập trung "${correctType?.label || "xử lý trực tiếp tình huống"}".`;
}

function buildContextualSummary(q, correctKeys, correctType, stemProfile, domains) {
  if (stemProfile?.summaryHint) return stemProfile.summaryHint;

  const correctOpt = (q.options || []).find((o) => correctKeys.includes(o.key));
  const action = (correctOpt?.text || "").replace(/\s+/g, " ").trim();
  const short = action.length > 90 ? `${action.slice(0, 87)}…` : action;

  if (correctType) {
    return `PM nên ${correctType.label}: "${short}" — phù hợp miền ${domains.join(", ")} (PMBOK 8).`;
  }
  return `Hành động "${short}" là lựa chọn phù hợp nhất cho bối cảnh câu hỏi (miền ${domains.join(", ")}).`;
}

function buildContextualWhy(q, correctKeys, correctType, stemProfile, domains, focusArea, priorityCue, agile) {
  const correctOpt = (q.options || []).find((o) => correctKeys.includes(o.key));
  const stem = q.text.replace(/\s+/g, " ").trim();

  const parts = [];
  if (stemProfile) {
    parts.push(
      `Đáp án **${correctKeys.join(", ")}** đúng vì PM thực hiện "${correctType?.label || "hành động phù hợp"}" — hành vi được PMBOK 8 khuyến nghị trong miền ${domains.join(" + ")} (Focus Area: ${focusArea}).`,
    );
  } else {
    parts.push(`Bối cảnh: ${stem.slice(0, 130)}${stem.length > 130 ? "…" : ""}.`);
    if (correctType) {
      parts.push(
        `Đáp án **${correctKeys.join(", ")}** đúng vì PM thực hiện "${correctType.label}" — align miền ${domains.join(" + ")} (Focus Area: ${focusArea}).`,
      );
    } else {
      parts.push(
        `Đáp án **${correctKeys.join(", ")}** — "${(correctOpt?.text || "").slice(0, 100)}" — align với quy trình miền ${domains.join(" + ")}.`,
      );
    }
  }

  if (priorityCue === "FIRST" || priorityCue === "NEXT") {
    parts.push(`Câu hỏi hỏi **${priorityCue}** — đây là bước ưu tiên trước documentation hoặc thay đổi kế hoạch.`);
  } else if (agile) {
    parts.push("Agile/Hybrid: ưu tiên empowered culture và continuous improvement.");
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

  if (wrongType && correctType && wrongType.id === correctType.id) {
    return "Cùng loại hành động nhưng chi tiết không phù hợp nhất với bối cảnh câu hỏi.";
  }

  if (wrongType) {
    return contrastRejection(wrongType, correctType, stemProfile);
  }

  // Keyword-based fallbacks on option text
  const t = opt.text.toLowerCase();
  if (/unavoidable|find a solution yourself|figure out/i.test(t)) {
    return "Yêu cầu member tự xử lý khi họ đã gặp khó — PM cần hỗ trợ chủ động (Lead accountably).";
  }
  if (/team building|team-building/i.test(t)) {
    return "Team building không phải phản ứng đầu tiên cho vấn đề cá nhân/cụ thể trong câu hỏi này.";
  }
  if (/risk register|risk log/i.test(t)) {
    return "Ghi risk trước khi hiểu và hỗ trợ tình huống — sai thứ tự; risk có thể ghi sau khi đã listen/support.";
  }
  if (/ignore|assume|wait|delay/i.test(t)) {
    return "Thiếu hành động chủ động — PM không nên bỏ qua hoặc trì hoãn.";
  }
  if (/escalat/i.test(t)) {
    return "Leo thang quá sớm khi PM chưa thử biện pháp trong phạm vi quyền hạn.";
  }

  // Last resort: explain what the option tries to do vs stem
  const short = opt.text.replace(/\s+/g, " ").trim().slice(0, 80);
  return `"${short}${opt.text.length > 80 ? "…" : ""}" không giải quyết trực tiếp vấn đề cốt lõi trong đề bài.`;
}

module.exports = {
  classifyAction,
  matchStemProfile,
  buildContextualSummary,
  buildContextualWhy,
  inferWrongReason,
  STEM_PROFILES,
};
