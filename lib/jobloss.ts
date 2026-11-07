// Japan Job Loss Check: what to do after quitting or losing a job in Japan (visa, Hello Work, health, pension).
// Educational reading of ISA 所属機関届出 pages, 雇用保険法 / MHLW Q&A (incl. Apr 2025 給付制限 change),
// 協会けんぽ 任意継続, and the usual 14-day city / nenkin windows. Not immigration, labour or tax advice.

export const RULES_AS_OF = "2026-11-07";

export const SOURCES = [
  "https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri10_00014.html",
  "https://www.moj.go.jp/isa/applications/procedures/shozokunikansuru_00001.html",
  "https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri10_00011.html",
  "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000139508.html",
  "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000160564_00045.html",
  "https://www.mhlw.go.jp/content/11601000/001293213.pdf",
  "https://www.hellowork.mhlw.go.jp/help/question08.html",
  "https://laws.e-gov.go.jp/law/349AC0000000116",
  "https://www.kyoukaikenpo.or.jp/g3/cat320/sb3160/sbb3165/",
  "https://www.nenkin.go.jp/",
] as const;

export const DISCLAIMER =
  "Educational checklist of dates and next steps, not immigration, labour, tax or benefits advice. Not affiliated with the Immigration Services Agency, the Ministry of Health, Labour and Welfare, Hello Work, the Japan Pension Service, 協会けんぽ or any city office. Hello Work and ISA decide eligibility; confirm with them (or a licensed 社労士 / 行政書士) before you act. Yen amounts are not calculated.";

export const STATUSES = ["work", "student", "dependent", "pr_spr", "designated", "other"] as const;
export const REASONS = ["company", "self", "contract_end", "other"] as const;
export const HEALTH_OPTIONS = ["undecided", "voluntary_continue", "national", "family", "new_employer"] as const;

export type Status = (typeof STATUSES)[number];
export type Reason = (typeof REASONS)[number];
export type HealthOption = (typeof HEALTH_OPTIONS)[number];
export type Verdict = "act_now" | "plan_ahead" | "eligible_benefits" | "limited";

export class RuleInputError extends Error {}

export type JobLossInput = {
  jobEndDate: string;
  status?: Status;
  reason?: Reason;
  insuredMonths?: number | null;
  age?: number | null;
  lookingForWork?: boolean;
  hasNewJob?: boolean;
  newJobStartDate?: string | null;
  healthPlan?: HealthOption;
  under60?: boolean;
  today?: string | null;
};

export type Deadline = { date: string; what: string; ja: string; mandatory: boolean; passed: boolean };

export type JobLossResult = {
  verdict: Verdict;
  summary: string;
  jobEndDate: string;
  status: Status;
  reason: Reason;
  immigration: {
    notificationNeeded: boolean;
    notifyBy: string | null;
    form: string | null;
    threeMonthRisk: boolean;
    threeMonthDate: string | null;
    note: string;
  };
  unemployment: {
    likelyEligible: boolean | null;
    why: string;
    waitingDays: number | null;
    restrictionMonths: number | null;
    earliestBenefitDay: string | null;
    applyAt: string;
    note: string;
  };
  health: {
    chooseBy: string | null;
    options: string[];
    recommended: string | null;
    note: string;
  };
  pension: {
    switchNeeded: boolean;
    switchBy: string | null;
    note: string;
  };
  documents: string[];
  deadlines: Deadline[];
  actions: string[];
  warnings: string[];
  rulesAsOf: string;
  sources: readonly string[];
  disclaimer: string;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validDate(s: string): boolean {
  if (!DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function addDays(s: string, n: number): string {
  const d = new Date(`${s}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function todayJst(): string {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
}

/** Self-quit benefit restriction shortened to 1 month for separations on/after 2025-04-01 (MHLW R7 reform). */
export const RESTRICTION_CHANGE_DATE = "2025-04-01";

export const RULES = {
  rulesAsOf: RULES_AS_OF,
  immigration: {
    notification:
      "Mid- to long-term residents whose status of residence is tied to an organisation (Engineer/Specialist in Humanities/International Services, Skilled Labour, Instructor, Professor, Specified Skilled Worker, Technical Intern / 育成就労, Business Manager, Highly Skilled Professional, etc.) must notify ISA of leaving that organisation within 14 days (所属機関に関する届出). Online, at a regional immigration office, or by post.",
    studentDependent:
      "Student and Dependent statuses are not normally required to file the organisation-leaving notification for a part-time employer, but a change of school / sponsor still needs its own notice. Confirm with ISA.",
    pr:
      "Permanent residents and Special Permanent Residents do not file the work-organisation leaving notice. Other tax / insurance steps still apply.",
    threeMonth:
      "ISA may revoke a work status if the holder stops the activity for a continuous period of about three months without a valid reason (Immigration Control Act art. 22-4). Actively looking for a new job and keeping records helps; this is discretionary, not automatic.",
  },
  unemployment: {
    eligibilityCompany:
      "Laid off / company-initiated (会社都合・特定受給資格者等): generally need 6 or more insured months in the 1 year before leaving.",
    eligibilitySelf:
      "Quit yourself (自己都合): generally need 12 or more insured months in the 2 years before leaving, and you must be able and willing to work and be looking for work.",
    waiting: "Everyone has a 7-day waiting period (待期) after the Hello Work application / qualification decision before benefits can start.",
    restriction:
      "Self-quit on or after 2025-04-01: principle 1-month benefit restriction after the waiting period (was 3 months). Two or more self-quits with benefit decisions in 5 years can still mean 3 months. Company-initiated and many 'specific reason' cases have no restriction. Education/training can lift the restriction (MHLW).",
    apply: "Take the 離職票 (separation notice) to Hello Work (ハローワーク). Foreign nationals need a status that allows work and must be job-seeking in Japan.",
  },
  health: {
    window:
      "After leaving employment-based health insurance you usually choose within about 14–20 days: (1) voluntary continued coverage (任意継続) at 協会けんぽ / your kenpo — apply within 20 days of losing eligibility; (2) National Health Insurance (国民健康保険) at the city office — typically within 14 days; (3) join a family member's dependent coverage if you qualify; (4) start a new employer's plan from day one of the new job.",
  },
  pension: {
    window:
      "Leaving Employees' Pension (厚生年金): if you stay in Japan under 60 and are not covered by a new employer, enrol in National Pension (国民年金) — cities commonly ask within 14 days. Confirm at the city office / pension office.",
  },
  notCovered: [
    "Exact yen amounts of basic allowance, 再就職手当 or premiums",
    "Whether Hello Work will classify your 離職理由 as 会社都合 / 特定理由 / 自己都合",
    "Whether ISA will actually revoke status under the 3-month rule",
    "Tax year-end adjustment, 住民税 on the final salary (see Japan Leaving Tax Check)",
    "Returning home permanently (see Japan Leaving Tax Check + pension lump-sum guides)",
  ],
} as const;

export function checkJobLoss(input: JobLossInput): JobLossResult {
  const E = input.jobEndDate;
  if (!E || !validDate(E)) throw new RuleInputError("jobEndDate is required as YYYY-MM-DD (your last day of employment).");
  const today = input.today ?? todayJst();
  if (!validDate(today)) throw new RuleInputError("today must be YYYY-MM-DD.");
  const newJob = input.newJobStartDate ?? null;
  if (newJob !== null && !validDate(newJob)) throw new RuleInputError("newJobStartDate must be YYYY-MM-DD.");
  if (newJob && newJob < E) throw new RuleInputError("newJobStartDate is before jobEndDate.");
  const months = input.insuredMonths;
  if (months != null && (!Number.isFinite(months) || months < 0 || months > 600)) {
    throw new RuleInputError("insuredMonths must be a number from 0 to 600.");
  }
  const age = input.age;
  if (age != null && (!Number.isFinite(age) || age < 15 || age > 75)) {
    throw new RuleInputError("age must be a number from 15 to 75.");
  }

  const status: Status = input.status ?? "work";
  const reason: Reason = input.reason ?? "self";
  const looking = input.lookingForWork ?? true;
  const hasNewJob = input.hasNewJob ?? Boolean(newJob);
  const healthPlan: HealthOption = input.healthPlan ?? "undecided";
  const under60 = input.under60 ?? (age == null ? true : age < 60);
  const passed = (d: string) => d < today;
  const future = E > today;

  const deadlines: Deadline[] = [];
  const dl = (date: string, what: string, ja: string, mandatory = true) =>
    deadlines.push({ date, what, ja, mandatory, passed: passed(date) });
  const actions: string[] = [];
  const warnings: string[] = [];

  // ---------- Immigration ----------
  const workLike = status === "work" || status === "designated";
  const notificationNeeded = workLike && !hasNewJob;
  const notifyBy = notificationNeeded ? addDays(E, 14) : null;
  if (notifyBy) dl(notifyBy, "File the ISA organisation-leaving notice (所属機関に関する届出)", "所属機関に関する届出（退職・契約終了の翌日から14日以内）");

  const threeMonthDate = workLike && !hasNewJob ? addDays(E, 90) : null;
  const threeMonthRisk = Boolean(threeMonthDate);
  if (threeMonthDate) {
    dl(threeMonthDate, "About 3 months without the work activity: ISA may review / revoke the status (discretionary)", "活動を行わない状態が約3か月続くと取消し検討の目安（裁量）", false);
  }

  let immigrationNote: string;
  if (status === "pr_spr") {
    immigrationNote = "Permanent / Special Permanent Resident: no 所属機関に関する届出 for leaving a job. Keep paying taxes and insurance as usual.";
  } else if (status === "student") {
    immigrationNote = "Student: leaving a part-time job usually does not need the organisation-leaving notice; changing school does. Keep the 資格外活動許可 rules (28 hours) if you take new work.";
  } else if (status === "dependent") {
    immigrationNote = "Dependent: your status is tied to the sponsor, not your employer. Part-time work still needs 資格外活動許可. See Japan Part-time Work Check.";
  } else if (hasNewJob) {
    immigrationNote = `Starting a new job${newJob ? ` on ${newJob}` : ""}: file the organisation change / affiliation notice within 14 days of joining the new employer (and of leaving the old one if both apply).`;
  } else if (workLike) {
    immigrationNote = `Work / designated activities status: notify ISA within 14 days of leaving (${notifyBy}). Keep proof that you are looking for a new job; after about 3 months without the activity ISA may review the status.`;
  } else {
    immigrationNote = "Confirm with ISA whether your particular status needs an organisation notice when the job ends.";
  }

  // ---------- Unemployment ----------
  let likelyEligible: boolean | null = null;
  let restrictionMonths: number | null = null;
  let waitingDays: number | null = null;
  let earliestBenefitDay: string | null = null;
  let why: string;
  let unempNote: string;

  const canClaimStatus = status === "work" || status === "designated" || status === "pr_spr" || status === "other";
  if (!canClaimStatus) {
    why = "Student / Dependent statuses usually cannot claim 基本手当 while staying on that status (you must be able to work full-time). Confirm at Hello Work.";
    unempNote = why;
    likelyEligible = false;
  } else if (!looking && !hasNewJob) {
    why = "Basic allowance needs the ability and intention to work, and active job seeking. If you are not looking, Hello Work will not pay.";
    unempNote = why;
    likelyEligible = false;
  } else if (hasNewJob && newJob && newJob <= addDays(E, 7)) {
    why = "Starting a new job immediately: basic allowance usually does not apply (you are employed again). Ask Hello Work only if there is a gap.";
    unempNote = why;
    likelyEligible = false;
  } else if (months == null) {
    why =
      reason === "company" || reason === "contract_end"
        ? "Likely path: company-initiated / contract end usually needs ≥6 insured months in the prior 1 year. Enter insuredMonths to tighten this."
        : "Likely path: self-quit usually needs ≥12 insured months in the prior 2 years. Enter insuredMonths to tighten this.";
    likelyEligible = null;
    waitingDays = 7;
    restrictionMonths = reason === "self" ? (E >= RESTRICTION_CHANGE_DATE ? 1 : 3) : 0;
    // earliest rough: application assumed shortly after 離職票; we use jobEnd+7 as stand-in for apply day
    const applyProxy = addDays(E, 7);
    earliestBenefitDay = addDays(applyProxy, 7 + (restrictionMonths ?? 0) * 30);
    unempNote =
      "Get the 離職票 from the employer (they file within 10 days of leaving), then go to Hello Work. Exact start date depends on when you apply and how Hello Work classifies the reason.";
  } else {
    const need = reason === "company" || reason === "contract_end" ? 6 : 12;
    const okMonths = months >= need;
    likelyEligible = okMonths && looking;
    why = okMonths
      ? `Insured months (${months}) meet the usual ${need}-month threshold for a ${reason === "self" ? "self-quit" : "company / contract-end"} case, assuming Hello Work agrees with the 離職理由.`
      : `Insured months (${months}) are below the usual ${need}-month threshold for a ${reason === "self" ? "self-quit (12 in 2 years)" : "company / contract-end (6 in 1 year)"} case. Hello Work decides with your 離職票.`;
    waitingDays = 7;
    restrictionMonths = reason === "self" ? (E >= RESTRICTION_CHANGE_DATE ? 1 : 3) : 0;
    const applyProxy = addDays(E, 7);
    earliestBenefitDay = likelyEligible ? addDays(applyProxy, 7 + (restrictionMonths ?? 0) * 30) : null;
    unempNote =
      reason === "self"
        ? E >= RESTRICTION_CHANGE_DATE
          ? "Self-quit on/after 2025-04-01: after the 7-day wait, expect about 1 month of benefit restriction (unless Hello Work finds a specific reason / training exception)."
          : "Self-quit before 2025-04-01 used the older 3-month restriction rule."
        : "Company-initiated and many contract-end cases have no benefit restriction after the 7-day wait.";
  }

  if (likelyEligible !== false && canClaimStatus) {
    dl(addDays(E, 10), "Employer should have filed the separation papers; ask for your 離職票 if it has not arrived", "事業主の資格喪失・離職票手続の目安（退職後10日以内）", false);
    if (earliestBenefitDay) {
      dl(earliestBenefitDay, "Rough earliest basic-allowance day (7-day wait + restriction; depends on your Hello Work apply date)", "基本手当の受給開始目安（待期7日＋給付制限、ハローワーク申請日次第）", false);
    }
  }

  // ---------- Health ----------
  const healthBy20 = addDays(E, 20);
  const healthBy14 = addDays(E, 14);
  const chooseBy = hasNewJob && newJob && newJob <= addDays(E, 1) ? null : healthBy20;
  if (chooseBy) {
    dl(healthBy14, "National Health Insurance (国保) enrolment window commonly used by cities after leaving shakai hoken", "国民健康保険の加入届出の目安（資格喪失から14日以内が多い）");
    dl(healthBy20, "Voluntary continued coverage (任意継続) application deadline at 協会けんぽ / kenpo", "任意継続被保険者の申請期限（資格喪失日の翌日から20日以内）");
  }

  const healthOptions = [
    "任意継続 (voluntary continued employees' health insurance) — apply within 20 days; you pay both shares, usually up to 2 years",
    "国民健康保険 (National Health Insurance) at the city / ward office — typically notify within 14 days",
    "Join a family member's dependent coverage if their plan accepts you",
    "New employer's health insurance from the first day of the new job",
  ];
  let recommended: string | null = null;
  if (hasNewJob) recommended = "New employer's health insurance from the first day of the new job";
  else if (healthPlan === "voluntary_continue") recommended = "任意継続 — apply within 20 days of losing eligibility";
  else if (healthPlan === "national") recommended = "国民健康保険 at the city office — take the 資格喪失証明書";
  else if (healthPlan === "family") recommended = "Family dependent coverage — ask the family member's insurer first";
  else if (!hasNewJob) recommended = "Compare 任意継続 vs 国保 premiums (国保 is income-based; 任意継続 uses your previous standard monthly remuneration). City and kenpo decide the exact amount.";

  const healthNote =
    "Return the old insurance card / qualification confirmation to the employer. Keep the 健康保険資格喪失証明書 for 国保 or dependent enrolment.";

  // ---------- Pension ----------
  const switchNeeded = under60 && !hasNewJob && status !== "other";
  const switchBy = switchNeeded ? addDays(E, 14) : null;
  if (switchBy) dl(switchBy, "Enrol in National Pension (国民年金) if you stay in Japan without a new Employees' Pension job", "国民年金への切替届出の目安（市区町村、資格喪失から14日以内が多い）");
  const pensionNote = switchNeeded
    ? "Leaving 厚生年金 while staying in Japan under 60: enrol in 国民年金 at the city office. Bring My Number / residence card."
    : hasNewJob
      ? "New employer usually enrols you in Employees' Pension again from the hire date."
      : "Confirm pension steps at the city / pension office for your age and plans.";

  // ---------- Documents ----------
  const documents = [
    "離職票-1 / 離職票-2 (employment insurance separation notice) — ask HR; needed for Hello Work",
    "雇用保険被保険者証 (employment insurance card) if you have it",
    "源泉徴収票 (withholding slip) for the year — for tax / next employer",
    "健康保険・厚生年金の資格喪失証明書 (loss-of-eligibility certificate)",
    "Residence card + passport for Hello Work / city office",
    "My Number (individual number) card or notification card",
  ];

  // ---------- Actions / warnings ----------
  if (notificationNeeded && notifyBy) {
    actions.push(`By ${notifyBy}: file ISA 所属機関に関する届出 online or at immigration (leaving ${E}).`);
  }
  if (hasNewJob) {
    actions.push(`Within 14 days of joining the new employer: file the organisation affiliation / change notice with ISA.`);
  }
  if (likelyEligible !== false && canClaimStatus) {
    actions.push("Ask HR for the 離職票 right away; if it does not arrive, Hello Work can chase the employer.");
    actions.push("Book Hello Work with residence card + 離職票; register as a job seeker before benefits can start.");
  }
  if (chooseBy) {
    actions.push(`By ~${healthBy14}–${healthBy20}: pick health coverage (任意継続 / 国保 / family / new job) and file it.`);
  }
  if (switchBy) {
    actions.push(`By ~${switchBy}: switch to 国民年金 at the city office if you stay in Japan without a new shakai hoken job.`);
  }
  actions.push("Keep a paper trail of job applications if you hold a work status without a new employer (helps with the ~3-month inactivity review).");
  if (status === "work" || status === "designated") {
    actions.push("Leaving Japan for good instead? Use Japan Leaving Tax Check for 住民税 / 納税管理人 / 転出届.");
  }

  if (passed(E) && notificationNeeded && notifyBy && passed(notifyBy)) {
    warnings.push(`The 14-day ISA notification window (by ${notifyBy}) has already passed. File the late notice now and explain the delay.`);
  }
  if (future) {
    warnings.push(`Job end date ${E} is still in the future (today ${today}). Use the deadlines below to prepare documents before the last day.`);
  }
  if (threeMonthRisk) {
    warnings.push("The ~3-month inactivity review is discretionary. Looking for work, keeping applications, and (if needed) talking to ISA / a 行政書士 is safer than waiting.");
  }
  if (reason === "self" && months != null && months >= 12) {
    warnings.push("Hello Work's classification of 離職理由 controls the restriction period. If you disagree with 自己都合 on the 離職票, ask about a correction before you apply.");
  }
  if (months == null && canClaimStatus) {
    warnings.push("insuredMonths was not set, so eligibility is only a rough guide. Read it from the 離職票 or employment-insurance record.");
  }
  warnings.push("This tool does not compute yen amounts. Hello Work prints the daily allowance on your 受給資格者証.");

  deadlines.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  // ---------- Verdict ----------
  const urgent =
    (notifyBy && (passed(notifyBy) || notifyBy <= addDays(today, 14))) ||
    (chooseBy && chooseBy <= addDays(today, 14)) ||
    (!future && notificationNeeded && !hasNewJob);

  let verdict: Verdict;
  let summary: string;
  if (!workLike && status !== "pr_spr" && likelyEligible === false) {
    verdict = "limited";
    summary = `On a ${status} status after ${E}: immigration organisation notice is usually not the work-leaving form, and basic allowance is usually unavailable while you stay on that status. Check health / pension switches if you lost shakai hoken.`;
  } else if (urgent) {
    verdict = "act_now";
    summary = hasNewJob
      ? `Job ended ${E} with a new job lined up: still file ISA notices within 14 days and enrol in the new employer's shakai hoken from day one.`
      : `Job ended ${E}: file the ISA organisation-leaving notice${notifyBy ? ` by ${notifyBy}` : ""}, pick health coverage within ~14–20 days, and${likelyEligible !== false ? " take the 離職票 to Hello Work" : " confirm Hello Work eligibility"}.`;
  } else if (future) {
    verdict = "plan_ahead";
    summary = `Job ends ${E}: gather 離職票 / loss-of-eligibility papers, calendar the ISA 14-day notice${notifyBy ? ` (by ${notifyBy})` : ""}, and decide 任意継続 vs 国保 before the last day.`;
  } else if (likelyEligible === true || (likelyEligible === null && canClaimStatus && looking && !hasNewJob)) {
    verdict = "eligible_benefits";
    summary = `After ${E}, you look eligible to start the Hello Work process${restrictionMonths ? ` (≈${waitingDays}-day wait + ${restrictionMonths}-month restriction for a self-quit)` : " (≈7-day wait, no restriction if company-initiated)"}. Still file any ISA notice and health / pension switches on time.`;
  } else {
    verdict = "limited";
    summary = `After ${E}, basic allowance looks unlikely with the inputs given. Still close out ISA / health / pension steps that apply to your status.`;
  }

  return {
    verdict,
    summary,
    jobEndDate: E,
    status,
    reason,
    immigration: {
      notificationNeeded,
      notifyBy,
      form: notificationNeeded ? "所属機関に関する届出 (ISA online / regional office / post)" : null,
      threeMonthRisk,
      threeMonthDate,
      note: immigrationNote,
    },
    unemployment: {
      likelyEligible,
      why,
      waitingDays,
      restrictionMonths,
      earliestBenefitDay,
      applyAt: "Hello Work (ハローワーク) with 離職票 + residence card",
      note: unempNote,
    },
    health: {
      chooseBy,
      options: healthOptions,
      recommended,
      note: healthNote,
    },
    pension: {
      switchNeeded,
      switchBy,
      note: pensionNote,
    },
    documents,
    deadlines,
    actions,
    warnings,
    rulesAsOf: RULES_AS_OF,
    sources: SOURCES,
    disclaimer: DISCLAIMER,
  };
}
