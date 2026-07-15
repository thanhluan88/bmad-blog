/**
 * Shared PMI trap-pattern taxonomy (v2): specific-first exclusive primary assign.
 */
const PATTERNS = [
  {
    id: "resilience",
    title: "Resilience — anticipate / respond / recover",
    cue: "uncertainty · ambiguity · timeline+budget + SH concern",
    action: "Build resilient approach (not 'eliminate all risk')",
    trap: "Meeting-only · eliminate uncertainty claim",
    test: (b) =>
      /resilien|anticipate, respond to, and recover|eliminate risk, ambiguity|uncertaint(y|ies) and ambiguity/i.test(
        b,
      ),
  },
  {
    id: "compliance-ethics",
    title: "Compliance / ethics — không exception",
    cue: "regs · HQ vs local · ethics · audit · specialty law",
    action: "Validate + escalate; never authorize ethics/regs exceptions",
    trap: "Local exception / cut compliance for deadline / cover deviation",
    test: (b) =>
      /ethic|illegal|code of ethics|authorize.*(exception|deviat)|exception.*(ethic|policy|reg)|violat.*(law|ethic|policy)|hipaa|gdpr|bribery|corrupt/i.test(
        b,
      ) ||
      (/multinational/i.test(b) &&
        /(ethic|complian|exception|violat)/i.test(b) &&
        !/create the project charter/i.test(b)),
  },
  {
    id: "compliance-audit",
    title: "Compliance audit / catch overlooked regs",
    cue: "multi regs · process improvement · overlooked requirements",
    action: "Schedule audit / independent certification to prove standards",
    trap: "Assume compliant · skip baseline audit",
    test: (b) =>
      /schedule an? (process )?audit|independent product certification|catch any compliance|compliance requirements that might have been overlooked|set baselines and identify opportunities/i.test(
        b,
      ),
  },
  {
    id: "transparency-news",
    title: "Transparency — tin xấu / bất định",
    cue: "layoff · incomplete info · rumor · morale crash",
    action: "Share known facts + facilitate open discussion",
    trap: "Distract · promise certainty · silence · hide",
    test: (b) =>
      /layoff|bad news|incomplete information|rumor|morale|economic implication|transparent update|misinform|inform stakeholders about the potential delay|potential delay and the steps/i.test(
        b,
      ),
  },
  {
    id: "coach-conflict",
    title: "Coach conflict — không làm hộ",
    cue: "privately struggling with teammate · interpersonal conflict",
    action: "Coach conflict-resolution techniques; facilitate",
    trap: "PM takes sides / punish / ignore / solve for them",
    test: (b) =>
      /conflict resolution|struggling to work|interpersonal conflict|coach the (senior|member|team).*conflict|applying conflict|structured coaching sessions for team dynamics|coaching sessions for team/i.test(
        b,
      ),
  },
  {
    id: "competency-develop",
    title: "Competency gap → develop",
    cue: "interns · skill gap · training needs · onboarding",
    action: "Gap analysis + develop/remediate (HR/mentor) — don't blame",
    trap: "Fire / blame / ignore capability gap",
    test: (b) =>
      /competenc(y|ies) gap|knowledge gaps?|targeted coaching|lack.*(skill|competenc|technical)|recently hired intern|skill proficiency|preassessment|remediation strateg|mentor.*(skill|competenc)|training.*(need|gap|trainee)|facilitate targeted upskilling|evaluate team skills/i.test(
        b,
      ),
  },
  {
    id: "knowledge-transfer",
    title: "Knowledge transfer — outgoing / incoming",
    cue: "turnover · transition · strict domain · KT sessions",
    action: "Prioritize immediate knowledge transfer between people",
    trap: "Delay KT · assume documentation enough under pressure",
    test: (b) =>
      /knowledge transfer|outgoing and incoming|incoming team member|handover session|retiring from a large enterprise|PMO to identify the structure/i.test(
        b,
      ),
  },
  {
    id: "opa-improve",
    title: "OPA / lessons → actionable update",
    cue: "estimation bias · vague policy · many changes delivered · lessons",
    action: "Update OPA / templates / rewrite policy — actionable",
    trap: "Archive-only / refer historical / interview without change",
    test: (b) =>
      /organizational process asset|\bOPAs?\b|estimation template|lessons learned|knowledge repositor|rewrite or revisit the existing policy|update organizational|revised estimation|project retrospective sessions/i.test(
        b,
      ),
  },
  {
    id: "risk-cadence",
    title: "Risk cadence — register & response",
    cue: "risk materialized · new law · risk in reports · reserve",
    action: "Implement planned response · identify/assess · include in reports",
    trap: "Invent new ritual · ignore register · lessons instead of act",
    test: (b) =>
      /risk register|planned risk response|implement.*risk response|risk impact matrix|contingency reserve|contingency,? such as|expert-based techniques to estimate contingency|identify potential risks|risk response plan|new law.*risk|monitor regulatory changes|tracking system to monitor regulatory/i.test(
        b,
      ),
  },
  {
    id: "change-control",
    title: "Change control / ICC",
    cue: "out of baseline · unauthorized work · new feature request · CCB",
    action: "Stop unauthorized if needed → impact → formal CR/CCB",
    trap: "Absorb scope because 'value' · silent add · informal list",
    test: (b) =>
      /change request|change control|integrated change|out of (the )?baseline|unauthorized work|scope creep|\bCCB\b|change log|gold.?plat|request a scope change|assess the impact on the project scope|impact on the project scope that may result/i.test(
        b,
      ),
  },
  {
    id: "verify-scope",
    title: "Verify scope / acceptance trước 'done'",
    cue: "sponsor confirm done · acceptance criteria · close check",
    action: "Review scope & requirements / acceptance before claim success",
    trap: "Declare done from timeline or team feeling alone",
    test: (b) =>
      /acceptance criteria|verify.*(scope|deliverable)|confirm that all (objectives|deliverables)|review the project scope|validated deliverable|definition of done|gather and integrate their feedback|user acceptance/i.test(
        b,
      ),
  },
  {
    id: "quality-sampling",
    title: "Quality — sampling / certification evidence",
    cue: "mass production · quality supervisor · prove standards",
    action: "Statistical sampling · independent certification test",
    trap: "Inspect 100% when sampling fits · skip proof of quality",
    test: (b) =>
      /statistical sampling|representative subset|quality supervisor|product certification|quality standards are met|quality-driven approach|quality assurance engineer to assist/i.test(
        b,
      ),
  },
  {
    id: "agile-mvp",
    title: "Agile MVP / backlog / iteration protect",
    cue: "MVP · mid-iteration · PO absent · backlog · sprint review",
    action: "PO owns backlog · ship MVP · protect iteration · workshop AC",
    trap: "Team absorbs mid-sprint · wait perfect · skip PO",
    test: (b) =>
      /\bMVP\b|product backlog|product owner|mid-?(sprint|iteration)|sprint review|unplanned enhancement|create the backlog|reprioritize the release|plan the upcoming iterations|plan future iterations|prioritized user stories|user stories are approved|removes impediments, facilitates coll|launch the product in Region/i.test(
        b,
      ),
  },
  {
    id: "engage-plan",
    title: "Engagement plan — theo chiến lược SH",
    cue: "resistant stakeholder · conflict interests · power/interest",
    action: "Consult engagement plan; engage per documented strategy",
    trap: "Freestyle escalate / ignore minority SH",
    test: (b) =>
      /stakeholder engagement plan|resistant stakeholder|conflicting interest|engagement strateg|engage the resistant|power\/interest|power-interest|collaborate with representatives from both parties|meet with the stakeholders to gather/i.test(
        b,
      ),
  },
  {
    id: "adapt-comms",
    title: "Adapt communications + culture",
    cue: "preferred channel · multicultural · virtual · language",
    action: "Adapt methods to prefs; culturally responsive protocols",
    trap: "One-size email blast · ignore time zone/culture",
    test: (b) =>
      /adapt communication|communication (method|prefer|style|protocol)|communications management plan|multicultural|virtual,? multicultural|time zones|cultural awareness|cultural assessment|stakeholder preferences while ensuring|tool availability, and potential constraints|facilitate collaboration across cultural|review the communications management plan/i.test(
        b,
      ),
  },
  {
    id: "culture-change",
    title: "Org culture change — targeted, not slogans",
    cue: "hierarchy→agile · restructuring · vision/alignment drift",
    action: "Targeted change activities · clear vision with sponsor/team",
    trap: "Announce values only · ignore process/structure redesign",
    test: (b) =>
      /targeted change activities|shifting from a hierarchical|hierarchical to an agile|clear vision statement|process redesign|cultural transformation|transitioning from a predictive to an (agile|adaptive)/i.test(
        b,
      ),
  },
  {
    id: "own-mistake",
    title: "Own mistake — acknowledge + apologize",
    cue: "wrong recipient email · unintended consequence · visible error",
    action: "Acknowledge the mistake and apologize for consequences",
    trap: "Hide · blame tool · over-explain without owning",
    test: (b) =>
      /acknowledge the mistake and apologize|unintended consequenc|email intended for a specific/i.test(
        b,
      ),
  },
  {
    id: "charter-authorize",
    title: "Charter — authorize & align",
    cue: "global HQ ops · need formal start · expectations",
    action: "Create project charter to authorize and align",
    trap: "Start work without charter · informal kickoff only",
    test: (b) =>
      /create the project charter|prepare a project charter|project charter to formally authorize|formally authorize the project|charter to formalize initiation/i.test(
        b,
      ),
  },
  {
    id: "plan-translate",
    title: "Translate plan → actionable controls",
    cue: "plan too abstract · audits/checklists",
    action: "Iterative translations · audits/checklists from the plan",
    trap: "Leave plan on shelf · verbal alignment only",
    test: (b) =>
      /iterative translations of the project management plan|audits and checklists to translate|translate the project management plan into/i.test(
        b,
      ),
  },
  {
    id: "benefits-metrics",
    title: "Benefits / value metrics (not vanity)",
    cue: "customer satisfaction · Kano · % value · long-term insight",
    action: "Kano/surveys/benchmarking · measure value achieved · SH behavior insight",
    trap: "Vanity SPI-only · ignore outcome metrics",
    test: (b) =>
      /kano|customer satisfaction|percentages to help measure|expected value is achieved|surveys and questionnaires|stakeholder.?s'? behaviors|benchmarking to collect|key performance indicators|\bKPIs?\b|assess the value of the new tech|analyze market information to identify potential/i.test(
        b,
      ),
  },
  {
    id: "money-forecast",
    title: "Money — forecast / EVM / contract",
    cue: "budget forward · CPI/SPI · EAC · vendor · unpaid",
    action: "Update forecasts · EVM act · close contracts admin-complete",
    trap: "Freeze BAC forever · overtime-only · skip admin close",
    test: (b) =>
      /\bbudget\b|\bCPI\b|\bSPI\b|earned value|\bEAC\b|\bBAC\b|expected monetary|\bEMV\b|financial forecast|naming rights|institutional investor|vendor|seller|procurement contract|unpaid invoice|cost overrun|estimate contingency|corrective actions.*funding|reallocating resources/i.test(
        b,
      ),
  },
  {
    id: "governance-roles",
    title: "Governance / roles / RAM / steering",
    cue: "steering review · RACI/RAM · decision authority · unclear duty",
    action: "Clarify roles (RAM) · prepare governance evidence · decision log",
    trap: "Freestyle without authority map · skip steering prep",
    test: (b) =>
      /steering committee|RACI|\bRAM\b|responsibility assignment|decision log|governance framework|role.?clarif|duty unclear|authority matrix|escalate the issue to the project sponsor|escalate.*sponsor to determine/i.test(
        b,
      ),
  },
  {
    id: "hybrid-tailor",
    title: "Tailor / hybrid — vừa đủ nghi thức",
    cue: "small low-risk · mixed certainty · predictive+agile",
    action: "Tailor weight · hybrid OK · adaptive estimates where uncertain",
    trap: "Copy megaproject ceremony · or zero governance",
    test: (b) =>
      /\bhybrid\b|tailor(ing|ed)?\b|does not justify a detailed|adaptive approach|lightweight.*audit|predictive and agile|agile and predictive|predictive approach with fixed deployment|use a predictive approach|more adaptive/i.test(
        b,
      ),
  },
  {
    id: "team-stage",
    title: "Team stage / EI / work environment",
    cue: "Tuckman · storming · shouting · noisy workspace · ownership",
    action: "Map stage · EI/self-reg · PM owns environment · facilitate ownership",
    trap: "Micromanage · escalate people issues early · ignore culture",
    test: (b) =>
      /tuckman|storming|forming|norming|performing|adjourning|emotional intelligence|self-regulation|shouting|noisy|work environment|team charter|empowered culture|ownership|team dynamics|newly formed agile team/i.test(
        b,
      ),
  },
  {
    id: "identify-stakeholders",
    title: "Identify / re-analyze stakeholders",
    cue: "new SH · stale distribution · who needs info now",
    action: "Stakeholder analysis / update register before tweaking list alone",
    trap: "Edit distribution list by gut without analysis",
    test: (b) =>
      /stakeholder analysis|identify stakeholder|stakeholder register|distribution list|new stakeholder|current information needs|salience model|present detailed market analysis, business plan/i.test(
        b,
      ),
  },
  {
    id: "compliance-research",
    title: "Compliance research before proceed",
    cue: "new requirement after charter · specialty regs · ambiguity",
    action: "Research compliance requirement (BA) before authorizing work",
    trap: "Start anyway · assume sponsor already cleared regs",
    test: (b) =>
      /research the compliance requirement|compliance requirement and provide|ask the business analyst to research/i.test(
        b,
      ),
  },
];

function correctOptionTexts(q) {
  const keys = new Set(
    String(q?.correct || "")
      .split(/[,;]/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean),
  );
  return (q?.options || [])
    .filter((o) => keys.has(String(o.key || "").toUpperCase()))
    .map((o) => o.text);
}

function blobFor(q, ex, sig, { includeDistractors = false } = {}) {
  const parts = [
    q?.text,
    q?.correctLabel,
    ...correctOptionTexts(q),
    ...(sig?.whySolutionBullets || []),
    sig?.signalAnswer,
  ];
  if (includeDistractors) {
    parts.push(...(q?.options || []).map((o) => `${o.key}. ${o.text}`));
  }
  return parts.filter(Boolean).join("\n");
}

function assign(q, ex, sig) {
  const primary = blobFor(q, ex, sig, { includeDistractors: false });
  for (const p of PATTERNS) {
    if (p.test(primary)) return p.id;
  }
  const wide = blobFor(q, ex, sig, { includeDistractors: true });
  for (const p of PATTERNS) {
    if (p.test(wide)) return p.id;
  }
  return "other";
}

function patternMeta() {
  return PATTERNS.map(({ id, title, cue, action, trap }) => ({
    id,
    title,
    cue,
    action,
    trap,
  }));
}

module.exports = {
  PATTERNS,
  correctOptionTexts,
  blobFor,
  assign,
  patternMeta,
  TAXONOMY_VERSION: 2,
};
