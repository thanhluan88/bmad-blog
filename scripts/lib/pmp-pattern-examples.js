/**
 * Short VI stem → correct action for trap-pattern teach pages.
 * Trap text comes from the pattern pack; examples stay shared across
 * Full Bank / LWA / Sai:1 generators.
 */
const EXAMPLES = {
  "money-forecast": {
    stem: "CPI &lt; 1; sponsor hỏi chi phí đến cuối dự án / vendor cần đóng hợp đồng.",
    do: "Cập nhật forecast / EAC, hành động theo EVM; đóng contract khi admin-complete.",
  },
  "agile-mvp": {
    stem: "Sprint có impediment / SH đòi thêm mid-iteration; PO vắng.",
    do: "Remove impediment (escalate nếu cần); PO owns backlog; bảo vệ iteration — không hấp thụ mid-sprint.",
  },
  "change-control": {
    stem: "Change request đã submit / work ngoài baseline / feature mới lớn.",
    do: "Impact assessment → Integrated Change Control (CR/CCB) — không absorb im lặng.",
  },
  "opa-improve": {
    stem: "Ước lượng lệch mãi / policy mơ hồ / nhiều change đã xong nhưng không rút bài học.",
    do: "Cập nhật OPA, template, rewrite policy — hành động được, không chỉ archive.",
  },
  "risk-cadence": {
    stem: "Risk đã materialize / luật mới / risk thiếu trong báo cáo.",
    do: "Tra risk register → implement planned response; identify/assess nếu mới.",
  },
  "verify-scope": {
    stem: "Team bảo ‘xong rồi’ vì đúng hạn; sponsor chưa confirm acceptance.",
    do: "Review scope / requirements / acceptance criteria trước khi claim success.",
  },
  "hybrid-tailor": {
    stem: "Dự án nhỏ/low-risk nhưng bị ép copy nghi thức megaproject (hoặc zero governance).",
    do: "Tailor vừa đủ; hybrid OK; ước lượng adaptive khi bất định.",
  },
  "adapt-comms": {
    stem: "Team đa văn hóa / virtual; ai đó không đọc email dài.",
    do: "Đổi kênh/phương pháp theo preference; giao thức nhạy văn hóa — không blast one-size.",
  },
  "team-stage": {
    stem: "Storming, cãi nhau to / workspace ồn / thiếu ownership.",
    do: "Map Tuckman stage; EI/self-reg; PM sở hữu môi trường; facilitate ownership.",
  },
  "governance-roles": {
    stem: "Không rõ ai quyết; steering sắp họp; RACI/RAM mơ hồ.",
    do: "Làm rõ roles (RAM); chuẩn bị evidence governance; decision log.",
  },
  "engage-plan": {
    stem: "SH kháng cự / xung đột lợi ích; PM muốn escalate ngay theo cảm tính.",
    do: "Xem engagement plan; engage đúng chiến lược đã ghi — không freestyle.",
  },
  "competency-develop": {
    stem: "Intern / skill gap / onboarding yếu; delivery chậm vì thiếu năng lực.",
    do: "Gap analysis + develop/remediate (HR/mentor) — không blame/fire trước.",
  },
  "transparency-news": {
    stem: "Tin xấu / rumor / layoff; morale sụp; thông tin còn thiếu.",
    do: "Chia sẻ facts đã biết + tạo thảo luận mở — không im lặng hay hứa chắc chắn giả.",
  },
  "coach-conflict": {
    stem: "2 engineer conflict; PM đã nghe riêng từng bên.",
    do: "Facilitate joint problem-solving session — không escalate sớm / không chọn hộ.",
  },
  resilience: {
    stem: "Timeline + budget căng; SH lo lắng; bất định cao.",
    do: "Xây approach resilient (anticipate/respond/recover) — không claim ‘xóa hết risk’.",
  },
  "own-mistake": {
    stem: "Gửi nhầm email / lỗi nhìn thấy rõ; hậu quả đã xảy ra.",
    do: "Acknowledge + xin lỗi về hậu quả — không giấu hay đổ lỗi tool.",
  },
  "knowledge-transfer": {
    stem: "Người key sắp nghỉ / handover gấp; domain khó.",
    do: "Ưu tiên KT người-kề-người ngay — không trì hoãn vì ‘đã có docs’.",
  },
  "culture-change": {
    stem: "Org muốn ‘đổi văn hóa agile’ bằng slogan trên poster.",
    do: "Hoạt động đổi mới có mục tiêu + vision rõ với sponsor/team — redesign process/structure.",
  },
  "quality-sampling": {
    stem: "Cần chứng minh chất lượng; khối lượng lớn; đòi inspect 100%.",
    do: "Dùng sampling thống kê / chứng nhận độc lập khi phù hợp — không skip bằng chứng.",
  },
  "charter-authorize": {
    stem: "Team đã bắt đầu làm; chưa có charter / chưa authorize rõ.",
    do: "Tạo project charter để authorize và align — không kickoff miệng thôi.",
  },
  "plan-translate": {
    stem: "Có plan đẹp nhưng team không biết kiểm soát ngày-ngày thế nào.",
    do: "Dịch plan thành checklist/audit/control actionable — không để plan trên kệ.",
  },
  "compliance-ethics": {
    stem: "Local muốn lệch ethics/HQ để kịp deadline.",
    do: "Validate + escalate; không bao giờ authorize exception ethics/regs.",
  },
  "compliance-audit": {
    stem: "Nhiều quy định; nghi có yêu cầu bị bỏ sót; cần chứng minh chuẩn.",
    do: "Lên lịch audit / chứng nhận độc lập — không assume đã compliant.",
  },
  "compliance-research": {
    stem: "Yêu cầu compliance chưa rõ; sponsor bảo ‘làm đi đã’.",
    do: "Research requirement (BA) trước khi authorize work — không làm mù.",
  },
  "benefits-metrics": {
    stem: "Báo cáo chỉ khoe SPI xanh; chưa đo value/outcome cho SH.",
    do: "Đo value đạt được (Kano/survey/benchmark) — tránh vanity metrics.",
  },
  "identify-stakeholders": {
    stem: "Ai đó muốn sửa distribution list theo ‘cảm giác’ trước họp lớn.",
    do: "Phân tích / cập nhật stakeholder register trước — không edit list theo gut.",
  },
};

module.exports = { EXAMPLES };
