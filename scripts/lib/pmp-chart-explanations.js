/** Chart-specific PMBOK8 explanations for questions that reference missing exam images. */

const { CHARTS } = require("./pmp-agile-charts");

const CHART_EXPLANATIONS = {
  16: {
    domains: ["Scope", "Resources"],
    principles: ["Build an empowered culture"],
    processes: ["Control Schedule"],
    summaryHint:
      "Burndown day 4/15: actual line dưới ideal → ahead of schedule; tiếp tục sprint và monitor, chưa cắt/thêm scope.",
    whyCorrect:
      "Burndown cho thấy remaining work thấp hơn ideal line tại day 4 — team đang ahead, chưa cần cắt story hay thêm work. Scrum: tiếp tục sprint và monitor hàng ngày; quyết định điều chỉnh scope khi có dữ liệu ổn định hơn.",
    rejectByAction: {
      change_scope: "Cắt story khi team đang ahead — phản ứng thừa, chưa cần giảm scope.",
      prioritize_value: "Thêm story chỉ vì có capacity sớm — cần PO + team thống nhất, không tự ý kéo thêm mid-sprint.",
      proceed_continue: "Nói 'có buffer' nhưng chưa đọc chart đúng — actual dưới ideal nghĩa là ahead, không phải cần dựa buffer.",
    },
  },
  285: {
    domains: ["Scope", "Stakeholders", "Governance"],
    principles: ["Lead accountably", "Focus on value"],
    processes: ["Perform Integrated Change Control", "Manage Stakeholder Engagement"],
    summaryHint:
      "Burnup: Scope line nhảy lên từ day 3 → team/PO đang chấp nhận thêm work sau khi sprint đã bắt đầu.",
    whyCorrect:
      "Burnup chart có 2 đường: Scope (tổng work) và Completed. Scope tăng từ day 3 trong khi sprint đã chạy — nghĩa là work mới được thêm vào sprint backlog sau sprint planning. Project lead cần thảo luận với PO và team về việc chấp nhận thêm work mid-sprint (scope creep, ảnh hưởng commitment).",
    rejectByAction: {
      ask_team_act:
        "PO có thể negotiate thay đổi — vấn đề chart là team đang accept thêm work mid-sprint, không phải 'PO không được hỏi'.",
      proceed_continue: "PO có thể đề xuất thay đổi nhưng team phải negotiate — vấn đề là team đang accept quá nhiều work sau khi sprint bắt đầu.",
      stakeholder_engagement: "Team chậm/không đáp ứng kỳ vọng không phải tín hiệu chính — Scope line tăng mới là vấn đề.",
      revise_plan: "Dừng sprint và mở sprint mới — quá cực đoan; cần address scope addition với PO/team.",
    },
    rejectByOption: {
      C: "Chart không cho thấy team chậm — Completed vẫn tăng; vấn đề là Scope tăng (thêm work mid-sprint).",
      D: "Không cần dừng sprint day 4 — cần address việc thêm scope sau khi sprint đã start.",
    },
  },
  1373: {
    domains: ["Scope", "Resources"],
    principles: ["Embed quality", "Adopt a holistic view"],
    processes: ["Develop Team"],
    summaryHint:
      "Spike trên burndown = đoạn ngang (flat) — remaining work không giảm trong time-box investigation.",
    whyCorrect:
      "Spike là time-boxed research/investigation — team tạm dừng burn down story points vì đang khám phá kỹ thuật. Trên burndown, spike hiện thành flat horizontal segment: remaining work gần như không đổi trong vài ngày.",
    rejectByAction: {
      proceed_continue: "Steep downward slope = hoàn thành nhanh hơn plan — không phải spike.",
      revise_plan: "Vertical drop to zero ngày đầu — không realistic cho spike.",
      prioritize_value: "45-degree line matching plan — đó là ideal burndown, không phải spike.",
    },
  },
  456: {
    domains: ["Schedule", "Resources"],
    principles: ["Embed quality", "Adopt a holistic view"],
    processes: ["Control Schedule"],
    summaryHint:
      "CFD: In Progress band giãn rộng, Done không tăng → bottleneck; review WIP limits, không chỉ thêm người.",
    whyCorrect:
      "Cumulative flow diagram: band 'In Progress' mở rộng liên tục trong khi 'Done' flat 3 sprint → work tích tụ ở giữa pipeline (bottleneck). PM nên review WIP limits và flow, không chỉ allocate thêm resource hay kéo dài sprint.",
    rejectByAction: {
      add_resources: "Thêm người không fix flow bottleneck nếu WIP quá cao — Lean/Kanban ưu tiên limit WIP trước.",
      revise_plan: "Kéo dài sprint — che triệu chứng, không giải quyết bottleneck.",
      change_scope: "Cắt backlog — có thể cần sau nhưng trước hết phải fix flow/WIP.",
    },
  },
  625: {
    domains: ["Schedule", "Stakeholders"],
    principles: ["Focus on value"],
    processes: ["Control Schedule"],
    summaryHint:
      "Release burndown iter 9: actual remaining > expected → team chậm hơn kế hoạch.",
    whyCorrect:
      "Release burndown so sánh actual vs expected remaining work theo iteration. Tại Iteration 9, đường actual nằm trên expected → còn nhiều work hơn dự kiến → tiến độ chậm hơn plan.",
    rejectByAction: {
      proceed_continue: "Actual thấp hơn expected mới là faster — chart cho thấy ngược lại tại iter 9.",
      document_first: "Không thể kết luận 'đúng plan' khi actual > expected.",
      wait_delay: "Burndown đo remaining work qua iterations — đúng công cụ cho câu hỏi này.",
    },
  },
  631: {
    domains: ["Scope", "Resources"],
    principles: ["Embed quality"],
    processes: ["Validate Scope"],
    summaryHint:
      "CFD: Done tăng nhưng cần xác nhận Definition of Done — không thêm backlog mid-sprint vội.",
    whyCorrect:
      "Done band tăng nhưng quality manager lo rushed work. PM phải confirm completed work đáp ứng Definition of Done trước khi thêm backlog items mid-sprint để 'tận dụng capacity'.",
    rejectByAction: {
      change_scope: "Thêm backlog mid-sprint khi chưa verify DoD — rủi ro defect và scope creep.",
      escalate: "Escalate sớm thay vì xử lý quality concern với team.",
      communicate_inform: "Che báo cáo không giải quyết quality concern.",
    },
  },
  772: {
    domains: ["Governance", "Stakeholders", "Scope"],
    principles: ["Lead accountably"],
    processes: ["Perform Integrated Change Control"],
    summaryHint:
      "Burnup: backlog/scope tăng nhanh hơn completed → báo cáo trung thực (yellow) + backlog refinement.",
    whyCorrect:
      "Burnup cho thấy scope/backlog growth vượt delivery — báo cáo xanh sẽ misleading. PM phải Lead accountably: yellow status, giải thích trend, đề xuất corrective backlog refinement.",
    rejectByAction: {
      proceed_continue: "Green status khi backlog outpacing delivery — vi phạm governance và transparency.",
      document_first: "Ghi risk nhưng vẫn green — stakeholder vẫn bị mislead.",
      wait_delay: "Chờ team catch up mà không báo trend — không accountable.",
    },
  },
  1036: {
    domains: ["Resources", "Schedule"],
    principles: ["Focus on value", "Embed quality"],
    processes: ["Control Schedule"],
    summaryHint:
      "Burndown: độ dốc actual line tăng đột biến tại Day 6 → velocity spike nhờ công nghệ mới.",
    whyCorrect:
      "Velocity spike = remaining work giảm nhanh hơn bình thường trong 1 ngày. Trên burndown, Day 6 có steep downward slope (actual line đi xuống mạnh) so với các ngày trước — đúng ngày team dùng công nghệ mới.",
    rejectByAction: {
      proceed_continue: "Day 4/5 không có slope đột biến rõ — spike velocity ở Day 6.",
      wait_delay: "Steady slope không thể hiện one-day technology boost.",
    },
  },
};

function getChartExplanation(q) {
  if (!q?.id) return null;
  return CHART_EXPLANATIONS[q.id] || null;
}

function getChartOptionRejection(q, optKey) {
  const exp = getChartExplanation(q);
  return exp?.rejectByOption?.[optKey] || null;
}

function getChartStemProfile(q) {
  const exp = getChartExplanation(q);
  const chart = CHARTS[q.id];
  if (!exp || !chart) return null;
  return {
    id: `chart_${q.id}`,
    re: /.^/,
    domains: exp.domains,
    principles: exp.principles,
    processes: exp.processes,
    summaryHint: exp.summaryHint,
    whyCorrect: exp.whyCorrect,
    rejectByAction: exp.rejectByAction || {},
    preferCorrect: [],
    chartCaption: chart.caption,
  };
}

module.exports = {
  CHART_EXPLANATIONS,
  getChartExplanation,
  getChartStemProfile,
  getChartOptionRejection,
};
