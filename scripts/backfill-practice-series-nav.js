const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "../public/pmp");

const SERIES = [
  ["pmp-teach-project-program-portfolio.html", "Q1: Project/Program/Portfolio"],
  ["pmp-teach-tangible-intangible-benefits.html", "Q2: Tangible/Intangible"],
  ["pmp-teach-enterprise-environmental-factors.html", "Q3: EEF"],
  ["pmp-teach-organizational-process-assets.html", "Q4: OPA"],
  ["pmp-teach-organizational-structure.html", "Q5: Org Structure"],
  ["pmp-teach-functional-organization.html", "Q6: Functional"],
  ["pmp-teach-project-functions.html", "Q7: Project Functions"],
  ["pmp-teach-project-sponsor.html", "Q8: Project Sponsor"],
  ["pmp-teach-project-management-team.html", "Q9: PM Team"],
  ["pmp-teach-focus-on-value.html", "Q10: Focus on Value"],
  ["pmp-teach-embed-quality.html", "Q11: Embed Quality"],
  ["pmp-teach-accountable-leader.html", "Q12: Accountable Leader"],
  ["pmp-teach-variables-over-time.html", "Q13: Variables Over Time"],
  ["pmp-teach-predictive-approach.html", "Q14: Predictive Approach"],
  ["pmp-teach-adaptive-approach.html", "Q15: Adaptive Approach"],
  ["pmp-teach-hybrid-approach.html", "Q16: Hybrid Approach"],
  ["pmp-teach-leading-indicators.html", "Q17: Leading Indicators"],
  ["pmp-teach-initiate-project.html", "Q18: Initiate Project"],
  ["pmp-teach-business-case.html", "Q19: Business Case"],
  ["pmp-teach-assumption-log.html", "Q20: Assumption Log"],
  ["pmp-teach-project-management-plan.html", "Q21: Project Management Plan"],
  ["pmp-teach-plan-sourcing-strategy.html", "Q22: Plan Sourcing Strategy"],
  ["pmp-teach-bidder-conference.html", "Q23: Bidder Conference"],
  ["pmp-teach-sourcing-strategy-plan.html", "Q24: Sourcing Strategy Plan"],
  ["pmp-teach-make-or-buy-analysis.html", "Q25: Make-or-Buy Analysis"],
  ["pmp-teach-request-for-quote.html", "Q26: Request for Quote"],
  ["pmp-teach-change-log.html", "Q27: Change Log"],
  ["pmp-teach-scope-baseline-execution.html", "Q28: Scope Baseline"],
  ["pmp-teach-issue-log.html", "Q29: Issue Log"],
  ["pmp-teach-process-improvement.html", "Q30: Process Improvement"],
  ["pmp-teach-quality-audits.html", "Q31: Quality Audits"],
  ["pmp-teach-checklists.html", "Q32: Checklists"],
  ["pmp-teach-lessons-learned.html", "Q33: Lessons Learned"],
  ["pmp-teach-after-action-review.html", "Q34: After-Action Review"],
  ["pmp-teach-monitor-control-performance.html", "Q35: Monitor &amp; Control"],
  ["pmp-teach-ishikawa-analysis.html", "Q36: Ishikawa Analysis"],
  ["pmp-teach-change-request.html", "Q37: Change Request"],
  ["pmp-teach-change-management-plan.html", "Q38: Change Mgmt Plan"],
  ["pmp-teach-autocratic-decision.html", "Q39: Autocratic Decision"],
  ["pmp-teach-close-project.html", "Q40: Close Project"],
  ["pmp-teach-final-report.html", "Q41: Final Report"],
  ["pmp-teach-scope-management-plan.html", "Q42: Scope Mgmt Plan"],
  ["pmp-teach-elicit-requirements.html", "Q43: Elicit Requirements"],
  ["pmp-teach-requirements-traceability.html", "Q44: Requirements RTM"],
  ["pmp-teach-business-requirements.html", "Q45: Business Requirements"],
  ["pmp-teach-design-thinking.html", "Q46: Design Thinking"],
  ["pmp-teach-nominal-group-technique.html", "Q47: Nominal Group"],
  ["pmp-teach-brainstorming.html", "Q48: Brainstorming"],
  ["pmp-teach-cost-of-delay.html", "Q49: Cost of Delay"],
  ["pmp-teach-benchmarking.html", "Q50: Benchmarking"],
  ["pmp-teach-work-breakdown-structure.html", "Q51: WBS"],
  ["pmp-teach-wbs-dictionary.html", "Q52: WBS Dictionary"],
  ["pmp-teach-quality-report.html", "Q53: Quality Report"],
  ["pmp-teach-verified-deliverables.html", "Q54: Verified Deliverables"],
  ["pmp-teach-schedule-management-plan.html", "Q55: Schedule Mgmt Plan"],
  ["pmp-teach-development-approach-schedule.html", "Q56: Dev Approach Input"],
  ["pmp-teach-schedule-baseline.html", "Q57: Schedule Baseline"],
  ["pmp-teach-resource-leveling.html", "Q58: Resource Leveling"],
  ["pmp-teach-rolling-wave-planning.html", "Q59: Rolling Wave"],
  ["pmp-teach-leads-and-lags.html", "Q60: Leads &amp; Lags"],
  ["pmp-teach-work-performance-information.html", "Q61: Work Perf. Info"],
  ["pmp-teach-branch-and-bound.html", "Q62: Branch &amp; Bound"],
  ["pmp-teach-schedule-fast-tracking.html", "Q63: Fast Tracking"],
  ["pmp-teach-financial-management-plan.html", "Q64: Financial Mgmt Plan"],
  ["pmp-teach-funding-strategy.html", "Q65: Funding Strategy"],
  ["pmp-teach-analogous-estimating.html", "Q66: Analogous Est."],
  ["pmp-teach-failure-costs.html", "Q67: Failure Costs"],
  ["pmp-teach-contingency-reserve.html", "Q68: Contingency"],
  ["pmp-teach-cost-aggregation.html", "Q69: Cost Aggregation"],
  ["pmp-teach-basis-of-estimates.html", "Q70: Basis of Est."],
  ["pmp-teach-earned-value-analysis.html", "Q71: Earned Value"],
  ["pmp-teach-identify-stakeholders.html", "Q72: Identify Stakeholders"],
  ["pmp-teach-stakeholder-register.html", "Q73: Stakeholder Register"],
  ["pmp-teach-stakeholder-mapping.html", "Q74: Stakeholder Mapping"],
  ["pmp-teach-stakeholder-engagement-matrix.html", "Q75: Engagement Matrix"],
  ["pmp-teach-communications-management-plan.html", "Q76: Comms Mgmt Plan"],
  ["pmp-teach-communication-styles-assessment.html", "Q77: Comms Styles"],
  ["pmp-teach-cultural-awareness.html", "Q78: Cultural Awareness"],
  ["pmp-teach-manage-communications.html", "Q79: Manage Comms"],
  ["pmp-teach-monitor-stakeholder-engagement.html", "Q80: Monitor Engagement"],
  ["pmp-teach-monitor-communications.html", "Q81: Monitor Comms"],
  ["pmp-teach-team-charter.html", "Q82: Team Charter"],
  ["pmp-teach-responsibility-assignment-matrix.html", "Q83: RAM"],
];

function buildSeriesBlock(currentHref) {
  let out = '        <div class="nav-series">Practice Series</div>\n';
  SERIES.forEach(function (entry) {
    const cls = entry[0] === currentHref ? ' class="series-current"' : "";
    out +=
      '        <a href="' + entry[0] + '"' + cls + ">" + entry[1] + "</a>\n";
  });
  return out;
}

let updated = 0;
fs.readdirSync(dir)
  .filter((f) => f.startsWith("pmp-teach-") && f.endsWith(".html"))
  .forEach(function (file) {
    const filePath = path.join(dir, file);
    let text = fs.readFileSync(filePath, "utf8");
    if (!text.includes('class="nav-series"')) {
      console.warn("Skip (no Practice Series): " + file);
      return;
    }
    const re =
      /        <div class="nav-series">Practice Series<\/div>[\s\S]*?(?=      <\/nav>)/;
    if (!re.test(text)) {
      console.warn("Skip (pattern mismatch): " + file);
      return;
    }
    const block = buildSeriesBlock(file);
    const next = text.replace(re, block);
    if (next !== text) {
      fs.writeFileSync(filePath, next);
      updated++;
      console.log("Updated nav: " + file);
    }
  });

console.log("Done. Updated " + updated + " files.");
