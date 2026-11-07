import type { Metadata } from "next";
import { RULES_AS_OF, SOURCES } from "@/lib/jobloss";
import { DISCLAIMER_SHORT, HONESTY } from "@/lib/site";

export const metadata: Metadata = { title: "Disclaimer", description: DISCLAIMER_SHORT };

export default function DisclaimerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Read this</p>
      <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Disclaimer</h1>
      <p className="mt-4 text-lg text-foreground">{DISCLAIMER_SHORT}</p>
      <p className="mt-2 text-muted">{HONESTY}</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground">What this is</h2>
          <p className="mt-2">
            A free educational checklist. It applies a dated reading (as of {RULES_AS_OF}) of Immigration Services Agency organisation-notification pages, Ministry of Health, Labour and Welfare / Hello Work employment-insurance guidance (including the April 2025 benefit-restriction change), 協会けんぽ voluntary-continued coverage rules and the usual municipal National Health Insurance / National Pension windows to the dates and choices you enter.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">What it is not</h2>
          <p className="mt-2">
            It is not immigration, labour, tax or benefits advice and is not affiliated with the Immigration Services Agency, the Ministry of Health, Labour and Welfare, Hello Work, the Japan Pension Service, 協会けんぽ or any city or ward office. It does not calculate yen amounts, decide how Hello Work will classify your 離職理由, or decide whether ISA will revoke a status under the ~3-month inactivity review. Hello Work, ISA and your city decide; confirm with them, or a licensed 社労士 / 行政書士, before you act.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">How dates are counted</h2>
          <p className="mt-2">
            The ISA organisation-leaving notice is due within 14 days of the day the affiliation ends. The ~3-month inactivity marker is counted as about 90 days after the job end and is discretionary. Health: 国保 is commonly filed within 14 days; 任意継続 applications are due within 20 days of losing eligibility. National Pension enrolment is commonly asked within 14 days when you stay in Japan without a new Employees&apos; Pension job. Earliest benefit-day estimates assume you apply at Hello Work about a week after the job ends, then add the 7-day wait and any restriction months — your real date depends on when you apply. Treat every date as the latest safe day, not a target.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {SOURCES.map((s) => (
              <li key={s}>
                <a href={s} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
