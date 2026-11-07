import { HEALTH_OPTIONS, REASONS, STATUSES, checkJobLoss, type HealthOption, type JobLossInput, type Reason, type Status } from "./jobloss";

export { PUBLIC_URL } from "./api";

type Params = URLSearchParams | Record<string, string | string[] | undefined>;
function one(p: Params, k: string): string | null {
  const v = p instanceof URLSearchParams ? p.get(k) : p[k];
  const f = Array.isArray(v) ? v[0] : v;
  return f === undefined || f === null || f === "" ? null : String(f);
}
const ISO = /^\d{4}-\d{2}-\d{2}$/;
function date(p: Params, k: string): string | null {
  const v = one(p, k);
  return v && ISO.test(v) ? v : null;
}
function flag(p: Params, k: string): boolean {
  return one(p, k) === "1";
}
function oneOf<T extends string>(p: Params, k: string, allowed: readonly T[], fallback: T): T {
  const v = one(p, k);
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}
function num(p: Params, k: string): number | null {
  const v = one(p, k);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export type Shared = {
  jobEndDate: string;
  status: Status;
  reason: Reason;
  insuredMonths: number | null;
  lookingForWork: boolean;
  hasNewJob: boolean;
  newJobStartDate: string | null;
  healthPlan: HealthOption;
  today: string | null;
};

export const EXAMPLE_SHARED: Shared = {
  jobEndDate: "2026-10-31",
  status: "work",
  reason: "self",
  insuredMonths: 18,
  lookingForWork: true,
  hasNewJob: false,
  newJobStartDate: null,
  healthPlan: "undecided",
  today: "2026-11-07",
};
export const EXAMPLE_COMPANY: Shared = { ...EXAMPLE_SHARED, reason: "company", insuredMonths: 8 };
export const EXAMPLE_FUTURE: Shared = { ...EXAMPLE_SHARED, jobEndDate: "2026-12-20", insuredMonths: 24, today: "2026-11-07" };
export const EXAMPLES = [EXAMPLE_SHARED, EXAMPLE_COMPANY, EXAMPLE_FUTURE];

export function parseShared(p: Params): Shared | null {
  const e = date(p, "e");
  if (!e) return null;
  return {
    jobEndDate: e,
    status: oneOf(p, "s", STATUSES, "work"),
    reason: oneOf(p, "r", REASONS, "self"),
    insuredMonths: num(p, "m"),
    lookingForWork: !flag(p, "nl"),
    hasNewJob: flag(p, "nj"),
    newJobStartDate: date(p, "ns"),
    healthPlan: oneOf(p, "h", HEALTH_OPTIONS, "undecided"),
    today: date(p, "t"),
  };
}

export function sharedQuery(s: Shared): string {
  const q = new URLSearchParams();
  q.set("e", s.jobEndDate);
  if (s.status !== "work") q.set("s", s.status);
  if (s.reason !== "self") q.set("r", s.reason);
  if (s.insuredMonths != null) q.set("m", String(s.insuredMonths));
  if (!s.lookingForWork) q.set("nl", "1");
  if (s.hasNewJob) q.set("nj", "1");
  if (s.newJobStartDate) q.set("ns", s.newJobStartDate);
  if (s.healthPlan !== "undecided") q.set("h", s.healthPlan);
  if (s.today) q.set("t", s.today);
  return q.toString();
}

export function toCheckInput(s: Shared): JobLossInput {
  return { ...s };
}
export function safeCheck(s: Shared) {
  try {
    return checkJobLoss(toCheckInput(s));
  } catch {
    return null;
  }
}
export function resultPath(s: Shared): string {
  return `/r?${sharedQuery(s)}`;
}
export function ogPath(s: Shared): string {
  return `/og?${sharedQuery(s)}`;
}
export function isIndexable(s: Shared): boolean {
  return EXAMPLES.some((e) => resultPath(e) === resultPath(s));
}
