"use client";

import { useState, useSyncExternalStore } from "react";
import { CardDisclaimer } from "@/components/card-disclaimer";
import { ShareBar } from "@/components/share-bar";
import type { HealthOption, Reason, Status } from "@/lib/jobloss";
import { EXAMPLE_SHARED, PUBLIC_URL, resultPath, safeCheck, type Shared } from "@/lib/share";
import { VERDICT_LABEL, VERDICT_STYLE } from "@/lib/verdict";

const field = "mt-2 w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-sm text-foreground focus:border-amber";
const noopSubscribe = () => () => {};

function DateField({ label, value, set, testid }: { label: string; value: string; set: (v: string) => void; testid?: string }) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input data-testid={testid} type="date" className={field} value={value} onChange={(e) => set(e.target.value)} />
    </label>
  );
}

function Check({ label, value, set, testid }: { label: string; value: boolean; set: (v: boolean) => void; testid?: string }) {
  return (
    <label className="mt-3 flex items-start gap-2 text-sm text-foreground">
      <input data-testid={testid} type="checkbox" className="mt-1" checked={value} onChange={(e) => set(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function Calculator({ initial }: { initial?: Shared }) {
  const start = initial ?? EXAMPLE_SHARED;
  const [jobEndDate, setEnd] = useState(start.jobEndDate);
  const [status, setStatus] = useState<Status>(start.status);
  const [reason, setReason] = useState<Reason>(start.reason);
  const [insuredMonths, setMonths] = useState(start.insuredMonths != null ? String(start.insuredMonths) : "");
  const [lookingForWork, setLooking] = useState(start.lookingForWork);
  const [hasNewJob, setNewJob] = useState(start.hasNewJob);
  const [newJobStartDate, setNewStart] = useState(start.newJobStartDate ?? "");
  const [healthPlan, setHealth] = useState<HealthOption>(start.healthPlan);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [todayEdit, setToday] = useState<string | null>(null);
  const today = todayEdit ?? (initial || !hydrated ? (start.today ?? "") : "");

  const monthsNum = insuredMonths.trim() === "" ? null : Number(insuredMonths);
  const shared: Shared = {
    jobEndDate,
    status,
    reason,
    insuredMonths: monthsNum != null && Number.isFinite(monthsNum) ? monthsNum : null,
    lookingForWork,
    hasNewJob,
    newJobStartDate: hasNewJob && newJobStartDate ? newJobStartDate : null,
    healthPlan,
    today: today || null,
  };
  const r = jobEndDate ? safeCheck(shared) : null;
  const shareUrl = `${PUBLIC_URL}${resultPath(shared)}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.3fr]">
      <div className="rounded-3xl border border-line bg-panel/60 p-5 sm:p-6">
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">Your job end</p>
        <DateField label="Last day of employment (退職日)" value={jobEndDate} set={setEnd} testid="jobend" />
        <label className="mt-4 block">
          <span className="text-sm font-medium text-foreground">Status of residence</span>
          <select data-testid="status" className={field} value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            <option value="work">Work (技人国 / 特定技能 / HSP / 技能実習…)</option>
            <option value="designated">Designated Activities (特定活動)</option>
            <option value="student">Student (留学)</option>
            <option value="dependent">Dependent (家族滞在)</option>
            <option value="pr_spr">Permanent / SPR (永住・特別永住)</option>
            <option value="other">Other / not sure</option>
          </select>
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-foreground">Why the job ended</span>
          <select data-testid="reason" className={field} value={reason} onChange={(e) => setReason(e.target.value as Reason)}>
            <option value="self">I quit (自己都合)</option>
            <option value="company">Laid off / company reason (会社都合)</option>
            <option value="contract_end">Contract ended (契約満了)</option>
            <option value="other">Other / not sure</option>
          </select>
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-foreground">Employment-insurance months (optional)</span>
          <input data-testid="months" type="number" min={0} max={600} className={field} value={insuredMonths} onChange={(e) => setMonths(e.target.value)} placeholder="e.g. 18" />
        </label>
        <Check label="I am looking for work / able to work" value={lookingForWork} set={setLooking} testid="looking" />
        <Check label="I already have a new job" value={hasNewJob} set={setNewJob} testid="newjob" />
        {hasNewJob ? <DateField label="New job starts on" value={newJobStartDate} set={setNewStart} testid="newstart" /> : null}
        <label className="mt-4 block">
          <span className="text-sm font-medium text-foreground">Health insurance plan</span>
          <select data-testid="health" className={field} value={healthPlan} onChange={(e) => setHealth(e.target.value as HealthOption)}>
            <option value="undecided">Not decided yet</option>
            <option value="voluntary_continue">任意継続 (voluntary continue)</option>
            <option value="national">国民健康保険 (国保)</option>
            <option value="family">Join family dependent coverage</option>
            <option value="new_employer">New employer&apos;s insurance</option>
          </select>
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-muted">Check as of (optional, default today)</span>
          <input type="date" className={field} value={today} onChange={(e) => setToday(e.target.value)} />
        </label>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-line bg-panel/60">
        <div className="p-5 sm:p-7" data-testid="result">
          {r ? (
            <>
              <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">{VERDICT_LABEL[r.verdict]} · job ended {r.jobEndDate}</p>
              <p className={`mt-2 font-display text-3xl leading-tight tracking-tight sm:text-4xl ${VERDICT_STYLE[r.verdict]}`}>{r.summary}</p>

              <h3 className="mt-6 text-sm font-semibold text-foreground">Immigration</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.immigration.note}</p>
              {r.immigration.notifyBy ? <p className="mt-2 text-sm text-foreground">Notify ISA by <span className="font-mono">{r.immigration.notifyBy}</span></p> : null}

              <h3 className="mt-6 text-sm font-semibold text-foreground">Hello Work / 雇用保険</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.unemployment.why}</p>
              <p className="mt-1 text-xs text-muted">{r.unemployment.note}</p>
              {r.unemployment.earliestBenefitDay ? <p className="mt-2 text-sm text-foreground">Rough earliest benefit day: <span className="font-mono">{r.unemployment.earliestBenefitDay}</span></p> : null}

              <h3 className="mt-6 text-sm font-semibold text-foreground">Health &amp; pension</h3>
              <p className="mt-2 text-sm text-muted">{r.health.note}</p>
              {r.health.recommended ? <p className="mt-1 text-sm text-foreground">{r.health.recommended}</p> : null}
              <p className="mt-2 text-sm text-muted">{r.pension.note}</p>

              {r.deadlines.length ? (
                <>
                  <h3 className="mt-6 text-sm font-semibold text-foreground">Dates</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted">
                    {r.deadlines.map((d) => (
                      <li key={d.date + d.what} className={d.passed ? "line-through opacity-60" : ""}>
                        <span className="mr-2 font-mono text-foreground">{d.date}</span>
                        {d.what} <span className="text-xs">· {d.ja}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <h3 className="mt-6 text-sm font-semibold text-foreground">Documents</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                {r.documents.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>

              <h3 className="mt-6 text-sm font-semibold text-foreground">To do</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                {r.actions.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              {r.warnings.length ? (
                <>
                  <h3 className="mt-6 text-sm font-semibold text-foreground">Watch out</h3>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                    {r.warnings.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              <div className="mt-6">
                <ShareBar url={shareUrl} text={`Japan job loss: ${r.summary}`} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">Enter your last day of employment. Dates must be real.</p>
          )}
        </div>
        <CardDisclaimer />
      </div>
    </div>
  );
}
