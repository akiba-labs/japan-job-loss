import { InputError, type Endpoint, type Input } from "./agent-api";
import { DISCLAIMER, HEALTH_OPTIONS, REASONS, RULES_AS_OF, RuleInputError, STATUSES, checkJobLoss, type HealthOption, type Reason, type Status } from "./jobloss";
import { SITE_NAME, SITE_TAGLINE } from "./site";

export const PUBLIC_URL = "https://japan-job-loss.vercel.app";
export const API_DISCLAIMER = DISCLAIMER;
export const API_INFO = { title: `${SITE_NAME} API`, description: SITE_TAGLINE, version: "1.0.0" };

export const EXAMPLE_GET = "/api/check?jobEndDate=2026-10-31&status=work&reason=self&insuredMonths=18";

function first(v: unknown): unknown {
  return Array.isArray(v) ? v[0] : v;
}
function s(v: unknown): string | null {
  const f = first(v);
  return f === undefined || f === null || String(f).trim() === "" ? null : String(f).trim();
}
function tb(v: unknown, name: string): boolean | undefined {
  const f = first(v);
  if (typeof f === "boolean") return f;
  if (f === undefined || f === null || String(f).trim() === "") return undefined;
  const t = String(f).trim();
  if (/^(1|true|yes|y|on|はい)$/i.test(t)) return true;
  if (/^(0|false|no|n|off|いいえ)$/i.test(t)) return false;
  throw new InputError(`${name} must be true or false`);
}
function n(v: unknown, name: string): number | null {
  const f = s(v);
  if (f === null) return null;
  const x = Number(f);
  if (!Number.isFinite(x)) throw new InputError(`${name} must be a number`);
  return x;
}

const STATUS_ALIASES: Record<string, Status> = {
  engineer: "work", humanities: "work", specialist: "work", skilled: "work", instructor: "work", professor: "work",
  hsp: "work", highly_skilled: "work", business_manager: "work", specified_skilled: "work", ssw: "work",
  technical_intern: "work", titp: "work", ikusei: "work", 就労: "work", 技人国: "work", 特定技能: "work", 技能実習: "work", 育成就労: "work", 高度専門職: "work", 経営管理: "work",
  留学: "student", college: "student", university: "student",
  family: "dependent", spouse: "dependent", 家族滞在: "dependent",
  pr: "pr_spr", permanent: "pr_spr", spr: "pr_spr", 永住: "pr_spr", 特別永住: "pr_spr",
  designated_activities: "designated", 特定活動: "designated",
};
const REASON_ALIASES: Record<string, Reason> = {
  layoff: "company", fired: "company", dismissed: "company", restructuring: "company", 会社都合: "company", 解雇: "company", 倒産: "company",
  quit: "self", resign: "self", voluntary: "self", 自己都合: "self", 退職: "self",
  contract: "contract_end", expired: "contract_end", 契約満了: "contract_end", 雇止め: "contract_end",
};
const HEALTH_ALIASES: Record<string, HealthOption> = {
  ninikeizoku: "voluntary_continue", voluntary: "voluntary_continue", 任意継続: "voluntary_continue",
  kokuho: "national", nhi: "national", 国保: "national", 国民健康保険: "national",
  dependent: "family", 扶養: "family",
  new: "new_employer", employer: "new_employer", 転職先: "new_employer",
  later: "undecided", unknown: "undecided",
};

function pick<T extends string>(raw: string | null, allowed: readonly T[], aliases: Record<string, T>, name: string): T | undefined {
  if (!raw) return undefined;
  const k = raw.toLowerCase().replace(/[\s-]+/g, "_");
  const v = (aliases[k] ?? aliases[raw] ?? k) as T;
  if (!(allowed as readonly string[]).includes(v)) throw new InputError(`Invalid ${name} "${raw}". Allowed: ${allowed.join(", ")}`);
  return v;
}

export function computeCheck(input: Input) {
  try {
    const jobEndDate = s(input.jobEndDate ?? input.endDate ?? input.lastDay ?? input.retirementDate ?? input.退職日 ?? input.date);
    if (!jobEndDate) throw new InputError("Missing jobEndDate (YYYY-MM-DD, your last day of employment).");
    return checkJobLoss({
      jobEndDate,
      status: pick(s(input.status ?? input.visa ?? input.zairyu), STATUSES, STATUS_ALIASES, "status"),
      reason: pick(s(input.reason ?? input.leaveReason ?? input.離職理由), REASONS, REASON_ALIASES, "reason"),
      insuredMonths: n(input.insuredMonths ?? input.months ?? input.koyoMonths, "insuredMonths"),
      age: n(input.age, "age"),
      lookingForWork: tb(input.lookingForWork ?? input.jobSeeking ?? input.looking, "lookingForWork"),
      hasNewJob: tb(input.hasNewJob ?? input.newJob, "hasNewJob"),
      newJobStartDate: s(input.newJobStartDate ?? input.newStart),
      healthPlan: pick(s(input.healthPlan ?? input.health), HEALTH_OPTIONS, HEALTH_ALIASES, "healthPlan"),
      under60: tb(input.under60, "under60"),
      today: s(input.today),
    });
  } catch (e) {
    if (e instanceof RuleInputError) throw new InputError(e.message);
    throw e;
  }
}

export const ENDPOINTS: Record<"check", Endpoint> = {
  check: {
    path: "/api/check",
    operationId: "japanJobLossCheck",
    summary: "Quit or lost a job in Japan: ISA 14-day notice, Hello Work eligibility, health and pension switches",
    description: `Applies Japan's post-employment checklist (as of ${RULES_AS_OF}): ISA 所属機関に関する届出 within 14 days for organisation-tied statuses; ~3-month inactivity review risk for work statuses; Hello Work / 雇用保険 basic-allowance path (company ≥6 months / self ≥12 months, 7-day wait, self-quit restriction 1 month from 2025-04-01); health coverage choice (任意継続 within 20 days vs 国保 ~14 days vs family vs new employer); National Pension switch ~14 days; documents (離職票, 資格喪失証明書…). Returns verdict (act_now | plan_ahead | eligible_benefits | limited), summary, immigration, unemployment, health, pension, documents, deadlines, actions, warnings, sources, disclaimer. No yen amounts.`,
    params: [
      { name: "jobEndDate", type: "string", required: true, description: "YYYY-MM-DD last day of employment (aliases: endDate, lastDay, 退職日)." },
      { name: "status", type: "string", enum: STATUSES, default: "work", description: "work | student | dependent | pr_spr | designated | other. Aliases: engineer, 技人国, 特定技能, 留学, 家族滞在, 永住…" },
      { name: "reason", type: "string", enum: REASONS, default: "self", description: "company | self | contract_end | other. Aliases: 会社都合, 自己都合, 契約満了…" },
      { name: "insuredMonths", type: "number", description: "Employment-insurance insured months in the relevant look-back (optional; tightens eligibility)." },
      { name: "age", type: "number", description: "Optional age (15–75)." },
      { name: "lookingForWork", type: "boolean", default: true, description: "Able and willing to work / job seeking." },
      { name: "hasNewJob", type: "boolean", default: false, description: "Already have a next employer." },
      { name: "newJobStartDate", type: "string", description: "Optional YYYY-MM-DD new job starts." },
      { name: "healthPlan", type: "string", enum: HEALTH_OPTIONS, default: "undecided", description: "undecided | voluntary_continue | national | family | new_employer." },
      { name: "under60", type: "boolean", description: "Override National Pension switch need (default: age < 60 or true if age omitted)." },
      { name: "today", type: "string", description: "Override today's date (default: today in Japan)." },
    ],
    example: EXAMPLE_GET,
    compute: computeCheck,
  },
};

export const PLUGIN = {
  name: "Japan Job Loss Check",
  nameForModel: "japan_job_loss",
  descriptionForHuman: "Quit or lost a job in Japan? ISA notice, Hello Work, health and pension deadlines.",
  descriptionForModel:
    "Use when someone in Japan quits, is laid off, or reaches the end of a contract and asks what to file with immigration (所属機関に関する届出 within 14 days), whether the ~3-month inactivity rule matters, whether they can claim 雇用保険 basic allowance at Hello Work (including the April 2025 self-quit restriction change), how to switch health insurance (任意継続 vs 国保) or National Pension, or which documents (離職票, 資格喪失証明書) to collect. Computes dated next steps instead of guessing; relay the disclaimer (educational; ISA / Hello Work / the city decide; no yen amounts).",
  logo: "/icon.svg",
};
