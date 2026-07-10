/** Comparative reasoning: classify PM actions and explain wrong options vs correct answer. */

const { getChartStemProfile, getChartOptionRejection } = require("./pmp-chart-explanations");

const ACTION_TYPES = [
  { id: "apologize_accountable", label: "thừa nhận lỗi và giải trình minh bạch", re: /apolog|acknowledge the mistake|take responsibility|admit|transparen/i },
  { id: "listen_support", label: "lắng nghe và hỗ trợ cá nhân", re: /actively listen|listen to the|understand.*concern|support (?:their|the) needs|empath|one-on-one|1-on-1/i },
  { id: "explain_agile_value", label: "giải thích giá trị teamwork/Agile và continuous improvement", re: /explain that teamwork|explain.*(?:benefits?|value).*(?:teamwork|agile|collaboration)|continuous improvement.*early feedback|early feedback.*continuous improvement|benefits of (?:agile|teamwork)|value of (?:agile|iteration|collaboration)/i },
  { id: "enforce_wip_governance", label: "duy trì WIP limits và agile governance", re: /maintain governance and WIP|WIP limits.*governance|governance and WIP limits|WIP limit/i },
  { id: "recommend_eq", label: "khuyên phát triển EQ / attitude thay vì explain value", re: /emotional intelligence|develop emotional intelligence/i },
  { id: "escalate", label: "leo thang lên cấp trên", re: /escalat|ask the sponsor|inform the sponsor|report to (?:management|senior)|involve (?:senior|executive)|steering committee/i },
  { id: "facilitate_retro", label: "facilitate retrospective / phân tích root cause", re: /\b(?:facilitate|conduct|hold|lead).*(?:retrospective|root cause)|(?:sprint |iteration )?retrospective(?: meeting)?|root cause analysis|process improvement workshop|start.?stop.?continue/i },
  { id: "set_expectations", label: "set expectations / thống nhất kỳ vọng và yêu cầu", re: /set expectations|agree on the requirements|manage expectations|establish expectations|clarify expectations|align expectations/i },
  { id: "micromanage_control", label: "micromanage / giám sát cứng", re: /micromanag|under the supervision of the project manager|deploy.*staff under|command and control/i },
  { id: "add_to_register", label: "bổ sung register và reevaluate", re: /add.*(?:to )?(?:the )?(?:risk|issue) register|update.*register.*reevaluat|reevaluate.*register|enter.*(?:risk|issue) register/i },
  { id: "confirm_completed", label: "xác nhận đã hoàn thành (không xử lý mới)", re: /confirm.*(?:has been )?(?:completed|validated|approved)|already been completed|register has been completed/i },
  { id: "update_stakeholder_comms", label: "phân tích stakeholder và cập nhật kế hoạch truyền thông", re: /stakeholder analysis|update the (?:communications|stakeholder engagement) (?:management )?plan|communications management plan to reflect|update.*stakeholder engagement plan/i },
  { id: "consult_artifact", label: "tham chiếu artifact / kế hoạch đã có", re: /consult.*(?:register|plan|log)|review the (?:risk|issue|change|project management plan|charter|backlog)|refer to the|check the (?:risk|issue|plan|register)|risk register for|issue log|change log|project charter|business case|requirements traceability matrix|traceability matrix/i },
  { id: "revise_plan", label: "sửa kế hoạch / baseline / schedule", re: /revise.*plan|update the (?:project management plan|schedule|baseline|timeline)|rebaseline|move the task|adjust the (?:schedule|plan|timeline)|crash|fast.?track/i },
  { id: "develop_solution", label: "cùng phát triển giải pháp / collaborate", re: /develop a solution|work together|jointly develop|collaborate.*solution|co-create|brainstorm.*solution/i },
  { id: "change_scope", label: "thay đổi phạm vi", re: /exclude|remove.*(?:task|feature|requirement)|reduce scope|cut scope|descope|change scope|de-scope|will not be included|not be included in this project/i },
  { id: "define_mvp", label: "define MVP / minimum viable product", re: /minimum viable product|\bmvp\b|define.*mvp|mvp and/i },
  { id: "change_control", label: "change control / change request", re: /change request|change control|submit.*change|integrated change|formal change/i },
  { id: "stakeholder_engagement", label: "engagement stakeholder / làm rõ kỳ vọng", re: /stakeholder engagement|clarify.*expect|negotiat|engage.*stakeholder|meet with (?:the )?(?:stakeholder|customer|sponsor|product owner)|talk to (?:the )?(?:stakeholder|customer|sponsor)/i },
  { id: "inform_one_way", label: "thông báo một chiều (inform/notify)", re: /\binform (?:them|the|stakeholder|team|manager|customer)\b|\bnotify (?:them|the|stakeholder|team)\b/i },
  { id: "meet_discuss", label: "họp / thảo luận trực tiếp", re: /meet with|talk to|speak with|discuss with|discuss the|set up a meeting|schedule a meeting|facilitate a (?:meeting|session|workshop)/i },
  { id: "communicate_inform", label: "thông báo / truyền đạt thông tin", re: /inform the|notify|communicate (?:with|to|the)|send.*(?:report|update|email)|share.*with|present (?:the|a|to)|brief the|briefing with|demonstrate progress/i },
  { id: "allow_empower", label: "trao quyền / để team tự quyết", re: /allow the team|empower|enable the team|give the team (?:authority|autonomy)|self-organiz|delegate.*decision/i },
  { id: "risk_register", label: "ghi nhận / cập nhật risk register", re: /(?:enter|log|record|update).*(?:risk register|risk log)|risk register|risk log/i },
  { id: "issue_log", label: "ghi nhận issue / theo dõi vấn đề", re: /issue log|log the issue|enter.*issue|track the issue/i },
  { id: "encourage_collaborate", label: "khuyến khích collaboration / hợp tác", re: /encourage the team|promote collaboration|foster|build trust|collaborate with/i },
  { id: "team_building", label: "team building / hoạt động nhóm", re: /team.?building|team building|social activit|group activit|offsite|icebreaker/i },
  { id: "coach_develop", label: "coaching / phát triển năng lực", re: /coach|mentor|training|develop.*skill|capability|competenc|onboard/i },
  { id: "prioritize_value", label: "ưu tiên theo giá trị / MVP", re: /priorit|mvp|value delivery|business value|backlog.*prior|highest value|focus on value/i },
  { id: "quality_embed", label: "đảm bảo chất lượng / kiểm soát quality", re: /\bquality (?:plan|control|assurance|management|standard|issue|gate)\b|\bdefect\b|\binspection\b|\btesting\b|acceptance criteria|verification|validation|control chart/i },
  { id: "vendor_procurement", label: "quản lý vendor / procurement", re: /\b(?:vendor|supplier|procurement|subcontract)\b|(?:sow|rfp)\b|award.*contract/i },
  { id: "add_resources", label: "bổ sung nguồn lực / hire", re: /hire|add.*resource|get additional|onboard.*resource|staff up|external consult|consultancy|outsource/i },
  { id: "shift_responsibility", label: "đẩy trách nhiệm cho người khác tự xử lý", re: /unavoidable|find a solution|figure out|deal with it|their responsibility|ask the team member to find|ask them to resolve|tell them to/i },
  { id: "ask_team_act", label: "yêu cầu team hành động (chưa rõ facilitation)", re: /ask the (?:project )?team|ask team members|request the team|tell the team to|direct the team/i },
  { id: "document_first", label: "ghi nhận / tài liệu hóa", re: /document|lessons learned|write.*report|record in|update the log|capture.*decision/i },
  { id: "direct_command", label: "chỉ đạo cứng / ra lệnh", re: /\bdirect(?:ed|ing)?\b|\bcommand\b|\bmandate\b|\brequire them to\b|\border the/i },
  { id: "wait_delay", label: "chờ / trì hoãn", re: /wait until|wait for|delay|postpone|hold off|defer until|do nothing|take no action|ignore/i },
  { id: "proceed_continue", label: "tiếp tục theo kế hoạch hiện tại", re: /proceed with|continue with|move forward|as planned|keep going|maintain the current/i },
  { id: "incentive_reward", label: "khuyến khích bằng incentive/thưởng", re: /incentive|reward|bonus|offer.*program/i },
  { id: "evaluate_individual", label: "đánh giá cá nhân / skill gap", re: /evaluate the skill|skill set|technical gap|performance review|replace the team member|remove.*member/i },
  { id: "work_with_party", label: "phối hợp với bên liên quan", re: /work with the|partner with|coordinate with|reach out to|contact the/i },
  { id: "ensure_compliance", label: "đảm bảo tuân thủ / compliance", re: /ensure.*compliance|regulatory|policy|standard|audit|governance/i },
  { id: "agile_ceremony", label: "Agile ceremony / iteration event", re: /daily standup|sprint planning|iteration planning|iteration review|\bdemo\b|backlog refinement|grooming/i },
];

const STEM_ISSUES = [
  { id: "sme_reluctance", re: /subject matter expert|\bSME\b|reluctant|reluctance|join the agile team|encourage them to join|working on a team is demotivat/i, label: "SME chưa buy-in Agile teamwork" },
  { id: "member_struggle", re: /overwhelmed|struggling with|having difficulty delivering|burned out|underperform(?:ing)?|complexity of the tasks|missing task deadlines|not able to complete assigned/i, label: "thành viên quá tải hoặc bất mãn" },
  { id: "schedule_delay", re: /schedule.*(?:delay|overrun|slip)|behind schedule|late|deadline|critical path.*delay|project is late/i, label: "trễ tiến độ / áp lực schedule" },
  { id: "cost_issue", re: /over budget|cost overrun|budget.*exceed|financial|funding|cpi|overrun cost/i, label: "vấn đề chi phí / ngân sách" },
  { id: "quality_issue", re: /defect|bug|quality|poor quality|rework|failed inspection|does not meet.*standard/i, label: "vấn đề chất lượng / defect" },
  { id: "stakeholder_issue", re: /stakeholder.*(?:concern|unhappy|dissatisf|complain|escalat)|customer.*(?:unhappy|complain|concern)|sponsor.*(?:concern|unhappy)|product owner.*expect/i, label: "stakeholder không hài lòng / kỳ vọng lệch" },
  { id: "conflict", re: /conflict|disagree|argument|tension|dispute|confrontation|not getting along/i, label: "xung đột trong team hoặc stakeholder" },
  { id: "communication_error", re: /mistake.*(?:email|message|sent)|wrong.*(?:email|message)|miscommunicat|failed to communicate|not informed/i, label: "lỗi truyền thông / thông tin sai" },
  { id: "risk_materialized", re: /risk.*(?:materializ|occurred|happened)|identified a risk|planned risk response|emergency|unexpected event/i, label: "rủi ro đã/sắp xảy ra" },
  { id: "change_requested", re: /change request|requested a change|requested changes|new requirement|additional feature|wants to include|scope change|change in scope/i, label: "yêu cầu thay đổi phạm vi/kế hoạch" },
  { id: "new_sponsor", re: /new project sponsor|new sponsor has been assigned|newly assigned sponsor|new sponsor wants/i, label: "sponsor mới với kỳ vọng/thay đổi phạm vi" },
  { id: "resource_gap", re: /resource.*(?:unavailable|shortage|constraint)|not enough|lack of|skill.*(?:gap|missing)|vacant|leave of absence/i, label: "thiếu hụt nguồn lực / kỹ năng" },
  { id: "vendor_issue", re: /vendor|supplier|contractor|subcontract|procurement.*(?:issue|delay|fail)/i, label: "vấn đề vendor / procurement" },
  { id: "new_team", re: /newly formed|new team|just formed|recently assembled|forming stage|team is new/i, label: "team mới hình thành" },
  { id: "virtual_team", re: /virtual|remote|distributed|different (?:countries|time zones)|geographically/i, label: "team phân tán / virtual" },
  { id: "agile_context", re: /agile|scrum|sprint|iteration|backlog|product owner|scrum master|kanban/i, label: "ngữ cảnh Agile/Scrum" },
  { id: "new_stakeholder", re: /new department|new stakeholder|requested to be involved|wants to be included|reporting cycles|join.*communication|be involved in.*communication/i, label: "stakeholder/phòng ban mới muốn tham gia truyền thông dự án" },
  { id: "ethics_compliance", re: /ethic|integrity|compliance|regulation|legal|policy violation|unethical/i, label: "đạo đức / tuân thủ" },
  { id: "uncertainty", re: /uncertain|unclear|ambigu|unknown|volatile|innovation|highly dynamic/i, label: "mức độ uncertainty cao" },
];

const STEM_PROFILES = [
  {
    id: "new_stakeholder",
    re: /new department|new stakeholder|requested to be involved|reporting cycles|be involved in.*communication/i,
    domains: ["Stakeholders"],
    principles: ["Lead accountably"],
    processes: ["Identify Stakeholders", "Plan Stakeholder Engagement", "Manage Stakeholder Engagement"],
    summaryHint: "Stakeholder/phòng ban mới — phân tích stakeholder và cập nhật communications plan; không thêm ad hoc hay từ chối cứng.",
    whyCorrect: "Stakeholder mới xuất hiện giữa chừng Executing — PM phải perform stakeholder analysis, xác định nhu cầu thông tin/báo cáo, rồi update communications management plan cho phù hợp.",
    rejectByAction: {
      ask_team_act: "Đẩy team tự thêm manager vào email — thiếu kiểm soát; PM phải cập nhật plan truyền thông chính thức.",
      inform_one_way: "Từ chối stakeholder vì chưa có trong plan cũ — sai; plan cần được cập nhật khi có stakeholder mới.",
      escalate: "Đẩy sang steering committee/PMO — PM vẫn chịu trách nhiệm stakeholder analysis và update plan.",
      communicate_inform: "Thông báo một chiều không thay cho phân tích stakeholder và cập nhật plan.",
    },
    preferCorrect: ["update_stakeholder_comms"],
  },
  {
    id: "kanban_wip_governance",
    re: /kanban board|work-in-progress \(WIP\) limits|\bWIP limits?\b/i,
    domains: ["Stakeholders", "Governance"],
    principles: ["Focus on value", "Lead accountably"],
    processes: ["Manage Stakeholder Engagement", "Manage Project Execution"],
    summaryHint:
      "Stakeholder muốn bỏ qua WIP limits vì agile — PM giải thích vẫn phải giữ governance/WIP đã thống nhất.",
    whyCorrect:
      "Agile không có nghĩa bỏ process — PM giải thích team duy trì governance và WIP limits; chỉ bắt đầu landing page khi có capacity hoặc khi ưu tiên thay đổi.",
    signalPhrases: [
      "Kanban board and work-in-progress (WIP) limits agreed with stakeholders",
      "Because we are agile, you can just start my landing page now, and we\u2019ll worry about process later",
      "\u201cPriority Campaign Landing Page\u201d",
    ],
    signalAnswer:
      "Stakeholder cites agility to bypass agreed WIP limits — PM explains agile teams still maintain governance and WIP limits; start the landing page when capacity is available or priorities change.",
    groundingConclusion:
      "→ C: maintain governance and WIP limits — agile does not mean skip agreed process.",
    lessonBullets: [
      "Signal: director nói agile = start ngay, process sau — hiểu lầm; WIP limits là governance đã agree với stakeholders.",
      "C đúng: explain agile teams maintain governance and WIP limits; begin landing page khi có capacity hoặc priorities change.",
      "PMBOK 8: agile teams empowered trong guardrails rõ — không phá WIP để chiều stakeholder đột ngột.",
    ],
    excludeReasonsByKey: {
      A: "Ignore WIP limits để chiều stakeholder — phá governance đã thống nhất; ghi nhận sau iteration không chấp nhận được.",
      B: "Đẩy item vào To Do và tránh thảo luận — không address misconception agile và không engage stakeholder đúng cách.",
      D: "Overtime để giữ WIP trên giấy — không bền vững; không thay cho conversation về governance và capacity.",
    },
    rejectByAction: {
      document_first: "Thêm vào In Progress và ignore WIP — vi phạm governance đã agree.",
      prioritize_value: "Đổi thứ tự im lặng không giải thích agile ≠ bỏ WIP limits.",
      ask_team_act: "Overtime song song — không sustainable; không enforce agreed limits.",
      wait_delay: "Bỏ qua WIP limit tạm thời — stakeholder misconception về agile không được corrected.",
    },
    preferCorrect: ["enforce_wip_governance", "ensure_compliance"],
  },
  {
    id: "iteration_estimate_refinement",
    re: /reevaluate their effort estimates|required experience when they executed|iteration retrospective.*overtime|did not have the required experience/i,
    domains: ["Resources", "Scope"],
    principles: ["Embed quality", "Build an empowered culture"],
    processes: ["Develop Team", "Manage Team"],
    summaryHint:
      "Retrospective: thiếu kinh nghiệm lần đầu → team tự reevaluate estimates ở planning, không escalate sponsor hay reorder backlog.",
    whyCorrect:
      "Team học từ iteration qua retrospective — PM để team reevaluate effort estimates ở planning với kinh nghiệm mới (Develop Team, empowered team).",
    signalPhrases: [
      "did not have the required experience when they executed the assigned tasks for the first time",
      "In the iteration retrospective, the team agreed",
      "work overtime to accomplish the goal",
      "What should the project manager do",
    ],
    signalAnswer:
      "Retrospective found first-time tasks took longer due to lack of experience — PM has the team reevaluate effort estimates at next iteration planning using knowledge gained, not escalate to sponsor or reprioritize backlog.",
    groundingConclusion:
      "→ C: team reevaluates estimates at iteration planning — apply retrospective learning (Develop Team).",
    lessonBullets: [
      "Signal: retrospective + lacked experience on first execution — team should improve estimates, not add sponsor time or reorder backlog.",
      "C đúng: ask team reevaluate effort estimates during iteration planning using experience from last iteration.",
      "PMBOK 8: Develop Team — empowered team improves planning from iteration learning.",
    ],
    excludeReasonsByKey: {
      A: "Sponsor-funded training shifts accountability away from team planning — retrospective learning belongs in next iteration planning.",
      B: "Change request for extra iteration time avoids fixing estimates — does not apply lessons from retrospective.",
      D: "Reprioritizing backlog delays delivery — team should refine estimates with new knowledge, not defer critical items.",
    },
    rejectByAction: {
      escalate: "Escalating to sponsor for more time — team should refine estimates from retrospective insight.",
      coach_develop: "External training request bypasses team-owned planning improvement.",
      prioritize_value: "Reprioritizing backlog avoids improving estimates with new iteration knowledge.",
    },
    preferCorrect: ["allow_empower", "facilitate_retro"],
  },
  {
    id: "ffp_well_defined_scope",
    re: /well-defined remaining scope|most appropriate contract type|replacement contractors|firm-fixed-price contract/i,
    domains: ["Governance", "Scope"],
    principles: ["Lead accountably"],
    processes: ["Manage Project Execution", "Conduct Procurements"],
    summaryHint:
      "Scope còn lại rõ ràng — chọn FFP để giao scope đã định với giá cố định; không T&M, cost-plus hay letter of intent.",
    whyCorrect:
      "Remaining scope is well-defined — firm-fixed-price holds contractors accountable for clear scope at agreed price (Lead accountably); T&M and cost-plus fit uncertain scope, not this case.",
    signalPhrases: [
      "well-defined remaining scope",
      "most appropriate contract type",
      "bring in replacement contractors",
      "What should the project manager do",
    ],
    signalAnswer:
      "Well-defined remaining scope signals fixed-price procurement — PM recommends firm-fixed-price to hold contractors accountable at agreed price, not flexible T&M, cost-plus, or a letter of intent before contract terms are set.",
    groundingConclusion:
      "→ B: FFP matches well-defined scope — accountability at agreed price.",
    lessonBullets: [
      "Signal: well-defined remaining scope — contract type should lock price for defined deliverables.",
      "B đúng: firm-fixed-price holds contractors accountable for clearly defined scope at agreed price.",
      "PMBOK 8: Lead accountably — match contract type to scope clarity.",
    ],
    excludeReasonsByKey: {
      A: "Time-and-materials keeps flexibility for undefined scope — unnecessary cost risk when remaining scope is already well-defined.",
      C: "Cost-plus reimburses incurred costs — buyer bears cost risk; wrong when scope and deliverables are clear.",
      D: "Letter of intent before final contract terms lets work start without firm agreement — poor procurement governance.",
    },
    rejectByAction: {
      proceed_continue: "T&M contract retains hour flexibility — does not leverage well-defined scope for fixed-price accountability.",
      change_control: "Cost-plus shifts cost risk to buyer — inappropriate when scope is already defined.",
      stakeholder_engagement: "Letter of intent negotiates after work starts — bypasses proper contract selection for defined scope.",
    },
    preferCorrect: ["vendor_procurement"],
  },
  {
    id: "sme_agile_reluctance",
    re: /subject matter expert|\bSME\b.*(?:agile|reluctant|team)|reluctant.*(?:agile|team)|join the agile team|working on a team is demotivat/i,
    domains: ["Resources", "Stakeholders"],
    principles: ["Build an empowered culture"],
    processes: ["Develop Team", "Manage Team"],
    summaryHint: "SME ngại tham gia Agile team — PM giải thích lợi ích teamwork, continuous improvement và feedback sớm; không leo thang sponsor hay chỉ nhắc EQ.",
    whyCorrect: "Expert lo ngại teamwork làm chậm/chất lượng giảm — PM coaching: giải thích Agile delivery cần collaboration, continuous improvement và early feedback loops giúp đạt chất lượng cao hơn, không phải làm việc đơn độc (Build an empowered culture, Develop Team).",
    signalPhrases: [
      "reluctant because they think that working on a team is demotivating and slows them down",
      "join the agile team",
      "highest-quality output possible",
      "approximately 30% of the deliverables will follow an agile approach",
    ],
    signalAnswer:
      "SME believes teamwork is demotivating and slows them down while wanting the highest-quality output — misconception about Agile; PM should explain continuous improvement and early feedback loops before EQ coaching, ceremonies, or sponsor escalation.",
    groundingConclusion:
      "→ B: explain Agile value (CI + early feedback) before EQ lecture / ceremony / escalation — Develop Team, PMBOK 8 p. 112.",
    conceptBlurb:
      "Develop Team (PMBOK 8, p. 112): PM assesses team needs and coaches when members are unsure how to work collaboratively — build empowered culture, not attitude lectures or early escalation.",
    lessonBullets: [
      "Signal: SME thinks teamwork is demotivating and slows them down — Agile misconception; PM explains value before ceremonies or escalation.",
      "B is correct: teamwork + continuous improvement + early feedback loops help the expert achieve higher-quality output than working alone — Develop Team + Build an empowered culture.",
      "PMBOK 8 p. 112: when members are unsure how to collaborate, PM assesses team needs and coaches directly (servant leadership), not escalate to sponsor.",
    ],
    excludeReasonsByKey: {
      A: "Recommending EQ development judges attitude — does not explain why Agile teamwork does not reduce quality.",
      C: "Assigning retrospective observer role before SME joins the team — explain CI + early feedback first.",
      D: "Escalating to sponsor for attitude — too heavy; PM coaches and explains value directly first.",
    },
    rejectByAction: {
      escalate: "Leo thang sponsor vì attitude — quá nặng; PM coach và explain value trước.",
      meet_discuss: "Nhờ sponsor can thiệp attitude — PM vẫn chịu trách nhiệm develop team trực tiếp.",
      recommend_eq: "Khuyên phát triển EQ mang tính phán xét — không giải thích vì sao teamwork Agile không làm giảm chất lượng.",
      evaluate_individual: "Chỉ focus EQ/attitude — thiếu explain agile value proposition cho SME.",
      facilitate_retro: "Giao vai retrospective/ceremony khi SME chưa join team — cần explain CI + early feedback trước.",
      team_building: "Team building chung không address concern cụ thể của SME về agile collaboration.",
    },
    preferCorrect: ["explain_agile_value", "coach_develop", "facilitate_retro"],
  },
  {
    id: "member_struggle",
    re: /overwhelmed|struggling with|not happy with|having difficulty delivering|burned out|underperform(?:ing)?|complexity of the tasks|missing task deadlines/i,
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
    whyCorrect:
      "Email gửi nhầm toàn team kèm critical feedback — PM acknowledge mistake và apologize công khai (Lead accountably), không ignore, không bắt xóa mail, không chỉ xin lỗi riêng người nhận.",
    signalPhrases: [
      "mistakenly sent to the entire global project team",
      "critical feedback regarding a recent incident",
      "email intended for a specific team member",
    ],
    signalAnswer:
      "Mistaken email to the entire global project team with critical feedback — FIRST: acknowledge the mistake and apologize publicly for unintended consequences (Lead accountably).",
    groundingConclusion:
      "→ B: acknowledge + apologize — Lead accountably, Manage Stakeholder Engagement.",
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
    id: "new_sponsor",
    re: /new project sponsor(?: has been assigned)?|new sponsor|newly assigned sponsor/i,
    domains: ["Stakeholders", "Governance", "Scope"],
    principles: ["Lead accountably", "Focus on value"],
    processes: ["Manage Stakeholder Engagement", "Perform Integrated Change Control"],
    summaryHint: "Sponsor mới + yêu cầu thay đổi phạm vi — gặp sponsor, review scope và change request trước rebaseline hay từ chối.",
    rejectByAction: {
      revise_plan: "Rebaseline ngay chỉ vì sponsor mới — chưa review scope/yêu cầu thay đổi và impact.",
      communicate_inform: "Briefing tiến độ chưa giải quyết yêu cầu thay đổi phạm vi — cần align scope với sponsor trước.",
      proceed_continue: "Từ chối thẳng thay đổi mà chưa thảo luận — vi phạm stakeholder engagement.",
      change_scope: "Quyết định scope một chiều trước khi thảo luận với sponsor mới.",
    },
    preferCorrect: ["meet_discuss", "stakeholder_engagement"],
  },
  {
    id: "change_requested",
    re: /change request|requested a change|new requirement|additional feature|wants to add|wants to include|scope change/i,
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
    whyCorrect:
      "Team virtual + PM lo engagement → recurring check-ins/meetings theo lịch giữ kết nối và đồng bộ (Develop Team), không copy plan cũ, không chỉ async, không chỉ kickoff bắt buộc.",
    signalPhrases: [
      "lack of locally skilled resources",
      "internationally dispersed project team",
      "work virtually",
      "concerned about engagement",
    ],
    signalAnswer:
      "Internationally dispersed virtual team + PM concerned about engagement — recurring check-ins and scheduled meetings sustain connection (Develop Team), not copying a past comms plan or async-only status reports.",
    groundingConclusion:
      "→ D: recurring check-ins — Develop Team, sustain virtual team engagement.",
    lessonBullets: [
      "Signal: virtual team + engagement concern — PM needs cadence check-ins/meetings, not a one-time kickoff or async-only comms.",
      "D is correct: recurring check-ins keep internationally dispersed team connected and aligned (Develop Team + Build an empowered culture).",
      "PMBOK 8: Develop Team focuses on team interaction and environment — ongoing cadence beats one-off kickoff for sustained engagement.",
    ],
    rejectByAction: {
      wait_delay: "One kickoff meeting does not sustain ongoing engagement for a new virtual team.",
      document_first: "Copying a past team's communications plan ignores current context and team needs.",
      communicate_inform: "Async-only status reports lack synchronous interaction needed for a new virtual team.",
      direct_command: "Micromanage remote team — reduces autonomy and trust.",
    },
    excludeReasonsByKey: {
      A: "One kickoff meeting does not sustain ongoing engagement for a new virtual team.",
      B: "Copying a past team's communications plan ignores current context and team needs.",
      C: "Async-only status reports lack synchronous interaction needed for a new virtual team.",
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
    revise_plan: "Rebaseline/sửa plan trước khi engagement và làm rõ scope với stakeholder/sponsor.",
    communicate_inform: "Briefing/thông báo tiến độ không thay cho thảo luận scope/yêu cầu thay đổi.",
  },
  meet_discuss: {
    wait_delay: "Trì hoãn thảo luận khi vấn đề cần giải quyết ngay.",
    escalate: "Escalate trước khi meet/facilitate ở cấp PM.",
    document_first: "Ghi nhận thay vì discuss trực tiếp.",
    revise_plan: "Rebaseline/sửa plan trước khi thảo luận scope với stakeholder/sponsor.",
    communicate_inform: "Briefing/thông báo tiến độ không thay cho thảo luận scope/yêu cầu thay đổi.",
    proceed_continue: "Từ chối hoặc bỏ qua thay đổi mà chưa meet và làm rõ yêu cầu.",
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
  explain_agile_value: {
    recommend_eq: "Khuyên EQ/attitude thay vì explain lợi ích teamwork, CI và early feedback.",
    facilitate_retro: "Giao vai ceremony/retro khi member chưa buy-in — cần explain value trước.",
    escalate: "Leo thang sponsor — PM vẫn phải coach và explain value trực tiếp.",
    meet_discuss: "Nhờ sponsor fix attitude — không thay cho PM develop team.",
    evaluate_individual: "Focus đánh giá cá nhân thay vì address misconception về Agile teamwork.",
    team_building: "Hoạt động nhóm chung không giải thích CI/feedback loops cho SME.",
  },
  allow_empower: {
    direct_command: "Micromanage thay vì trao quyền team tự quyết.",
    shift_responsibility: "PM không remove impediment mà đẩy trách nhiệm.",
  },
  update_stakeholder_comms: {
    ask_team_act: "Đẩy team tự thêm stakeholder vào truyền thông — thiếu governance; PM phải update plan chính thức.",
    inform_one_way: "Từ chối stakeholder mới vì chưa có trong plan cũ — plan phải được cập nhật.",
    escalate: "Leo thang PMO/steering committee — PM vẫn phải phân tích stakeholder trước.",
  },
  set_expectations: {
    micromanage_control: "Micromanage contractor thay vì set expectations và thống nhất requirements.",
    direct_command: "Command & control vendor — không phải cách quản lý contractor hiệu quả.",
  },
  add_to_register: {
    confirm_completed: "Chỉ xác nhận register đã xong — chưa xử lý risk mới stakeholder phát hiện.",
    risk_register: "Phân tích risk riêng với một người — thiếu reevaluate register có tham gia team.",
    escalate: "Leo thang committee trước khi update risk register — sai thứ tự.",
  },
  develop_solution: {
    inform_one_way: "Meet chỉ để inform — cần cùng designer phát triển giải pháp.",
    meet_discuss: "Meet với manager để inform thay vì làm việc trực tiếp với designer giải quyết vấn đề.",
  },
  define_mvp: {
    prioritize_value: "Task board/visual board chung — chưa define MVP cho sản phẩm mới.",
    proceed_continue: "Roadmap toàn diện trước — cần MVP trước khi commit full roadmap.",
  },
  consult_artifact: {
    consult_artifact: "Consult scope plan chung — RTM/traceability matrix cụ thể hơn để phân tích gap requirement.",
  },
};

function getPrimaryStemIssue(stemIssues, stemProfile) {
  if (stemProfile?.id === "sme_agile_reluctance") {
    return (
      stemIssues.find((i) => i.id === "sme_reluctance") || {
        id: "sme_reluctance",
        label: "SME chưa buy-in Agile teamwork",
      }
    );
  }
  return stemIssues[0] || null;
}

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

function contrastRejection(wrongType, correctType, stemProfile, stemIssues, wrongText, correctText) {
  if (stemProfile?.rejectByAction?.[wrongType.id]) {
    return stemProfile.rejectByAction[wrongType.id];
  }
  if (correctType && CONTRAST_MATRIX[correctType.id]?.[wrongType.id]) {
    return CONTRAST_MATRIX[correctType.id][wrongType.id];
  }
  const issueLabel = getPrimaryStemIssue(stemIssues, stemProfile)?.label || describeStemSituation({ text: wrongText }, stemIssues, stemProfile);
  const correctLabel = correctType?.label || "xử lý trực tiếp trọng tâm câu hỏi";
  return `Tập trung "${wrongType.label}" không giải quyết ${issueLabel} — đáp án đúng cần ${correctLabel}.`;
}

function differentiateSameGroupRejection(opt, correctOpt, actionType, q, stemIssues, stemProfile) {
  const wrong = opt.text.replace(/\s+/g, " ").trim();
  const correct = correctOpt.text.replace(/\s+/g, " ").trim();
  const wl = wrong.toLowerCase();
  const cl = correct.toLowerCase();
  const issue = getPrimaryStemIssue(stemIssues, stemProfile)?.label || "vấn đề trong đề bài";

  if (/emotional intelligence/i.test(wl)) {
    return "Khuyên phát triển EQ mang tính phán xét — PM cần explain agile value (CI + early feedback), không lecture attitude.";
  }
  if (/(?:conduct|lead).*(?:retrospective|retro)|objective observer/i.test(wl) && /explain that teamwork|continuous improvement/i.test(cl)) {
    return "SME chưa tham gia team — giao retrospective/observer quá sớm; trước hết explain lợi ích teamwork và feedback loops.";
  }
  if (stemProfile?.id === "sme_agile_reluctance" && /retrospective|retro/i.test(wl)) {
    return "Giao vai ceremony khi SME chưa buy-in — cần explain value (đáp án đúng) trước khi assign retrospective.";
  }
  if (/micromanage|under the supervision of the project manager|deploy.*staff under/i.test(wl)) {
    return "Micromanage/supervise cứng contractor hoặc team — PMI khuyến khích set expectations và collaboration.";
  }
  if (/\binform them\b|\binform the (?:team|manager|stakeholder|customer)\b/i.test(wl) && /develop a solution|work together|facilitate/i.test(cl)) {
    return "Meet/chỉ để inform một chiều — đáp án đúng cần thảo luận hai chiều và cùng phát triển giải pháp.";
  }
  if (/design team manager|team manager/i.test(wl) && /designer/i.test(cl)) {
    return "Meet với manager thay vì người thực hiện trực tiếp (designer) — chưa giải quyết đúng trọng tâm kỹ thuật.";
  }
  if (/confirm.*(?:register|plan).*(?:completed|validated)/i.test(wl)) {
    return "Chỉ xác nhận artifact đã hoàn thành — không xử lý risk/vấn đề mới stakeholder vừa nêu.";
  }
  if (/directly with the stakeholder who raised/i.test(wl)) {
    return "Phân tích risk chỉ với stakeholder nêu ra — thiếu góc nhìn team; cần add vào register và reevaluate rộng hơn.";
  }
  if (/steering committee|senior management/i.test(wl) && !/escalat/i.test(q.text)) {
    return "Leo thang sớm lên committee — thử xử lý ở cấp PM/team trước.";
  }
  if (/visual task board|task board with all/i.test(wl) && /minimum viable product|\bmvp\b/i.test(cl)) {
    return "Task board chung chung — khi kick-off sản phẩm mới cần define MVP trước.";
  }
  if (/comprehensive product roadmap|commit to the full roadmap/i.test(wl) && /minimum viable product|\bmvp\b/i.test(cl)) {
    return "Roadmap/toàn bộ features quá sớm — PMBOK 8 ưu tiên MVP/value trước.";
  }
  if (/scope management plan/i.test(wl) && /traceability matrix|requirements traceability/i.test(cl)) {
    return "Scope management plan chưa truy vết requirement cụ thể — RTM giúp phân tích gap chính xác hơn.";
  }
  if (/continue with the sprint/i.test(wl) && /keep monitoring|monitor/i.test(cl)) {
    return "Tiếp tục sprint khi có dấu hiệu rủi ro — cần monitor chủ động hơn thay vì assume buffer đủ.";
  }
  if (/set expectations|agree on the requirements/i.test(cl) && /roll out|deploy|micromanage/i.test(wl)) {
    return "Triển khai/micromanage trước khi set expectations và thống nhất requirements với contractor.";
  }

  const wrongShort = wrong.slice(0, 72);
  const correctShort = correct.slice(0, 72);
  return `"${wrongShort}…" cùng nhóm ${actionType.label} nhưng lệch trọng tâm — "${correctShort}…" sát ${issue} hơn.`;
}

function buildPriorityExplanation(q, correctKeys, priorityCue, stemIssues, stemProfile) {
  if (priorityCue !== "FIRST" && priorityCue !== "NEXT") return null;

  const correctOpt = (q.options || []).find((o) => correctKeys.includes(o.key));
  const correctType = classifyAction(correctOpt?.text || "");
  const wrongOpts = (q.options || []).filter((o) => !correctKeys.includes(o.key));
  const wrongTypes = wrongOpts.map((o) => classifyAction(o.text)).filter(Boolean);
  const issueIds = new Set(stemIssues.map((i) => i.id));
  const stem = q.text.replace(/\s+/g, " ").trim().toLowerCase();
  const cueLabel =
    priorityCue === "FIRST"
      ? "**FIRST** (bước đầu tiên ngay lúc này)"
      : "**NEXT** (bước tiếp theo hợp lý trong chuỗi hành động)";

  const lines = [`Câu hỏi hỏi ${cueLabel}.`];

  // Sponsor mới + yêu cầu thay đổi phạm vi (Q184)
  if (
    /new project sponsor|new sponsor has been assigned/i.test(stem) &&
    ["meet_discuss", "stakeholder_engagement"].includes(correctType?.id)
  ) {
    lines.push(
      "Sponsor mới muốn thêm phạm vi — chuỗi đúng: **(1) gặp sponsor → review scope hiện tại + yêu cầu thay đổi → (2) đánh giá impact → (3) change request nếu cần → (4) rebaseline sau khi được duyệt**.",
      `${priorityCue} dừng ở bước (1): làm rõ trước khi rebaseline (B), briefing tiến độ (C), hay từ chối thẳng (D).`,
    );
    return lines.join(" ");
  }

  // Risk đã xảy ra — consult risk register (Q1)
  if (
    (issueIds.has("risk_materialized") || /planned risk response|not be available when needed/i.test(stem)) &&
    correctType?.id === "consult_artifact"
  ) {
    lines.push(
      "Risk đã materialize và đã có planned response trong risk register.",
      `${priorityCue} = **tra risk register và thực thi response đã lên kế hoạch** — trước khi tự ý sửa baseline (B), cắt scope (C), hay chỉ ghi lessons learned / cập nhật log (D).`,
    );
    return lines.join(" ");
  }

  // Lỗi truyền thông — acknowledge trước
  if (issueIds.has("communication_error") && correctType?.id === "apologize_accountable") {
    lines.push(
      "PM gây ra lỗi truyền thông — **FIRST** là thừa nhận và xin lỗi minh bạch ngay, trước ignore, che giấu (yêu cầu xóa email), hoặc chỉ xử lý riêng một phía.",
    );
    return lines.join(" ");
  }

  // Thành viên quá tải — listen trước
  if (issueIds.has("member_struggle") && correctType?.id === "listen_support") {
    lines.push(
      `${priorityCue} = **lắng nghe và hỗ trợ member trực tiếp** — trước team building chung, ghi risk register, hay đẩy member tự xử lý.`,
    );
    return lines.join(" ");
  }

  // Yêu cầu thay đổi — engagement hoặc change control trước rebaseline
  if (
    issueIds.has("change_requested") &&
    ["meet_discuss", "stakeholder_engagement", "change_control"].includes(correctType?.id)
  ) {
    lines.push(
      "Có yêu cầu thay đổi phạm vi/kế hoạch — phải **làm rõ và đánh giá impact** (hoặc submit change request) trước khi rebaseline hay chấp nhận/từ chối một chiều.",
    );
    return lines.join(" ");
  }

  // Wrong options reveal sequencing pattern
  const hasLateDoc = wrongTypes.some((t) =>
    ["document_first", "risk_register", "issue_log"].includes(t.id),
  );
  const hasPrematureBaseline = wrongTypes.some((t) => ["revise_plan", "change_scope"].includes(t.id));
  const hasIgnore = wrongTypes.some((t) => t.id === "wait_delay");

  if (correctType?.id === "consult_artifact" && hasLateDoc) {
    lines.push(
      `${priorityCue} ưu tiên **tham chiếu artifact/plan đã có và hành động theo đó** — ghi lessons learned hoặc cập nhật log thường là bước sau khi đã xử lý.`,
    );
    return lines.join(" ");
  }

  if (["meet_discuss", "stakeholder_engagement"].includes(correctType?.id) && hasPrematureBaseline) {
    lines.push(
      `${priorityCue} = **engagement/làm rõ với stakeholder trước** — chưa thống nhất scope/impact thì không rebaseline hay thay đổi baseline.`,
    );
    return lines.join(" ");
  }

  if (correctType?.id === "apologize_accountable" && hasIgnore) {
    lines.push(
      `${priorityCue} = **phản hồi có trách nhiệm ngay** — không ignore hay giả định mọi người tự hiểu.`,
    );
    return lines.join(" ");
  }

  if (correctType && hasLateDoc) {
    lines.push(
      `${priorityCue} ưu tiên **${correctType.label}** — ghi nhận/tài liệu hóa thường đến sau bước xử lý trực tiếp tình huống.`,
    );
    return lines.join(" ");
  }

  if (correctType && hasPrematureBaseline) {
    lines.push(
      `${priorityCue} ưu tiên **${correctType.label}** — sửa baseline/rebaseline chỉ sau khi đã phân tích, thống nhất, hoặc được duyệt qua change control.`,
    );
    return lines.join(" ");
  }

  if (correctType) {
    lines.push(
      `${priorityCue} chọn hành động **${correctType.label}** vì đây là bước logic tiếp theo trong chuỗi xử lý — trước các bước muộn hơn như ghi log, rebaseline, hay leo thang.`,
    );
    return lines.join(" ");
  }

  lines.push(
    `${priorityCue}: chọn hành động xử lý tình huống trực tiếp trước ghi nhận muộn hoặc thay đổi baseline chưa được phân tích.`,
  );
  return lines.join(" ");
}

function inferPriorityRejection(opt, q, correctKeys, priorityCue) {
  if (priorityCue !== "FIRST" && priorityCue !== "NEXT") return null;

  const wrongType = classifyAction(opt.text);
  const correctOpt = (q.options || []).find((o) => correctKeys.includes(o.key));
  const correctType = classifyAction(correctOpt?.text || "");
  const stem = q.text.replace(/\s+/g, " ").trim().toLowerCase();
  const optText = opt.text.replace(/\s+/g, " ").trim();

  if (/new project sponsor|new sponsor has been assigned/i.test(stem)) {
    if (wrongType?.id === "revise_plan") {
      return `Rebaseline quá sớm — ${priorityCue} cần gặp sponsor và review scope/yêu cầu thay đổi trước khi đụng baseline.`;
    }
    if (/briefing|demonstrate progress|seek further support/i.test(optText)) {
      return `Briefing tiến độ (C) không xử lý yêu cầu thay đổi phạm vi — ${priorityCue} cần align scope với sponsor mới trước.`;
    }
    if (/will not be included|not be included|refuse|decline|inform.*that.*will not/i.test(optText)) {
      return `Từ chối thay đổi mà chưa thảo luận với sponsor mới — vi phạm stakeholder engagement; ${priorityCue} là meet và làm rõ trước.`;
    }
  }

  if (/planned risk response|not be available when needed|risk has materialized/i.test(stem)) {
    if (wrongType?.id === "document_first" || /lessons learned|risk log to reflect|update.*log/i.test(optText)) {
      return `Ghi lessons learned / cập nhật log là bước sau khi đã thực thi planned response — không phải ${priorityCue}.`;
    }
    if (wrongType?.id === "revise_plan") {
      return `Sửa baseline/plan tùy tiện trước khi consult risk register — sai thứ tự ${priorityCue}.`;
    }
    if (wrongType?.id === "change_scope") {
      return `Cắt scope ngay khi risk materialize — quá nặng trước khi thử planned response từ risk register.`;
    }
  }

  if (
    wrongType?.id === "document_first" &&
    correctType &&
    !["consult_artifact", "document_first"].includes(correctType.id)
  ) {
    return `Ghi nhận/tài liệu hóa quan trọng nhưng thường **sau** bước xử lý trực tiếp — câu hỏi hỏi ${priorityCue}, ưu tiên ${correctType.label}.`;
  }

  if (
    wrongType?.id === "revise_plan" &&
    correctType &&
    ["meet_discuss", "stakeholder_engagement", "change_control", "consult_artifact"].includes(correctType.id)
  ) {
    return `Rebaseline/sửa plan quá sớm — ${priorityCue} cần ${correctType.label} trước khi thay đổi baseline.`;
  }

  return null;
}

function normalizeText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function describeStemSituation(q, stemIssues, stemProfile) {
  const primary = getPrimaryStemIssue(stemIssues, stemProfile);
  if (stemProfile?.summaryHint && primary?.id === "sme_reluctance") {
    return stemProfile.summaryHint.split("—")[0].trim();
  }
  if (stemProfile?.whyCorrect && primary) {
    return primary.label;
  }
  if (primary) return primary.label;
  if (stemProfile?.summaryHint) return stemProfile.summaryHint.split("—")[0].trim();

  const stem = normalizeText(q.text);
  const questionStart = stem.search(
    /\b(What should|What is|Which|How should|Who should|What would|What could|What must|What needs|What are|When should|Where should|Why should|During what|The project manager should|The best|Is this|Are these|Does the|Should the|Can the|Will the|Has the|Have the|Did the)\b/i,
  );
  const context = questionStart > 20 ? stem.slice(0, questionStart).trim() : stem.replace(/\?\s*$/, "");
  return context.endsWith(".") ? context : `${context}.`;
}

const ACTION_RATIONALES = {
  update_stakeholder_comms: (_stem, _opt, domains) =>
    `Stakeholder mới/thay đổi bối cảnh — PM phân tích stakeholder, xác định nhu cầu thông tin và cập nhật communications plan thay vì thêm ad hoc hay từ chối vì plan cũ chưa liệt kê (miền ${domains.join(" + ")}).`,
  consult_artifact: (_stem, opt) =>
    `PM tra artifact/plan đã có (${opt.includes("traceability") ? "RTM" : opt.includes("risk register") ? "risk register" : "tài liệu dự án"}) để quyết định có căn cứ, không phản ứng tùy hứng.`,
  set_expectations: () =>
    "PM set expectations và thống nhất requirements trước — nền tảng collaboration, tránh hiểu lệch sau này.",
  stakeholder_engagement: () =>
    "PM chủ động engagement stakeholder: làm rõ kỳ vọng, nhu cầu thông tin và thống nhất hướng xử lý.",
  meet_discuss: () =>
    "PM trao đổi trực tiếp để hiểu vấn đề và cùng tìm hướng xử lý — trước khi sửa baseline hay escalate.",
  develop_solution: () =>
    "PM làm việc trực tiếp với người liên quan để phát triển giải pháp, không chỉ thông báo một chiều.",
  listen_support: () =>
    "Member/stakeholder cần được lắng nghe và hỗ trợ cụ thể trước — servant leadership, Build an empowered culture.",
  apologize_accountable: () =>
    "PM thừa nhận lỗi và xin lỗi minh bạch — Lead accountably, giữ tin tưởng stakeholder.",
  change_control: () =>
    "Thay đổi scope/plan phải qua change control: đánh giá impact, approval — không tự ý implement.",
  facilitate_retro: () =>
    "Vấn đề lặp lại/quality — retrospective phân tích root cause và cải tiến hệ thống, không blame cá nhân.",
  define_mvp: () =>
    "Kick-off sản phẩm mới — define MVP trước để Focus on value, tránh commit toàn bộ roadmap quá sớm.",
  prioritize_value: () =>
    "PM ưu tiên theo business value/MVP — deliver giá trị sớm thay vì làm tất cả features cùng lúc.",
  enforce_wip_governance: () =>
    "Agile teams operate within agreed governance and WIP limits — PM explains limits stay in place; new work starts when capacity allows or priorities change.",
  add_to_register: () =>
    "Ghi nhận risk/issue mới vào register và reevaluate với team — quản trị rủi ro có hệ thống.",
  allow_empower: () =>
    "PM trao quyền team tự quyết trong phạm vi phù hợp — Build an empowered culture.",
  coach_develop: () =>
    "PM coach/phát triển năng lực thay vì thay thế hoặc đánh giá/punish — phát triển bền vững.",
  explain_agile_value: () =>
    "PM giải thích giá trị teamwork/Agile: continuous improvement và early feedback loops giúp expert đạt chất lượng cao trong môi trường collaborative — Build an empowered culture.",
  evaluate_individual: () =>
    "Đánh giá skill gap/root cause trước khi thay thế — hiểu nguyên nhân trước khi hành động.",
  ensure_compliance: () =>
    "PM đảm bảo tuân thủ policy/regulation — Governance và Lead accountably.",
  vendor_procurement: () =>
    "Quản lý vendor theo hợp đồng/procurement process — không bypass quy trình mua sắm.",
  escalate: () =>
    "Leo thang khi vấn đề vượt quyền PM hoặc cần quyết định cấp trên — sau khi đã thử xử lý trong phạm vi.",
  document_first: () =>
    "Ghi nhận/tài liệu hóa quyết định và kết quả — hỗ trợ traceability và lessons learned.",
  quality_embed: () =>
    "Embed quality: kiểm soát/prevent defect sớm, không để quality fail ở cuối pipeline.",
  work_with_party: () =>
    "PM phối hợp trực tiếp với bên liên quan để giải quyết vấn đề — collaboration thay vì chỉ đạo một chiều.",
};

function buildRationaleFromOptionText(optText, stem, domains, focusArea, correctType) {
  const t = optText.toLowerCase();
  const domainStr = domains.join(" + ");

  if (/stakeholder analysis.*update.*communication|update the communications management plan/i.test(t)) {
    return ACTION_RATIONALES.update_stakeholder_comms(stem, optText, domains);
  }
  if (/perform a stakeholder analysis|conduct a stakeholder analysis/i.test(t)) {
    return "PM phân tích stakeholder trước khi điều chỉnh engagement/truyền thông — quyết định dựa trên nhu cầu thực tế, không giả định.";
  }
  if (/refer to the requirements traceability matrix|requirements traceability matrix/i.test(t)) {
    return "RTM giúp truy vết requirement cụ thể và phân tích gap — chính xác hơn thảo luận chung chung.";
  }
  if (/consult the risk register|risk register for/i.test(t)) {
    return "Risk đã identify — PM consult risk register và thực thi planned response thay vì phản ứng ngẫu nhiên.";
  }
  if (/facilitate|workshop|brainstorm/i.test(t)) {
    return "PM facilitate thảo luận để team/stakeholder cùng giải quyết — Build an empowered culture.";
  }
  if (/continuous improvement|early feedback|teamwork fosters|explain that teamwork/i.test(t)) {
    return "PM coaching: giải thích collaboration trong Agile mang lại feedback sớm và cải tiến liên tục — expert thấy teamwork không compromise chất lượng (Build an empowered culture).";
  }
  if (/evaluate the impact|assess the impact|analyze the impact/i.test(t)) {
    return "Trước khi đồng ý thay đổi, PM đánh giá impact lên scope/schedule/cost/risk — không quyết định mù quáng.";
  }
  if (/change request|submit.*change|integrated change control/i.test(t)) {
    return ACTION_RATIONALES.change_control(stem, optText, domains);
  }
  if (/minimum viable product|\bmvp\b/i.test(t)) {
    return ACTION_RATIONALES.define_mvp(stem, optText, domains);
  }

  if (correctType && ACTION_RATIONALES[correctType.id]) {
    return ACTION_RATIONALES[correctType.id](stem, optText, domains, focusArea);
  }
  if (correctType) {
    return `PM ${correctType.label} để xử lý trực tiếp trọng tâm câu hỏi — phù hợp miền ${domainStr}, Focus Area ${focusArea} (PMBOK 8).`;
  }
  return `Hành động này giải quyết trực tiếp vấn đề trong đề — align miền ${domainStr} (${focusArea}, PMBOK 8).`;
}

function buildSpecificCorrectRationale(q, correctKeys, correctType, stemIssues, stemProfile, domains, focusArea) {
  const correctOpt = (q.options || []).find((o) => correctKeys.includes(o.key));
  const optText = normalizeText(correctOpt?.text || "");
  const stem = normalizeText(q.text);

  if (stemProfile?.whyCorrect) return stemProfile.whyCorrect;
  return buildRationaleFromOptionText(optText, stem, domains, focusArea, correctType);
}

function buildContextualSummary(q, correctKeys, correctType, stemProfile, stemIssues, domains, focusArea) {
  if (stemProfile?.summaryHint) return stemProfile.summaryHint;
  return buildSpecificCorrectRationale(q, correctKeys, correctType, stemIssues, stemProfile, domains, focusArea);
}

function buildContextualWhy(q, correctKeys, correctType, stemProfile, stemIssues, domains, focusArea, priorityCue, agile) {
  const correctOpt = (q.options || []).find((o) => correctKeys.includes(o.key));
  const optText = normalizeText(correctOpt?.text || "");
  const situation = describeStemSituation(q, stemIssues, stemProfile);
  const rationale = buildSpecificCorrectRationale(
    q,
    correctKeys,
    correctType,
    stemIssues,
    stemProfile,
    domains,
    focusArea,
  );
  const parts = [];

  const situationText = situation.endsWith(".") ? situation : `${situation}.`;
  parts.push(`Bối cảnh: ${situationText}`);
  parts.push(`Đáp án **${correctKeys.join(", ")}** — "${optText}" — phù hợp vì ${rationale}`);

  if (priorityCue === "FIRST" || priorityCue === "NEXT") {
    const priorityText = buildPriorityExplanation(q, correctKeys, priorityCue, stemIssues, stemProfile);
    if (priorityText) parts.push(priorityText);
  } else if (agile) {
    parts.push("Agile/Hybrid: ưu tiên empowered culture, collaboration và continuous improvement.");
  }

  return parts.join(" ");
}

function inferWrongReason(opt, q, correctKeys, patternRejectFn, priorityCue) {
  const patternReason = patternRejectFn(opt);
  if (patternReason) return patternReason;

  const priorityReason = inferPriorityRejection(opt, q, correctKeys, priorityCue);
  if (priorityReason) return priorityReason;

  const chartOptionRejection = getChartOptionRejection(q, opt.key);
  if (chartOptionRejection) return chartOptionRejection;

  const correctOpt = (q.options || []).find((o) => correctKeys.includes(o.key));
  if (!correctOpt) return null;

  const wrongType = classifyAction(opt.text);
  const correctType = classifyAction(correctOpt.text);
  const stemProfile = getChartStemProfile(q) || matchStemProfile(q.text);
  const stemIssues = extractStemIssues(q.text);

  if (wrongType && correctType && wrongType.id === correctType.id) {
    return differentiateSameGroupRejection(opt, correctOpt, wrongType, q, stemIssues, stemProfile);
  }

  if (wrongType) {
    return contrastRejection(wrongType, correctType, stemProfile, stemIssues, opt.text, correctOpt.text);
  }

  const t = opt.text.toLowerCase();
  const issue = getPrimaryStemIssue(stemIssues, stemProfile)?.label || "vấn đề trong đề bài";
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
  getPrimaryStemIssue,
  buildContextualSummary,
  buildContextualWhy,
  buildPriorityExplanation,
  buildSpecificCorrectRationale,
  inferWrongReason,
  STEM_PROFILES,
};
