# PMP Glossary — Khái niệm đã học (Session Study)

> Tài liệu tra cứu nhanh các thuật ngữ PMP/PMBOK 8 đã ôn trong phiên học từ vựng.  
> **Cách dùng:** Ctrl+F theo từ khóa tiếng Anh hoặc tiếng Việt.

---

## Mục lục

1. [Tài chính & Rủi ro](#1-tài-chính--rủi-ro)
2. [Quản lý rủi ro (Risk)](#2-quản-lý-rủi-ro-risk)
3. [Stakeholder & Giao tiếp](#3-stakeholder--giao-tiếp)
4. [Team, Leadership & Tổ chức](#4-team-leadership--tổ-chức)
5. [Organisational Change Management](#5-organisational-change-management)
6. [Development Approach & Agile](#6-development-approach--agile)
7. [Schedule, Cost & EVM](#7-schedule-cost--evm)
8. [Kỹ thuật & Công cụ](#8-kỹ-thuật--công-cụ)
9. [Governance & Quality](#9-governance--quality)
10. [Metrics, Bias & Phân tích](#10-metrics-bias--phân-tích)
11. [Business Environment & Sustainability](#11-business-environment--sustainability)
12. [Bảng so sánh nhanh](#12-bảng-so-sánh-nhanh)

---

## 1. Tài chính & Rủi ro

### Hedging
| | |
|---|---|
| **Nghĩa** | Phòng ngừa rủi ro tài chính (đặc biệt tỷ giá) bằng công cụ/chiến lược bù trừ biến động giá |
| **PMP** | Risk response cho rủi ro tài chính; PM phối hợp finance/treasury |
| **Ví dụ** | Forward contract, currency swap khi trả supplier nhiều loại tiền |
| **Mẹo đề** | *hedging strategies* + exchange rate → financial risk response |

### Deplete
| | |
|---|---|
| **Nghĩa** | Làm cạn kiệt, tiêu hao dần, dùng hết (contingency reserve, funds, supplies) |
| **PMP** | *"reserves are quickly depleted"* → quỹ dự phòng bị dùng hết nhanh |
| **Đối lập** | Replenish (bổ sung lại) |

### Exposure
| | |
|---|---|
| **Nghĩa** | Mức độ phơi nhiễm trước rủi ro/tác động — càng chậm xử lý, exposure càng tăng |
| **PMP** | Financial exposure, currency exposure, risk exposure |
| **≠ Impact** | Exposure = đang đứng trong vùng rủi ro; Impact = hậu quả nếu xảy ra |
| **Mẹo đề** | *delays will increase exposure* → trì hoãn làm rủi ro tài chính kéo dài |

### Offset
| | |
|---|---|
| **Nghĩa** | Bù đắp, bù trừ — A giảm tác động của B |
| **Ví dụ** | Cost savings offset costs; reserves offset penalties |
| **Bẫy đề** | *Savings will offset compression* — thường lạc quan sai |
| **≠ Hedge** | Hedge = phòng rủi ro tài chính |

---

## 2. Quản lý rủi ro (Risk)

### Risk
| | |
|---|---|
| **Nghĩa** | Sự kiện/điều kiện **không chắc chắn** có thể ảnh hưởng mục tiêu dự án (tích cực hoặc tiêu cực) |
| **Ghi nhận** | Risk register (chưa xảy ra) |
| **Công thức** | Risk = Uncertainty + Impact |

### Threat
| | |
|---|---|
| **Nghĩa** | Rủi ro **tiêu cực** — gây hại nếu xảy ra |
| **Response** | Avoid, Mitigate, Transfer, Accept |
| **Ví dụ** | Vendor delay, tỷ giá bất lợi, defect tăng |

### Opportunity
| | |
|---|---|
| **Nghĩa** | Rủi ro **tích cực** — có lợi nếu xảy ra |
| **Response** | Exploit, Enhance, Share, Accept |
| **Ví dụ** | Material cost giảm, competitor rút sản phẩm |

### Risk vs Issue
| | Risk | Issue |
|---|------|-------|
| Thời điểm | Chưa xảy ra | **Đã** xảy ra |
| Artifact | Risk register | Issue log |
| Hành động | Planned response | Resolve ngay |

### Risk Response Strategies (Threat & Opportunity)

Sau identify & analyze → chọn response trong risk register. Risk **materialize** → **planned response** trước khi chỉ ghi log.

#### Threat — 4 chiến lược

| Strategy | Mục tiêu | Ví dụ PMP |
|----------|----------|-----------|
| **Avoid** | Đổi plan → loại bỏ threat | Bỏ scope; đổi vendor/công nghệ |
| **Mitigate** | Giảm probability và/hoặc impact | Cross-train, backup, testing |
| **Transfer** | Chuyển impact cho bên thứ ba | Insurance, fixed-price contract |
| **Accept** | Chấp nhận — passive hoặc active + reserve | Contingency fund, workaround |

| Lưu ý | |
|-------|---|
| **Mitigate** | Hay gặp nhất trong đề; còn **residual risk** |
| **Transfer** | Không xóa rủi ro hoàn toàn |
| **Accept** | ≠ ignore — active accept có contingency |

#### Opportunity — 4 chiến lược

| Threat | Opportunity | Ý chính |
|--------|-------------|---------|
| Avoid | **Exploit** | Đảm bảo opportunity xảy ra |
| Mitigate | **Enhance** | Tăng chance/benefit |
| Transfer | **Share** | Chia lợi với partner |
| Accept | **Accept** | Sẵn sàng nắm nếu xảy ra |

#### Residual & Reserve

| Thuật ngữ | Nghĩa |
|-----------|--------|
| **Residual risk** | Rủi ro còn lại sau response |
| **Secondary risk** | Rủi ro mới do chính response |
| **Contingency reserve** | Known unknowns — thường trong baseline |
| **Management reserve** | Unknown unknowns — thường ngoài baseline |

#### Mẹo đề

| Keyword | Strategy |
|---------|----------|
| Insurance, fixed-price | **Transfer** |
| Training, backup | **Mitigate** |
| Remove scope | **Avoid** |
| Contingency fund | **Accept** (active) |
| Risk đã xảy ra | Implement **planned response** |

### Contingency Reserve
| | |
|---|---|
| **Nghĩa** | Dự phòng ứng phó rủi ro — implement risk response hoặc xử lý risk event nếu xảy ra |
| **PMBOK 8** | *Estimate Costs* p.63 · *Contingency reserve* p.266 |
| **Cho** | **Known unknowns** — rủi ro đã identify (risk register) |

**Contingency vs Management reserve:**
| | Contingency | Management |
|---|-------------|------------|
| Rủi ro | Đã biết (identified) | Unknown unknowns |
| Baseline | Thường **trong** | Thường **ngoài** |
| Ai dùng | PM (risk plan) | Management approval |

**Q68:** Soil instability *may require* foundation work → **Contingency reserve** ✓

**Sai ✗:** +15% all estimates (blanket) · Management reserve (đã identify) · Update baseline (coi chắc chắn)

**Signal:** *potential / may require* → contingency · *unforeseen / unknown* → management reserve

---

## 3. Stakeholder & Giao tiếp

### Stem (Question stem)
| | |
|---|---|
| **Nghĩa** | Phần mô tả tình huống + câu hỏi chính (trước A/B/C/D) |
| **Mẹo đề** | Đọc **câu cuối** stem → tìm FIRST / NEXT / NOT / BEST |

### Cue
| | |
|---|---|
| **Nghĩa** | **Tín hiệu, manh mối, gợi ý** — dấu hiệu (lời hoặc không lời) để hiểu/hành động |
| **Phát âm** | /kjuː/ — *kiu* |
| **≠ Queue** | Queue = hàng đợi · Cue = tín hiệu |

**Các dùng PMP:**
| Cụm | Ý | PMP |
|-----|---|-----|
| **Context cues** | Ngữ cảnh — im lặng, thứ bậc, gián tiếp | Cultural awareness (Q78) |
| **Social cues** | Tone, body language | EI, read the room |
| **Visual cues** | Board/chart trực quan | Kanban, information radiator |
| **Take cue from** | Làm theo chỉ dẫn ai | Align sponsor/governance |
| **Exam cue** | Keyword gợi đáp án trong stem | ≈ signal / Keywords |

**High-context vs low-context:** High-context = nhiều ý trong ngữ cảnh · Low-context = nói thẳng (US direct norms)

**Mẹo đề ✓:** Multi-country + differing styles → cultural awareness · Stakeholder indirect → probe, adapt comms  
**Bẫy ✗:** Chỉ explicit words, ignore context cues

### Salience Model
| | |
|---|---|
| **Nghĩa** | Phân loại stakeholder theo **Power, Legitimacy, Urgency** |
| **Definitive** | P + L + U → ưu tiên cao nhất |
| **≠ Grid model** | Grid = authority × **interest** |
| **≠ Influence model** | Upward, downward, outward, sideward |
| **Mẹo đề** | *power, urgency, legitimacy* → Salience |

### Rapport
| | |
|---|---|
| **Nghĩa** | **Mối quan hệ tin cậy, hòa hợp** — hiểu nhau, giao tiếp dễ với stakeholder/team |
| **Phát âm** | /ræˈpɔːr/ — *ra-por* |
| **PMBOK 8** | EI Social Skills: *establishing rapport*, build trust |
| **Gắn** | Referent power · active listening · stakeholder engagement |

**Build rapport:** 1-on-1 · informal meetings · active listening · adapt communication style

**Mẹo đề:**
| ✓ | ✗ |
|---|-----|
| Rapport + engagement plan | Rapport bằng **bypass change control** |
| Adapt comms + **compliance** (Q359→A) | Chỉ informal meetings khi cần compliance |
| Change request dù sponsor pressure (Q639→C) | Add scope informally *for rapport* |

### Storytelling
| | |
|---|---|
| **Nghĩa** | Kể chuyện có ngữ cảnh để truyền lessons learned / knowledge transfer |
| **PMP** | Làm bài học relatable & memorable; bổ sung repository |
| **Đúng khi** | Lessons đã ghi, cần team nhớ & áp dụng; handover ops |
| **Sai khi** | Retrospective superficial → cần **categorize patterns**, không phải storytelling |

### Excerpt
| | |
|---|---|
| **Nghĩa** | **Đoạn trích ngắn** — phần rút gọn từ tài liệu/báo cáo dài |
| **Phát âm** | /ˈeksərpt/ — *ék-sơpt* (n.) · /ɪkˈsɜːrpt/ — *ik-sơpt* (v.) |
| **≈** | Summary · extract · relevant section |
| **PMP** | **Tailor communications** — PM chuẩn bị excerpt phù hợp audience |
| **≠ Full report** | Excerpt = rút gọn có chủ đích · WPR = chi tiết đầy đủ |
| **≠ Brief mention** | Brief mention trong report ≠ xử lý đủ formal process |

| Signal | Đáp |
|--------|-----|
| Executives concise · teams task-level detail (Q418) | **Tailor** artifacts by group — consistent data → A |
| Reports too technical · business questions (Q34) | **Update comms plan** — tailor format → C |
| Raw logs · stakeholder extract themselves (Q34 D) | ✗ — PM tailor, không dump data |
| Single report · extract what they need (Q418 B) | ✗ — one-size-fits-all |
| Brief mention of new risks (Q982) | **Document & analyze** ngay → C |

**Bẫy ✗:** Raw logs · Single mega-report · Brief mention only · Separate reports không align

### Cadence
| | |
|---|---|
| **Nghĩa** | Nhịp độ, chu kỳ lặp lại đều đặn (họp, review, giao hàng) |
| **PMP** | Meeting cadence, delivery cadence, cadence points |
| **Tăng cadence** | Làm thường xuyên hơn (monthly → weekly) |

### Discord
| | |
|---|---|
| **Nghĩa** | Bất hòa, mâu thuẫn giữa người/nhóm |
| **PMP** | Facilitate, understand perspectives — không punish |
| **≈** | Conflict, disagreement |

### Compromising · Compromise / Reconcile
| | |
|---|---|
| **Nghĩa** | **Đi giữa** — mỗi bên bỏ bớt để chấp nhận giải pháp tạm thời |
| **Phát âm** | /ˈkɒmprəmaɪzɪŋ/ — *cóm-prơ-maizing* |
| **PMP (Thomas-Kilmann)** | **Compromise / Reconcile** — kỹ thuật conflict resolution |
| **Kết quả** | **Lose / Lose** (partial satisfaction) |
| **PMI ưu tiên** | **Collaborate / problem-solve** (Win/Win) |
| **≠ Collaborating** | Collaborate = tối ưu chung · Compromise = giải pháp giữa |
| **≠ Reconcile (data)** | Reconcile discrepancies = đối chiếu số liệu |
| **≠ without compromising quality** | Không hy sinh chất lượng — khác conflict mode |

**5 techniques:** Avoid · Accommodate · **Compromise** (Lose/Lose) · Force · **Collaborate** ★ (Win/Win)

| Signal | Đáp |
|--------|-----|
| compromise/reconcile approach (Q179) | **Listen & acknowledge** trước → B |
| full support · effective resolution (Q211) | **Constructive dialogue** — không compromise vội → C |
| scope disagreement · agreement (Q522) | **Consensus** — không press compromise → C |
| PM demonstrates technique (Q150) | **Collaborate** — không compromise/reconcile → A |
| compromise design + underlying needs (Q23) | Bẫy từ → **Collaborating** → B |
| quality dispute · split costs (Q569/Q671) | **Review acceptance criteria** — không split bill |

**Bẫy ✗:** Negotiate compromise satisfies all · Split costs equally · Press for compromise · Stem có chữ *compromise* trong đáp án thường là distractor

### Scarce
| | |
|---|---|
| **Nghĩa** | **Khan hiếm, thiếu hụt** — không đủ so với nhu cầu |
| **Scarcity** | Danh từ — tình trạng khan hiếm |
| **PMBOK 8** | Nguồn conflict: *scarce resources*, scheduling priorities, work styles |

**Stem signal:** Shared specialized resources · competing priorities · resource conflicts between workstreams

**PM làm gì:**
1. Identify requirements + **verify availability** với functional managers
2. Resource calendar / RBS
3. **Prioritize** — critical path, backlog (PO), MVP
4. Resource leveling / smoothing
5. **Facilitate** conflict — negotiate có cấu trúc

**Bẫy ✗:** Ad hoc negotiation giữa leads · Extend buffer không đổi assumptions · Xin funding trước khi analyze demand · Assert authority vội

### Interdisciplinary · Multidisciplinary
| | |
|---|---|
| **Interdisciplinary** | **Liên ngành** — nhiều discipline **tích hợp & collaborate** |
| **Multidisciplinary** | **Đa chuyên môn** — trên đề PMP thường ≈ interdisciplinary |
| **PMBOK 8** | Interdisciplinary approach → holistic, innovative solutions |

**Khác biệt tinh tế:** Multidisciplinary có thể silo · Interdisciplinary = **integrate** perspectives

**Thách thức:** Design conflicts · poor integration · culture/time zones · jargon

**PM làm gì:**
| Signal | Đáp |
|--------|-----|
| Conflicts about design (Q304) | **Facilitate** team discussions → D |
| Global multidisciplinary + culture (Q331) | **Culturally responsive communication protocol** → C |
| Interdisciplinary + tight deadline (Q844) | **MVP** → C |

**Bẫy ✗:** Escalate functional managers only · Single default platform/time zone · Chỉ add headcount

### Cohort
| | |
|---|---|
| **Nghĩa** | Nhóm người cùng đặc điểm/thời điểm |
| **Ví dụ** | Training cohort, pilot cohort, phased rollout |
| **PMP** | Incremental delivery — giao từng nhóm |

### Folk / Folks / Amigos
| | |
|---|---|
| **Folks** | Người, mọi người (informal EN) ≈ people, team |
| **Amigos** | Bạn bè, đồng nghiệp (ES, informal trong đề EN) ≈ **folks**, colleagues |
| **Folk wisdom** | Kinh nghiệm truyền miệng — thường sai vs data |
| **Ví dụ** | *folks on the ground*, *my amigos on the team*, *right folks in the room* |
| **PMP** | Amigos/folks = người làm việc — engage, collaborate |

### Nitty-gritty
| | |
|---|---|
| **Nghĩa** | **Chi tiết cốt lõi, thực tế** — phần làm việc cụ thể, không high-level |
| **Idiom** | Luôn dùng cặp **nitty-gritty** |
| **≠ Strategic** | Strategic = vision · Nitty-gritty = execution details |

**Collocations:** *get into the nitty-gritty* · *down to the nitty-gritty* · *focus on the nitty-gritty of requirements*

**Gritty riêng:** *grit* = kiên trì (khác idiom) · literal = thô/cát

**PMP:** Facilitate xuống details — elicitation, WBS, acceptance criteria — không chỉ charter/vision

### Snitches get stitches
| | |
|---|---|
| **Nghĩa** | Thành ngữ slang: “tố cáo → bị trả thù” (stitches = khâu vết thương) |
| **Snitch** | Kẻ tố cáo / báo sai phạm |
| **Trong đề** | Văn hóa team **độc hại** — sợ báo cáo vấn đề |
| **≠ PMP** | Psychological safety · transparency · report without fear |

**PM đúng:** Foster safe environment · stop retaliation · encourage reporting · governance

**Sai ✗:** Punish người raise concern · cover up vì “loyalty” · coercive culture

### Undermine
| | |
|---|---|
| **Nghĩa** | **Làm suy yếu, làm lung lay** — phá vỡ gián tiếp trust, credibility, adoption, confidence |
| **≠ Destroy** | Undermine = ăn mòn dần; destroy = phá hủy hoàn toàn |

**Collocations đề PMP:**
| Cụm | Ý |
|-----|---|
| undermine **transparency** | Che/chỉnh metrics → sai |
| undermine **adoption** | Ignore customer feedback → sai |
| undermine **confidence** | Combined risks, deferred engagement |
| undermine **trust / alignment** | Stakeholder resistance, hidden info |

**Mẹo đề:** Đề cảnh báo *"could undermine…"* → chọn hành động **bảo vệ** trust, transparency, adoption — không defer, không modify metrics, không ignore feedback.

### Entail
| | |
|---|---|
| **Nghĩa** | **Đòi hỏi, kéo theo** — hành động A **nhất thiết** bao gồm hệ quả B (logical consequence) |
| **≠ Include** | Include = có trong danh sách · Entail = **bắt buộc** phải xảy ra |
| **≠ Imply** | Imply = gợi ý · Entail = hệ quả logic rõ hơn |

**Collocations đề PMP:**
| Cụm | Ý |
|-----|---|
| entail **change request** | Scope change → integrated change control |
| entail **training** | Triển khai mới → OCM/ADKAR |
| entail **stakeholder engagement** | Quyết định lớn → engage liên quan |
| entail **higher costs / schedule impact** | Phân tích trade-off trước khi commit |
| *What does this entail?* | PM liệt kê impact, risks, next steps |

**Mẹo đề:** *"will entail…"* → không ignore hệ quả · Assess impact, update plans, communicate.

---

## 4. Team, Leadership & Tổ chức

### Demoralization
| | |
|---|---|
| **Nghĩa** | Suy sụp tinh thần, mất động lực (overworked and demoralized) |
| **PM làm** | Engage, acknowledge input, empower — **không** ép overtime hay replace người |
| **Đối lập** | Morale boost, motivation, engagement |

### Hawthorne Effect
| | |
|---|---|
| **Nghĩa** | Hiệu ứng "được quan sát/chú ý → làm tốt hơn" — không chỉ do thay đổi điều kiện |
| **PMP** | Coaching, 1-on-1, engagement có giá trị thật |
| **Cảnh báo** | Đừng nhầm mọi cải thiện đều do tool/process mới |

### Theory X (McGregor)
| | |
|---|---|
| **Nghĩa** | Giả định tiêu cực: người lười, cần ép, micromanage |
| **PMP** | Thường là đáp án **sai** (enforce overtime, punish) |

### Theory Y (McGregor)
| | |
|---|---|
| **Nghĩa** | Giả định tích cực: tự chủ, tìm trách nhiệm, cần empower |
| **PMP** | Align Agile, coaching, empowered culture — thường **đúng** |

### Theory Z (Ouchi)
| | |
|---|---|
| **Nghĩa** | Cam kết dài hạn, consensus, loyalty, quality circles (văn hóa Nhật) |
| **Keyword** | Lifetime employment, collective decision, job security |

### Leadership Styles — 8 phong cách

| Style | Định nghĩa | PMP |
|-------|------------|-----|
| **Laissez-faire** | Hands-off — team tự quyết | ✗ Sai khi cần facilitate/coach |
| **Transactional** | Management by exception; focus thành tích/reward | Carrot/stick — ít phù hợp Agile |
| **Servant leader** | Phục vụ growth, learning, autonomy, well-being | ✓ **Hay đúng** — Agile, Scrum |
| **Transformational** | Inspirational motivation — vision | ✓ Truyền cảm hứng, change |
| **Charismatic** | Năng lượng cao, tự tin, conviction mạnh | Tốt nhưng phụ thuộc cá nhân |
| **Interactional** | Kết hợp transactional + transformational + charismatic | Linh hoạt theo tình huống |
| **Distributed** | Team quyết định dân chủ | ✓ Self-organizing team |
| **Autocratic** | Một người quyết định | ✗ **Thường sai** — ≈ Theory X |

**Mẹo đề:** Agile/impediment → **Servant leader** · Vision → **Transformational** · Self-organizing → **Distributed** · Enforce alone → **Autocratic** ✗

### Democratic
| | |
|---|---|
| **Nghĩa** | Dân chủ — team tham gia quyết định, thảo luận, đồng thuận |
| **Gắn với** | **Distributed** leadership |
| **PM role** | **Facilitate** — không dictate (≠ laissez-faire) |
| **Đối lập** | **Autocratic** |
| **PMP Agile** | ✓ Self-organizing team |

### Types of Power — 14 loại quyền lực

| Power | Cách dùng | PMP |
|-------|-----------|-----|
| **Positional** | Vị trí chính thức | PM title |
| **Informational** | Thu thập & phân phối thông tin | ✓ Transparency |
| **Referent** | Uy tín, credibility | ✓ Trust |
| **Situational** | Quyền lực tình huống (crisis) | Tạm thời |
| **Personal** | Charm, sức hút | Charismatic |
| **Relational** | Networking, alliances | Stakeholder |
| **Expert** | Skill, experience | ✓ SME — hay đúng |
| **Reward** | Praise, bonus | Transactional |
| **Coercive** | Discipline, punish | ✗ Thường sai |
| **Ingratiating** | Flattery | ✗ |
| **Pressure-based** | Limit choices | ✗ |
| **Guilt-based** | Impose obligation | ✗ |
| **Persuasive** | Lập luận thuyết phục | ✓ Democratic |
| **Avoiding** | Refuse to participate | ✗ ≈ laissez-faire |

**Power hỗ trợ democratic:** Expert, Referent, Informational, Persuasive  
**Tránh:** Coercive, Pressure-based, Guilt-based, Avoiding

### Swarm / Swarming
| | |
|---|---|
| **Nghĩa** | Cả team tập trung cùng lúc vào một blocker để giải quyết nhanh |
| **Đúng khi** | Vấn đề **trong quyền** team |
| **Sai khi** | *Outside team's authority* → **Escalate to sponsor** |

### Humility
| | |
|---|---|
| **Nghĩa** | Khiêm tốn — biết giới hạn, lắng nghe, thừa nhận sai |
| **PMP** | Acknowledge & apologize; servant leadership |
| **Đối lập** | Arrogance, **victim mentality**, hide mistakes |

### Victim / Victim mentality
| | |
|---|---|
| **Nghĩa** | **Nạn nhân** — PMP: PM đóng vai bị hại, không chủ động xử lý |
| **Mindset đề** | *PM là leader, không victim* — Lead accountably |
| **≠ Humility** | Humility = thừa nhận sai của mình · Victim = đổ lỗi người khác/hoàn cảnh |

**Hành vi victim ✗ (đáp án sai):**
| Hành vi | Ví dụ |
|---------|-------|
| Blame others | *"It wasn't my fault"* |
| Helpless / passive | *"There's nothing I can do"* |
| Wait without action | Assume sponsor sẽ fix |
| Deflect | Hide mistake, cover up |

**PM đúng:** Proactive · Own mistakes (acknowledge & apologize) · Collaborate · Escalate khi cần (sau analyze)

**Khác:** *fall victim to* scope creep / optimism bias → PM phải change control / dùng data

---

## 5. Organisational Change Management

### Organisational Change Management (OCM)
| | |
|---|---|
| **Nghĩa** | Quản lý thay đổi tổ chức — giúp con người **chấp nhận và áp dụng** thay đổi do dự án mang lại |
| **PM role** | Communicate, engage stakeholders, assess readiness, support adoption |
| **Change vs Transition** | **Change** = tình huống mới · **Transition** = hành trình cảm xúc của con người |

**5 Change Models:**
| Model | Trọng tâm |
|-------|-----------|
| PMI Managing Change in Organisations | Readiness, impact, communication |
| ADKAR (Prosci) | Individual: A→D→K→A→R |
| Kotter 8 Steps | Organisational leadership |
| Virginia Satir | Emotional stages |
| Bridges Transition | Ending → Neutral zone → New beginning |

### Bridges Transition Model
| | |
|---|---|
| **Tác giả** | William Bridges — focus **transition** (con người), không chỉ change (tình huống) |

**3 giai đoạn:**
| Giai đoạn | Ý nghĩa | PM làm gì |
|-----------|---------|-----------|
| **1. Ending** (*Losing & letting go*) | Kết thúc cách cũ — mất mát, lo sợ | Acknowledge loss; communicate **why** |
| **2. Neutral Zone** | Vùng trung gian — bối rối, năng suất giảm | Support, training, patience |
| **3. New Beginning** | Chấp nhận cách mới | Celebrate wins, reinforce, monitor |

**Transition Readiness Process:**
1. **Communicate** the reason for the change
2. **Understand the impact** from those affected
3. **Check** the organisation's readiness for change
4. **Educate leaders** on how the change will affect their people
5. **Monitor progress** as people go through the stages of transition

**Mẹo đề:** People resist mid-change → Neutral zone · Assess before rollout → Readiness · No follow-up → ✗

### ADKAR · Kotter · Virginia Satir

**ADKAR** — thay đổi cá nhân:
| Chữ | Giai đoạn |
|-----|-----------|
| **A** | Awareness — hiểu **why** |
| **D** | Desire — muốn tham gia |
| **K** | Knowledge — biết **how** |
| **A** | Ability — có kỹ năng |
| **R** | Reinforcement — duy trì lâu dài |

**Kotter 8 Steps:** Urgency → Guiding coalition → Vision → Communicate → Empower → Short-term wins → Consolidate → Anchor in culture

**Virginia Satir:** Late Status Quo → Resistance → Chaos → Integration → New Status Quo

### Coalition / Guiding coalition
| | |
|---|---|
| **Coalition** | **Liên minh** — nhóm hợp tác vì mục tiêu chung |
| **Guiding coalition** | Nhóm **dẫn dắt** change — Kotter **Step 2** |
| **Thứ tự Kotter** | Urgency (1) → **Coalition** (2) → Vision (3)… |

**Gồm:** Sponsors · Line managers · SMEs · Influential stakeholders · PM (không một mình)

**Mẹo đề:** Organisational change → build coalition · *guiding coalition* → Kotter step 2 · PM alone ✗

---

## 6. Development Approach & Agile

### Adaptive
| | |
|---|---|
| **Nghĩa** | Cách tiếp cận PMBOK: linh hoạt, emergent scope, embrace change, backlog |
| **Quan hệ** | **Ô lớn** — Agile ⊂ Adaptive |

### Agile
| | |
|---|---|
| **Nghĩa** | Một cách cụ thể làm adaptive: Scrum, Kanban, sprint, PO, backlog |
| **Keyword** | Sprint, Scrum, product owner |

### Cumbersome
| | |
|---|---|
| **Nghĩa** | **Cồng kềnh, rườm rà** — process/tool quá nặng, khó dùng, dễ sai |
| **Phát âm** | /ˈkʌmbərsəm/ — *câm-bơ-səm* |
| **≈** | Bulky · unwieldy · over-engineered process |
| **≠ Complex** | Complex = logic khó · Cumbersome = **quá nhiều bước**, khó vận hành |
| **Mindset** | Governance ≠ bureaucracy — lightweight · inspect & adapt |

**Q747:** Agile team · process cumbersome, prone to errors, hard to monitor changes → **Next retrospective** — assess effectiveness & decide adjustments → **B** ✓

**Bẫy ✗:** Assign one person · Discontinue without assessment · Buy software tool · Thêm bureaucracy

### Iterative
| | |
|---|---|
| **Nghĩa** | Lặp nhiều vòng để **tinh chỉnh** cùng sản phẩm (refine) |
| **Ẩn dụ** | Vẽ tranh: sketch → màu → hoàn thiện |

### Incremental
| | |
|---|---|
| **Nghĩa** | Giao **từng phần** chức năng có giá trị (MVP, release từng module) |
| **Ẩn dụ** | Xây nhà: phòng 1 → phòng 2 → phòng 3 |
| **Thực tế** | Scrum thường = Iterative + Incremental |

### Stacey Matrix
| | |
|---|---|
| **Nghĩa** | Ma trận Ralph Stacey — chọn approach theo **complexity** × **requirements uncertainty** |
| **≠ Satir Chaos** | Stacey Chaos = dự án quá rủi ro · Satir Chaos = cảm xúc khi change |

**4 vùng:**
| Vùng | Approach |
|------|----------|
| **Simple** | Predictive / Waterfall |
| **Complicated** | Hybrid hoặc Agile |
| **Complex** | Adaptive / Agile |
| **Chaos** | Quá rủi ro — avoid / rethink |

**Iron Triangle:** Predictive = Scope fixed · Agile = Time & Cost fixed, Scope varies

**Mẹo đề:** Requirements emerge → Complex/Agile · Scope rõ + tech ổn → Simple/Predictive

---

## 7. Schedule, Cost & EVM

### Impact of Variables Over Time
| | |
|---|---|
| **Nguồn** | *The Standard for Project Management*, p.59 |
| **Ngữ cảnh** | Predictive project — executive lo staffing cost & risk **early** trong planning |

**Hai đường cong (ngược chiều):**
| Biến số | Đầu dự án | Giữa (execution) | Cuối |
|---------|-----------|------------------|------|
| **Cost & Staffing** | Thấp | **Cao nhất** (bell curve) | Giảm mạnh |
| **Risk & Uncertainty** | **Cao nhất** | Giảm dần | Thấp |

**Đáp án đúng (Q13):** Cost/staffing **tăng** khi work progresses → **giảm** gần completion · Risk/uncertainty **giảm over time**

**Bẫy đề ✗:** Cost cao nhất ở đầu · Risk tăng về cuối · Risk không đổi · Cost giảm dần suốt dự án

### S-Curve Diagram
| | |
|---|---|
| **Nghĩa** | Đồ thị tích lũy hình chữ S: chậm → nhanh → chậm |
| **EVM S-curve** | So sánh cumulative **PV, EV, AC** theo thời gian |
| **Monte Carlo S-curve** | **Xác suất tích lũy** đạt outcome (trục Y = %) |
| **Đọc EVM** | EV < PV → behind schedule; AC > EV → over budget |

### Variance at Completion (VAC)
| | |
|---|---|
| **Công thức** | **VAC = BAC − EAC** |
| **VAC > 0** | Dự kiến **dưới** budget |
| **VAC = 0** | Đúng budget |
| **VAC < 0** | Dự kiến **vượt** budget |
| **≠ CV/SV** | VAC = forecast **cuối dự án**; CV/SV = hiện tại |

### COCOMO
| | |
|---|---|
| **Nghĩa** | Constructive Cost Model — ước lượng effort/cost phần mềm từ size (KLOC) |
| **3 loại** | Organic, Semi-detached, Embedded |
| **Loại estimating** | **Parametric** |
| **Mẹo đề** | Software + lines of code + parametric → COCOMO |

### Theory of Constraints (TOC)
| | |
|---|---|
| **Nghĩa** | **Lý thuyết ràng buộc** (Goldratt) — throughput bị giới hạn bởi **bottleneck/constraint** |
| **Ẩn dụ** | Chuỗi mạnh bằng mắt xích yếu nhất — tối ưu chỗ khác không giúp nếu constraint còn |
| **≠ CPM** | CPM = logical path · Critical Chain = + resource constraints + buffers |
| **≠ Resource leveling** | Leveling cân allocation · TOC **focus constraint** |

**5 bước:** Identify → **Exploit** → **Subordinate** → **Elevate** → Repeat

**Critical Chain:** Schedule method TOC — project / feeding / resource **buffers** bảo vệ end date

**Bottleneck trên đề:**
| Signal | PM làm |
|--------|--------|
| PM là bottleneck, team chờ approval | Empower — distributed management (Q71→D) |
| External expert bottleneck | Upskill team (Q213→B) |
| CFD: WIP tăng, Done đứng | Review **WIP limits** (Q456→C) |
| Process bottleneck (customs…) | Intervention proportionate (Q894→C) |

**Bẫy ✗:** Centralize thêm khi PM đã bottleneck · Thêm resource thay vì fix WIP · Crash mọi task

### Punch List
| | |
|---|---|
| **Nghĩa** | Danh sách việc nhỏ còn sót trước nghiệm thu/bàn giao |
| **PMP** | Construction, closeout — punch list = 0 trước final acceptance |

### Cost of Quality (CoQ)
| | |
|---|---|
| **Nghĩa** | Chi phí chất lượng — đạt & duy trì chất lượng, hoặc hậu quả khi không đạt |
| **PMBOK 8** | *Estimate Costs* p.63 · *Cost of quality* p.158–159 |

**4 loại:**
| Loại | Keyword | Ví dụ |
|------|---------|-------|
| **Prevention** | Ngăn lỗi trước | Training, quality planning, build quality in |
| **Appraisal** | Test, inspect | Testing, inspection, audit |
| **Internal Failure** | Trước giao khách | Rework, scrap |
| **External Failure** | Sau giao khách | Returns, warranty, repairs, replacements |

**Conformance** = Prevention + Appraisal · **Failure** (non-conformance) = Internal + External Failure

**Q67:** Returns/repairs **after release** → **Failure costs** (External Failure) ✓

**Mẹo:** Prevention > Appraisal > Failure · Appraisal = test · Conformance ≠ Failure

### Cost Aggregation
| | |
|---|---|
| **Nghĩa** | **Tổng hợp chi phí** — roll up estimate từ activity → work package → control account → project |
| **PMBOK 8** | *Develop Budget* p.64 · *Cost aggregation* p.158 |
| **Output** | **Cost baseline** — approved budget để monitor & control |

**Roll-up:** Activities → Work packages → Control accounts → Project (cost baseline)

**Flow:** Estimate Costs (activities) → **Cost aggregation** → Cost baseline

**Q69:** Activity estimates đã có · cần single approved budget · FIRST → **Perform cost aggregation** ✓

**Sai ✗:** Finalize baseline trước (chưa aggregate) · Update FMP · Review Business Case (initiation)

### Basis of Estimates (BOE)
| | |
|---|---|
| **Nghĩa** | **Cơ sở ước lượng** — giải thích estimate tính như thế nào, dựa trên gì |
| **Tên PMBOK** | **Basis of estimates** — không phải “basis estimation” |
| **Alias** | BOE · *basis estimation* (gọi nhầm, cùng nghĩa) |
| **Loại** | **Project document** — supporting doc (không phải plan / performance report) |
| **PMBOK 8** | Input *Develop Budget* p.64 · p.115 |
| **≠ Cost estimate** | Estimate = con số · BOE = assumption & method |
| **Biến thể** | Cost basis of estimates · Schedule basis of estimates |

**Gồm:** Assumptions · Constraints · Method · Data sources · Range/confidence · Supporting docs

**≠ Nhầm:** FMP (quy tắc tài chính) · Work performance info (monitoring) · Assumption log (track giả định chung)

**Q69 vs Q70:**
| Câu | Tình huống | Đáp |
|-----|------------|-----|
| Q69 | Cần approved budget · FIRST | Cost aggregation |
| Q70 | Estimates xong · leaders question **accuracy** | **Show basis of estimates** ✓ |

**Sai Q70 ✗:** Aggregate (Q69) · Show FMP · Develop estimates lại (đã xong)

**Claims:** Review BOE + contract khi dispute cost — không auto-approve claim

### Funding Strategy
| | |
|---|---|
| **Nghĩa** | **Chiến lược tài trợ** — mô tả **nguồn vốn** & cách huy động cho dự án |
| **PMBOK 8** | **Output** *Plan Financial Management* p.62–63 · p.122–123 |
| **≠ FMP** | FMP = quy tắc quản lý tài chính · Funding strategy = **sources** |
| **≠ FLR** | FLR = fit spend vào limits theo kỳ (Develop Budget) |

**Outputs Plan Financial Management:** FMP + **Funding Strategy**

**Loại nguồn:** Org budget transfer · Customer contract · Government/NGO grants · Donors/benefactors

**Q64 vs Q65:**
| Câu | Stem | Đáp |
|-----|------|-----|
| Q64 | Document **how finances managed** | **FMP** |
| Q65 | NGOs fund · finalize financial plan | **Note in Funding Strategy** → A |

**Bẫy ✗:** Send FMP to sponsor (Q65 B) · Review charter · Engage experts only · Nhầm với FLR

### Funding limit reconciliation
| | |
|---|---|
| **Nghĩa** | **Đối chiếu hạn mức tài trợ** — so planned **cumulative spend** với **funding limits** theo kỳ và điều chỉnh |
| **Reconcile** | **Đối chiếu & điều chỉnh** để align — planned spend ↔ funding limit |
| **PMBOK** | Kỹ thuật **Determine Budget** / *Develop Budget* — sau aggregation |
| **≠ Cost aggregation** | Roll up estimates · FLR = fit **spending profile** vào limits |
| **≠ Discrepancies** | FLR = riêng funding limits theo kỳ |

**Funding limit:** Giới hạn tiền org cam kết/chi trong một kỳ (tháng/quý)

**Flow:** Estimate → **Cost aggregation** → **Funding limit reconciliation** → Cost baseline

**Q69 vs FLR vs Q70:**
| Signal | Đáp |
|--------|-----|
| Single approved budget · FIRST | Cost aggregation (Q69) |
| Question estimate accuracy | Basis of estimates (Q70) |
| Funding limits · spend profile vượt cap | **Funding limit reconciliation** |
| Over budget · discrepancies | Reconciliation process (general) |

**Bẫy ✗:** Chỉ CR tăng budget khi vấn đề là phasing · Nhầm FLR với aggregation · Ignore limits khi baseline

### Reimburse / Cost-reimbursable
| | |
|---|---|
| **Reimburse** | **Hoàn trả** chi phí người khác đã bỏ ra (vendor, team) |
| **Cost-reimbursable** | Hợp đồng trả **actual costs** + fee (CPFF, CPAF, CPIF) |
| **≠ Fixed-price** | Fixed = giá cố định · Reimburse = theo chi phí thực tế |

**Khi dùng:**
| Signal | Contract |
|--------|----------|
| Scope unclear, high uncertainty, R&D | **Cost-reimbursable** ✓ |
| Scope uncovered as work progresses | Cost-plus reimburses vendor |
| Scope clear, minimal variation | **Fixed-price** ✓ |
| Team expense reimbursement | FMP / policy — verify & justify |

**Bẫy ✗:** Clear scope + reimburse all costs → fixed-price · Reimburse without policy

### Claims / Claims administration
| | |
|---|---|
| **Claim** | Yêu cầu bồi thường hợp đồng — seller đòi **thêm tiền/gia hạn** vì chi phí/phạm vi ngoài hợp đồng |
| **Claims administration** | Quy trình xử lý claim theo **contract terms** |
| **≠ Change request** | CR = thay đổi được kiểm soát · Claim = **tranh chấp** quyền lợi đã phát sinh |
| **≠ Reimburse** | Reimburse = loại hợp đồng · Claim = **dispute** ai trả bao nhiêu |

**Hay gặp:** Differing site conditions (Q108) · spec không rõ, đòi remediation (Q782) · payment/penalty dispute (Q412, Q667)

**Thang leo thang:** Negotiation → Mediation → Arbitration → DRB → Litigation (last resort)

**PM làm gì:**
1. Đọc contract — escalation & claims procedures (Q667)
2. Document records (hỗ trợ claim, không thay resolve)
3. **Negotiate** khi resolve nhanh, no external parties (Q108→B)
4. Impact analysis trước enforce penalty (Q782→A)
5. Change control nếu scope đổi — không bypass CR

**Bẫy ✗:** Pay claim không kiểm contract · Issue log only khi stem hỏi resolve · Mediation/arbitration khi no external parties · Litigation đầu tiên

### Remedies · Remediation
| | |
|---|---|
| **Remedies** | **Biện pháp khắc phục hợp đồng** — penalties, damages, termination khi breach |
| **Remediation** | **Khắc phục/sửa chữa** — fix gap, defect, noncompliance (skill, quality, security) |
| **≠ Claim** | Claim = seller đòi thêm · Remedy = enforce khi performance fail |
| **≠ CR** | Remediation có thể cần change control nếu scope/cost đổi |

**Remedies (contract):** Financial penalties · Corrective action · Termination · Withhold payment

**Remediation (gaps):** Skill gap (Q30) · Quality noncompliance (Q782) · Compliance/security (Q885) · Governance weakness (Q1033)

**PM làm gì:**
| Signal | Đáp |
|--------|-----|
| Apply remedies / penalties (Q667) | **Structured performance review** trước → D |
| Vendor noncompliance (Q782) | **Impact analysis FIRST** → A |
| Skill gap | Gap analysis + remediation strategies → A |
| Compliance under remediation | **Report transparently** — không hide → B |

**Bẫy ✗:** Enforce penalties vội · Postpone chỉ vì sponsor · Legal/replace vendor trước impact analysis · Defer compliance · Hide weakness

---

## 8. Kỹ thuật & Công cụ

### Delphi Technique
| | |
|---|---|
| **Nghĩa** | Kỹ thuật thu thập ý kiến **chuyên gia** qua **nhiều vòng** — phản hồi **ẩn danh** qua facilitator đến khi **hội tụ consensus** |
| **Phát âm** | /ˈdelfaɪ/ — *del-fai* |
| **PMBOK 8** | Data gathering / estimating / risk — giảm bias khi **thiếu historical data** hoặc cần forecast |
| **Cách hoạt động** | Vòng 1: experts trả lời riêng → facilitator tổng hợp (không lộ tên) → vòng sau experts điều chỉnh → lặp đến consensus |
| **PM role** | **Facilitate** — đảm bảo ẩn danh; không áp estimate/ý kiến cá nhân lên panel |
| **Dùng cho** | Estimate duration/cost, identify risks, forecast outcome |
| **Keyword** | anonymous, iterative, consensus, facilitated, panel of experts, multiple rounds |
| **≠ Brainstorming** | Brainstorm = mở, một phiên, có **dominant voice** |
| **≠ Nominal Group Technique** | NGT = im lặng viết → round-robin → vote — **một** vòng, không iterative ẩn danh |
| **≠ Expert judgment (đơn)** | Một SME — không structured multi-round |

| Signal đề | Nghĩ đến |
|-----------|----------|
| anonymous · iterative · consensus · facilitated | **Delphi** |
| panel of experts · multiple rounds · lack historical data | **Delphi** estimate/forecast |
| debate estimates · facilitated rounds · discuss between rounds | **Wideband Delphi** |
| open brainstorming · everyone speaks in one meeting | ✗ **không** Delphi |

**Bẫy ✗:** Brainstorm thay Delphi khi stem cần ẩn danh · PM đưa estimate riêng vào panel · Một cuộc họp vote = NGT, không phải Delphi

### Wideband Delphi
| | |
|---|---|
| **Nghĩa** | Biến thể Delphi — experts **thảo luận/tranh luận** estimate giữa các vòng (có facilitator) |
| **≠ Classic Delphi** | Classic = **im lặng ẩn danh** giữa các vòng; Wideband = **có debate** |
| **Nguồn** | Boehm — software estimation |
| **Mẹo đề** | *debate estimates in facilitated rounds* → Wideband Delphi |

### Starbursting
| | |
|---|---|
| **Nghĩa** | Brainstorm **câu hỏi** theo Who/What/Where/When/Why/How quanh chủ đề |
| **Giai đoạn 1** | Chỉ hỏi — chưa trả lời |
| **PMP** | Collect requirements, define scope, early exploration |

### Branch and Bound
| | |
|---|---|
| **Nghĩa** | Thuật toán tối ưu: **phân nhánh** + **cận** để cắt nhánh không khả thi |
| **PMP** | Schedule/resource/cost optimization |
| **≠ Brainstorming** | Toán học, không phải elicitation |

### Virtual Reality (VR) · Augmented Reality (AR)
| | |
|---|---|
| **VR** | **Thực tế ảo** — môi trường số **immersive** hoàn toàn (headset, simulation) |
| **AR** | **Thực tế tăng cường** — **phủ digital** lên thế giới thật (overlay on site/product) |
| **PMBOK 8** | Emerging technologies — leverage để visualize, train, engage, giảm rework |

**So sánh:**
| | VR | AR |
|---|----|----|
| Môi trường | 100% virtual | Real + digital overlay |
| Keyword | *immersive*, simulate, walkthrough | *overlay*, on-site, inspect vs model |
| Ví dụ | Safety training, design walkthrough | BIM overlay công trường, maintenance on equipment |

**≠** Prototype · Mockup · BIM alone (AR có thể *view* BIM)

**Mẹo đề ✓:** Immersive simulate trước build → VR · Overlay trên site thật → AR · Tech hỗ trợ clarity — governance vẫn cần  
**Bẫy ✗:** Chọn vì “cool” · VR thay prototype validate behavior

### Project Canvas
| | |
|---|---|
| **Nghĩa** | **Khung trực quan một trang** — align thông tin cốt lõi dự án nhanh |
| **PMBOK 8** | Tool & Technique · Governance · p.189 |
| **Process** | Initiate Project or Phase (G1) · Integrate and Align Project Plans (G2) |
| **≠ Charter** | Canvas = collaborative alignment · Charter = formal authorization |
| **≠ BMC** | Business Model Canvas ≠ Project Canvas |

**9 ô — 3 hàng:**
| Hàng | Ô |
|------|---|
| **Strategy** | Purpose · Objectives (SMART) · Stakeholders |
| **Delivery** | Scope · Schedule · Budget |
| **Feasibility & Control** | Risks · Financial analysis · Governance |

**Khi dùng:** Initiation workshop · misalignment sớm · trước charter/PMP chi tiết

**Bẫy ✗:** Canvas thay charter · WBS/baseline chi tiết trong canvas · Skip alignment

---

## 9. Governance & Quality

### Governance
| | |
|---|---|
| **Nghĩa** | Cơ chế quyết định, kiểm soát, trách nhiệm, traceability |
| **Mindset** | Governance **≠** bureaucracy — lightweight practices |
| **PMP** | Change control, decision log, compliance, accountability |
| **≠ Management** | Governance = rules of the game; Management = playing the game |

### Discrepancy / Discrepancies
| | |
|---|---|
| **Discrepancy** | **Sai lệch, không khớp** (số ít) — plan/actual/report không align |
| **Discrepancies** | Nhiều sai lệch — hay gặp trên đề |
| **Reconcile** | Đối chiếu & **align** — xử lý discrepancy |
| **≠ Variance** | Variance = chênh số EVM · Discrepancy = inconsistency rộng hơn |
| **≠ FLR** | Funding limit reconciliation = riêng funding limits |

**Hay gặp:** Forecast ≠ status report · Actual cost ≠ budget · Subsidiary plans không align · Milestones ≠ vendor order · ROI measured differently

**PM đúng:** **Reconcile** · **Discuss** stakeholders · **Communicate** transparently · **Align** documentation · Adjust plan nếu cần

**Câu mẫu:** Q395 reconcile subsidiary plans · Q44 align docs · Q531 reconciliation process · Q591 adjust plan align vendor

**Sai ✗:** Hide/che · Resolve informally · Chỉ escalate/tăng budget

### Hazardous
| | |
|---|---|
| **Nghĩa** | Nguy hiểm, có hại — hazardous conditions, hazardous materials |
| **PMP** | Ghi risk register; plan risk responses — không ignore safety |

### Vigilant
| | |
|---|---|
| **Nghĩa** | Cảnh giác, theo dõi chủ động, sẵn sàng adapt |
| **PMP** | Monitor **external environment** (market volatility) |
| **Đối lập** | Complacent (chủ quan) |

---

## 10. Metrics, Bias & Phân tích

### Vanity Metric
| | |
|---|---|
| **Nghĩa** | Chỉ số đẹp báo cáo nhưng **không actionable** |
| **Ví dụ ✗** | Page views, social impressions, số cuộc gọi hoàn thành |
| **Ví dụ ✓** | Qualified recruit rate, time to insight, NPS, CPI+SPI+outcomes |
| **PMP** | Focus on value — outcome-based metrics |

### Confirmation Bias
| | |
|---|---|
| **Nghĩa** | Chỉ tìm/tin thông tin **ủng hộ** quan điểm sẵn có |
| **PMP** | Pitfall of metrics (PMBOK 8) |
| **Chống bias** | Holistic view, seek disconfirming evidence, diverse perspectives |

### Causation
| | |
|---|---|
| **Nghĩa** | Quan hệ nhân quả — X **gây ra** Y |
| **≠ Correlation** | Cùng biến đổi ≠ có nhân quả |
| **PMP** | Root cause analysis, cause-and-effect — đừng kết luận vội từ metrics |

---

## 11. Business Environment & Sustainability

### Business Acumen
| | |
|---|---|
| **Nghĩa** | **Sự nhạy bén kinh doanh** — hiểu org tạo value thế nào; quyết định dự án phục vụ mục tiêu kinh doanh |
| **PMBOK 8** | Năng lực cốt lõi project professional |
| **≠ Technical skill** | Technical = làm sản phẩm · Acumen = **vì sao** & value cho org |

**Bao gồm:** Strategic alignment · Business value · ROI/NPV/payback · Market context · Benefits realization · Business case

**Mẹo đề:**
| ✓ Đúng | ✗ Sai |
|--------|-------|
| Prioritize highest **business value** | Chỉ focus tasks/schedule |
| Trade-off giải thích **business outcomes** | Gold plating, vanity features |
| Hiểu sponsor ROI/benefits goals | Tunnel vision kỹ thuật |

### Benefactors
| | |
|---|---|
| **Nghĩa** | **Nhà tài trợ** — stakeholder/tổ chức **cung cấp funding** cho dự án |
| **PMBOK 8** | Ghi trong **Funding Strategy** (Plan Financial Management, p.122–123) |
| **≠ Beneficiary** | Benefactor = cho/tài trợ · Beneficiary = nhận lợi ích |
| **≠ Sponsor** | Sponsor = executive accountable · Benefactor = nguồn funding (NGO, donor…) |

**Ví dụ:** NGOs (environmental initiatives) · Corporate sponsors · Donors/grants · External funders

**Mẹo đề (Q65):** NGOs funding project + finalizing financial plan → **Note benefactors/NGOs in Funding Strategy** ✓ · Chi tiết: [Funding Strategy](#funding-strategy)

### Triple Bottom Line (TBL)
| | |
|---|---|
| **Nghĩa** | Đo thành công trên 3 đáy: **People, Planet, Profit** |
| **PMP** | Business Environment, ESG, sustainability, beyond cost/schedule |
| **Keyword** | Social + environmental + economic value |

---

## 12. Bảng so sánh nhanh

### Variables Over Time (Predictive)
| Biến | Xu hướng |
|------|----------|
| Cost & Staffing | Thấp → cao (execution) → giảm mạnh (close) |
| Risk & Uncertainty | Cao (start) → giảm dần |

### Cost of Quality (CoQ)
| Loại | Keyword | Ví dụ |
|------|---------|-------|
| Prevention | Ngăn lỗi trước | Training, planning |
| Appraisal | Test, inspect | Testing, audit |
| Internal Failure | Trước giao | Rework, scrap |
| External Failure | Sau giao | Returns, warranty |
| Conformance | — | Prevention + Appraisal |

### Develop Budget flow
| Bước | Process / output |
|------|------------------|
| Activity estimates | Estimate Costs |
| Cost aggregation | Develop Budget (FIRST) |
| Cost baseline | Approved budget |

### Q69 vs Q70 (Develop Budget)
| Câu | Signal | Đáp |
|-----|--------|-----|
| Q69 | Need approved budget · FIRST | Cost aggregation |
| Q70 | Question estimate accuracy | Basis of Estimates |

### Change Models
| Model | Trọng tâm |
|-------|-----------|
| Bridges | Transition: Ending → Neutral zone → New beginning |
| ADKAR | Individual: A→D→K→A→R |
| Kotter | Organisational: Urgency → Coalition → Vision → Anchor |
| Satir | Emotional: Status quo → Resistance → Chaos → Integration |
| PMI OCM | Readiness, impact, communicate, educate, monitor |

### Elicitation & Estimation Techniques
| Kỹ thuật | Đặc điểm chính |
|----------|----------------|
| Delphi | Ẩn danh, nhiều vòng, facilitator, consensus |
| Wideband Delphi | Delphi + thảo luận/debate giữa các vòng |
| Starbursting | Câu hỏi 5W1H, questions first |
| Brainstorming | Ý tưởng tự do, có thể dominant voice |
| COCOMO | Parametric, software, KLOC |
| Branch and bound | Optimization, prune branches |

### Stakeholder Models
| Model | Tiêu chí |
|-------|----------|
| Salience | Power, Legitimacy, Urgency |
| Power/Interest Grid | Authority × Interest |
| RACI | R, A, C, I (vai trò công việc) |

### S-Curve: Hai ngữ cảnh
| | EVM S-curve | Monte Carlo S-curve |
|---|-------------|---------------------|
| Trục Y | $ tích lũy | Probability % |
| Trục X | Time | Outcome (cost/duration) |
| Tool | Control Costs | Quantitative risk |

### Risk Responses (Threat)
| Strategy | Mục tiêu | Keyword đề |
|----------|----------|------------|
| Avoid | Loại bỏ threat | Remove scope, change vendor |
| Mitigate | Giảm P hoặc I | Training, backup, testing |
| Transfer | Chuyển impact | Insurance, fixed-price |
| Accept | Chấp nhận + reserve | Contingency, low impact |

### Risk Responses (Opportunity)
| Strategy | Mục tiêu |
|----------|----------|
| Exploit | Đảm bảo xảy ra |
| Enhance | Tăng chance/benefit |
| Share | Chia lợi partner |
| Accept | Sẵn sàng nắm |

### Leadership Styles
| Style | PMP thường |
|-------|------------|
| Servant leader | ✓ Agile, empower |
| Transformational | ✓ Vision |
| Distributed | ✓ Self-organizing |
| Autocratic | ✗ Micromanage |
| Laissez-faire | ✗ Hands-off khi cần PM |
| Transactional | Management by exception |

### Types of Power
| ✓ Ưu tiên | ✗ Tránh |
|-----------|---------|
| Expert, Referent, Informational, Persuasive | Coercive, Guilt-based, Pressure-based, Avoiding |

### Development Approaches
| Thuật ngữ | Tầng |
|-----------|------|
| Adaptive | Development approach (PMBOK) |
| Agile | Framework/method (subset of adaptive) |
| Iterative | Delivery technique (refine) |
| Incremental | Delivery technique (add slices) |

### Stacey Matrix
| Vùng | Approach |
|------|----------|
| Simple | Predictive / Waterfall |
| Complicated | Hybrid / Agile |
| Complex | Adaptive / Agile |
| Chaos | Avoid — quá rủi ro |

### Contract Types (Procurement)
| Type | Cost risk | Khi nào |
|------|-----------|---------|
| Fixed-price | Seller | Scope rõ |
| Cost-reimbursable | Buyer (reimburse) | Uncertainty cao |
| T&M | Buyer | Flex hours/materials |

### Claims & Dispute Resolution
| Bước | Khi nào |
|------|---------|
| **Negotiation** | First — direct, no third party |
| Mediation | Negotiation stalls |
| Arbitration | Binding external decision |
| Litigation | Last resort |

### Cognitive & Team Theories
| Khái niệm | Một câu |
|-----------|---------|
| Theory X | Control them — PMP thường sai |
| Theory Y | Empower them — PMP thường đúng |
| Theory Z | Long-term loyalty + consensus |
| Hawthorne | Attention improves performance |
| Confirmation bias | See what we want to see |

### EVM Forecast
| Chỉ số | Công thức | Ý nghĩa |
|--------|-----------|---------|
| CPI | EV / AC | Hiệu quả chi phí hiện tại |
| SPI | EV / PV | Hiệu quả tiến độ hiện tại |
| VAC | BAC − EAC | Dự báo over/under budget cuối dự án |
| CV | EV − AC | Variance chi phí hiện tại |
| SV | EV − PV | Variance tiến độ hiện tại |

---

## Keyword → Thuật ngữ (tra cức đề thi)

| Nếu đề có… | Nghĩ đến… |
|------------|-----------|
| power, legitimacy, urgency | Salience model |
| anonymous, iterative, consensus, facilitated | Delphi |
| panel of experts, multiple rounds, lack historical data | Delphi (estimate/forecast) |
| debate estimates, facilitated rounds | Wideband Delphi |
| Who/What/When/Where/Why/How, questions first | Starbursting |
| outside team's authority | Escalate (không swarm) |
| swarming, blocker in team scope | Swarm |
| page views, impressions | Vanity metric |
| preexisting view, only supporting data | Confirmation bias |
| BAC − EAC, forecast at completion | VAC |
| cumulative PV EV AC | S-curve (EVM) |
| Monte Carlo iterations, probability | S-curve (Monte Carlo) |
| People Planet Profit | Triple bottom line |
| bottleneck, weakest link, constraint | TOC — fix constraint |
| PM is bottleneck, waits for approval | Empower / distributed management |
| WIP growing, Done not increasing | Review WIP limits |
| external expert bottleneck | Upskill — reduce dependency |
| critical chain, project buffer | TOC schedule method |
| punch list completion | Closeout / acceptance |
| stay vigilant, external environment | Monitor & adapt |
| overworked demoralized | Engage & acknowledge (Theory Y) |
| relatable memorable lessons | Storytelling |
| excerpt, executive summary, concise insights | Tailor status artifacts (Q418) |
| extract what they need, raw logs | PM tailor comms — không dump data (Q34) |
| too technical report, business questions | Update comms plan — tailor format (Q34) |
| brief mention of risks in status report | Document & analyze — không chỉ excerpt (Q982) |
| correlation vs cause | Causation |
| hedging, exchange rate | Financial risk response |
| insurance, fixed-price | Transfer |
| training, backup, cross-train | Mitigate |
| remove scope, change vendor | Avoid |
| contingency reserve | Accept (active) |
| risk materialized | Planned response from risk register |
| offset, savings offset | Bù trừ — cẩn thận optimism bias |
| discord among stakeholders | Facilitate conflict resolution |
| compromise/reconcile, conflict management | Listen first — then negotiate (Q179) |
| split costs, share costs equally | Review acceptance criteria (Q569) |
| full support, effective conflict resolution | Collaborate / constructive dialogue (Q211) |
| compromise design, underlying needs | Collaborating — không nhầm compromise (Q23) |
| without compromising quality | Không hy sinh quality — MVP/prioritize |
| scarce resources, resource conflicts | Plan availability · verify with functional managers |
| shared specialized resources, competing priorities | Identify requirements · không ad hoc negotiation |
| interdisciplinary team, multidisciplinary project | Facilitate · integrate disciplines |
| conflicts about design, different disciplines | Facilitate team discussions (Q304) |
| global multidisciplinary, cultural misunderstandings | Culturally responsive communication protocol |
| limited resources, too many wish-list items | MVP / prioritize backlog |
| immersive walkthrough, simulate before build | **Virtual reality (VR)** |
| overlay model on site, inspect as-built | **Augmented reality (AR)** |
| emerging technology, leverage technology | Support value — governance vẫn cần |
| project canvas, alignment session initiation | Single-page align — trước charter |
| stakeholder misalignment early, kickoff workshop | Facilitate project canvas |
| context cues, hierarchy, indirect communication | Cultural awareness — adjust engagement |
| differing communication styles, multi-country | Cultural awareness — read context cues |
| social cues, read the room | EI · stakeholder engagement |
| visual cues, information radiator | Kanban / transparency |
| pilot cohort, first cohort | Incremental rollout |
| folks on the ground | Engage team doing the work |
| amigos, colleagues informal | Folks — engage & collaborate |
| stacey matrix, requirements uncertainty | Predictive vs Agile |
| well-defined scope, stable tech | Stacey Simple → Waterfall |
| emergent requirements, complex | Stacey Complex → Agile |
| nitty-gritty, get into details | Elicitation, WBS, specifics |
| down to the nitty-gritty | Define scope, requirements, AC |
| snitches get stitches, afraid to report | Psychological safety |
| retaliation for raising concerns | Stop punishment, transparency |
| build rapport, establish rapport | Trust, EI — listen, 1-on-1 |
| maintain rapport, informal scope | Sai — change control |
| rapport + compliance | Adapt comms + ensure compliance |
| reimburse, cost-reimbursable | Actual costs + fee — high uncertainty |
| scope unclear, reimburse vendor | Cost-plus contract |
| clear scope, minimal variation | Fixed-price |
| expense reimbursement | FMP / policy — verify & justify |
| contractor submits a claim, additional costs | Claims administration — negotiate first |
| resolve quickly, no external parties | **Negotiation** — not mediation/arbitration |
| escalation and claims procedures in contract | Follow contract · structured review |
| apply remedies, enforce penalties, milestone miss | Structured performance review (Q667) |
| remediation strategies, skill gap, competency | Gap analysis + collaborate fix (Q30) |
| compliance under remediation, governance review | Report transparently — không hide |
| noncompliance, vendor fail quality | Impact analysis FIRST (Q782) |
| potential claims, contract negotiations | Maintain records + claims management |
| unexpected site conditions, vendor dispute | Negotiate → escalate per contract |
| folk wisdom | Không data-driven — thường sai |
| acknowledge mistake, apologize | Humility |
| servant leader, remove impediment | Servant leadership |
| autocratic, decides alone | Thường sai |
| hands-off, laissez-faire | Sai khi cần PM action |
| inspirational vision | Transformational |
| democratic team decisions | Distributed / Democratic |
| management by exception | Transactional |
| expert power, SME | Expert power ✓ |
| withhold information | Sai — Informational |
| punish, threaten | Coercive ✗ |
| refuse to participate | Avoiding ✗ |
| persuasive arguments | Persuasive ✓ |
| neutral zone, confusion mid-change | Bridges Transition |
| ending, letting go | Bridges — Ending stage |
| readiness for change, assess impact | Transition Readiness / PMI OCM |
| educate leaders on people impact | Transition Readiness step 4 |
| awareness desire knowledge ability | ADKAR |
| sense of urgency, guiding coalition | Kotter 8 Steps |
| form guiding coalition, build coalition | Kotter step 2 |
| coalition of leaders | Change leadership · relational power |
| resistance, chaos, emotional stages | Virginia Satir |
| change vs transition | Change = situation · Transition = people |
| could undermine transparency | Report honestly — không chỉnh metrics |
| undermine adoption, ignore feedback | Reprioritize backlog, facilitate alignment |
| undermine confidence, regulatory trust | Update engagement plans, reassess urgency |
| staffing cost early, risk early planning | Impact of Variables Over Time |
| cost increases then drops, risk decreases | Variables Over Time — đáp C |
| risk highest at start | Uncertainty giảm khi deliverable accepted |
| will entail, what does this entail | Hệ quả bắt buộc — assess impact, update plans |
| entail change request | Integrated change control |
| entail training, additional resources | Plan OCM / capacity |
| PM là leader không victim | Accountable, proactive |
| nothing I can do, wait for sponsor | Victim mentality ✗ |
| fall victim to scope creep | Change control |
| discrepancy, inconsistencies in plans | Reconcile, align, discuss |
| forecast vs status report mismatch | Align documentation, communicate |
| actual vs budget discrepancy | Transparency, assess & adjust plan |
| business acumen, business value | Strategic alignment, ROI, benefits |
| highest business value | Prioritize value — không gold-plate |
| ROI, benefits realization | Business acumen |
| benefactors, NGOs funding project | Note in Funding Strategy |
| funding strategy, funding sources, finalize financial plan | Plan Financial Management output |
| what document shows how finances managed | Financial Management Plan (Q64) |
| NGOs, grants, donors, external funders | Funding Strategy |
| benefactor vs beneficiary | Benefactor = cho · Beneficiary = nhận |
| returns, repairs after release | Failure costs — External |
| rework, scrap before delivery | Internal Failure |
| testing, inspection, audit | Appraisal costs |
| training, quality planning | Prevention costs |
| conformance costs | Prevention + Appraisal |
| identified risk, may require | Contingency reserve |
| unknown unknowns, unforeseen | Management reserve |
| blanket padding all estimates | Sai — contingency cho risk cụ thể |
| individual activity estimates, approved budget | Cost aggregation |
| roll up WBS, work packages | Cost aggregation → baseline |
| funding limits, cumulative expenditures | **Funding limit reconciliation** |
| expenditure exceeds periodic funding cap | Reconcile spend — adjust schedule/phasing |
| reconciliation process, discrepancies | Reconcile plan vs actual (general) |
| finalize baseline FIRST | Sai — aggregate trước |
| question accuracy of estimates | Basis of Estimates |
| basis estimation, basis for estimation | = **Basis of estimates (BOE)** |
| doubt estimates, show assumptions | Show basis of estimates |
| show FMP for estimate validation | Sai — BOE not FMP |
| reserves depleted | Contingency used up |
| increase exposure | Risk grows with delay |
| Governance ≠ bureaucracy | Lightweight traceability |
| cumbersome process, prone to errors | Retrospective — assess & adjust (Q747) |
| hard to monitor changes, heavy process | Inspect & adapt — simplify workflow |
| iterative + incremental | Agile delivery |
| lines of code, parametric | COCOMO |

---

*Tạo từ phiên học từ vựng PMP — có thể bổ sung thêm thuật ngữ khi ôn tiếp.*
