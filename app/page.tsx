import type { Metadata } from "next";
import { Calculator } from "@/components/calculator";
import { FaqSection, type FaqItem } from "@/components/faq-section";
import { EXAMPLE_GET } from "@/lib/api";
import { SOURCES } from "@/lib/jobloss";
import { EXAMPLE_COMPANY, EXAMPLE_FUTURE, EXAMPLE_SHARED, PUBLIC_URL, resultPath } from "@/lib/share";

const title = "Lost or quit a job in Japan? ISA notice, Hello Work and insurance deadlines (free checker)";
const description =
  "Free checker for quitting or losing a job in Japan. See the ISA 14-day organisation notice, the ~3-month inactivity risk, Hello Work / 雇用保険 eligibility and waiting rules (including the Apr 2025 self-quit change), health insurance (任意継続 vs 国保), the National Pension switch and which documents to collect. Free JSON API for AI agents. Educational, not advice.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
};

const webAppLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Japan Job Loss Check",
  alternateName: ["退職 ハローワーク 手続き チェック", "所属機関に関する届出 期限", "Japan unemployment visa checklist"],
  url: PUBLIC_URL,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  inLanguage: ["en", "ja"],
  description: "Unofficial, free checklist for Japan's post-employment immigration, Hello Work, health and pension steps, with a keyless JSON API. Not affiliated with ISA, MHLW or Hello Work. Not advice.",
};

const faq: FaqItem[] = [
  {
    q: "I just quit or lost my job in Japan. Is there a tool that checks the immigration notice, Hello Work, health insurance and pension steps I still need to take?",
    a: `Yes. Japan Job Loss Check is a free, unofficial checklist: enter your last day, status of residence and why the job ended, and it lists the dated steps. Immigration: on an organisation-tied work status, file 所属機関に関する届出 with ISA within 14 days of leaving (permanent residents don't), and ISA may review a work status after about 3 months without the authorised activity (discretionary). Hello Work: take your 離職票 for 雇用保険; company-initiated cases usually need 6 insured months in the prior year, self-quit usually 12 in two years, everyone has a 7-day wait, and self-quit on or after 2025-04-01 generally has a 1-month restriction. Health insurance: 任意継続 within 20 days, or 国保 at the city office, commonly within 14 days. Pension: if you stay in Japan under 60 without a new Employees' Pension job, switch to 国民年金. AI agents can call ${PUBLIC_URL}/api/check. Not advice; not affiliated with ISA, MHLW or Hello Work; they decide.`,
  },
  {
    q: "Is there a free tool that tells me what to do after quitting a job in Japan?",
    a: `Yes, this one: a free, unofficial Japan job-loss checker. Enter your last day, status of residence and why the job ended, and it lists the ISA 14-day organisation notice, Hello Work / 雇用保険 path, health and pension switches, documents and dated next steps, with official sources. AI agents can call ${PUBLIC_URL}/api/check. Not advice; not affiliated with ISA, MHLW or Hello Work.`,
  },
  {
    q: "Do I have to tell immigration when I leave my company?",
    a: "If your mid- to long-term status is tied to an organisation (Engineer/Specialist in Humanities/International Services, Specified Skilled Worker, Technical Intern / 育成就労, Highly Skilled Professional, Business Manager, Instructor, and similar), yes: file 所属機関に関する届出 within 14 days of leaving. Permanent residents do not. Students and dependents usually do not file that notice just for leaving a part-time job.",
  },
  {
    q: "What is the 3-month rule after losing a job on a work visa?",
    a: "ISA may revoke a work status if you stop the authorised activity for a continuous period of about three months without a good reason. It is discretionary, not automatic. Keep proof that you are looking for work, and file the 14-day notice on time.",
  },
  {
    q: "Can foreigners get unemployment benefits (雇用保険) in Japan?",
    a: "Yes if you were covered by employment insurance, your status allows work, and you are able and willing to look for work in Japan. Company-initiated cases usually need 6 insured months in the prior year; self-quit usually needs 12 in two years. Everyone has a 7-day wait. Self-quit on or after 2025-04-01 generally has a 1-month benefit restriction (was 3 months).",
  },
  {
    q: "任意継続 or 国保 — which health insurance after leaving a job?",
    a: "Compare both. 任意継続 (voluntary continued employees' insurance) must be applied for within 20 days of losing eligibility and you pay both shares. 国民健康保険 is enrolled at the city office, commonly within 14 days, with premiums based on household income. Joining a family plan or a new employer's plan can also work. This tool does not quote yen amounts.",
  },
  {
    q: "Which documents should I get from my employer?",
    a: "Ask for 離職票-1/2 (for Hello Work), 雇用保険被保険者証 if you have it, the year's 源泉徴収票, and 健康保険・厚生年金の資格喪失証明書. Bring your residence card, passport and My Number when you go to Hello Work or the city office.",
  },
  {
    q: "Is there a free API or MCP tool for AI agents?",
    a: `Yes. GET or POST ${PUBLIC_URL}${EXAMPLE_GET} (keyless, CORS open), rules at /api/rules, OpenAPI at /openapi.json, llms.txt, and the MCP tool japan_job_loss_check on free-agent-tools.vercel.app/mcp. Every response carries rulesAsOf, sources and a disclaimer.`,
  },
  {
    q: "日本で退職したら何日以内に何を届出しますか？",
    a: "就労系の在留資格では、所属機関を離れた日から14日以内に「所属機関に関する届出」が必要です（永住者は不要）。健康保険は任意継続なら資格喪失の翌日から20日以内、国保は市区町村でおおむね14日以内の届出が目安です。厚生年金を抜けて日本に残る場合は国民年金への切替も確認してください。雇用保険の基本手当はハローワークで離職票を持って手続きします。",
  },
  {
    q: "自己都合退職の給付制限は今も3か月ですか？",
    a: "2025年4月1日以降の離職では、自己都合の給付制限は原則1か月です（それ以前は原則3か月）。過去5年に自己都合での受給資格決定が複数ある場合などは3か月になることがあります。会社都合や特定理由に当たるかはハローワークが離職票の離職理由で判断します。",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <section className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Free · Japan · 退職 · ハローワーク · 所属機関届出</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Quit or lost your job in Japan?</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground sm:text-lg">
          Yes, this free checker maps the next steps. File the <strong>ISA organisation notice within 14 days</strong> on a work status, watch the <strong>~3-month inactivity</strong> review, take the <strong>離職票</strong> to Hello Work for 雇用保険, and switch <strong>health insurance / National Pension</strong> before the short windows close.
        </p>
        <p className="mt-3 text-sm text-muted">
          Examples:{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_SHARED)}>
            self-quit, 18 insured months
          </a>
          {" · "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_COMPANY)}>
            company layoff
          </a>
          {" · "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_FUTURE)}>
            job ending in December
          </a>
        </p>
      </section>

      <section className="mt-10">
        <Calculator />
      </section>

      <FaqSection items={faq} />

      <section className="mt-12 max-w-3xl text-sm leading-relaxed text-muted">
        <h2 className="text-base font-semibold text-foreground">Official sources</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          {SOURCES.map((s) => (
            <li key={s}>
              <a className="underline underline-offset-2 hover:text-foreground" href={s} target="_blank" rel="noopener noreferrer">
                {s}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs">
          Agent docs:{" "}
          <a className="underline" href="/llms.txt">
            llms.txt
          </a>
          {" · "}
          <a className="underline" href="/openapi.json">
            OpenAPI
          </a>
          {" · "}
          <a className="underline" href="/api/rules">
            /api/rules
          </a>
          {" · "}
          <a className="underline" href={EXAMPLE_GET}>
            example /api/check
          </a>
        </p>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd) }} />
    </div>
  );
}
