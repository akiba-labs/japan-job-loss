export const SITE_NAME = "Japan Job Loss Check";

export const SITE_TAGLINE =
  "Quit or lost your job in Japan? See the ISA 14-day organisation notice, the ~3-month inactivity risk, Hello Work / 雇用保険 eligibility and waiting rules (including the Apr 2025 self-quit change), health-insurance choices (任意継続 vs 国保), the National Pension switch, and which documents to collect.";

export const DISCLAIMER_SHORT =
  "Educational checklist, not immigration, labour or benefits advice; not affiliated with ISA, MHLW, Hello Work, the Japan Pension Service, 協会けんぽ or any city office. They decide; confirm before you act.";

export const HONESTY =
  "Rules as of 2026-11-07 from ISA 所属機関届出 pages, MHLW / Hello Work employment-insurance Q&A (including the April 2025 給付制限 change), 協会けんぽ 任意継続 guidance and the usual 14-day city / pension windows. It gives dates and next steps from what you enter, not yen amounts, and does not decide how Hello Work or ISA will classify your case.";

export const SIBLING_TOOLS = [
  { href: "https://japan-visa-renewal.vercel.app", label: "Japan Visa Renewal Window Check" },
  { href: "https://japan-jlpt-check.vercel.app", label: "Japan JLPT Level Check" },
  { href: "https://japan-medical-cost-cap.vercel.app", label: "Japan High-Cost Medical Expense Check" },
  { href: "https://japan-lost-item.vercel.app", label: "Japan Lost Item Check" },
  { href: "https://japan-leaving-tax.vercel.app", label: "Japan Leaving Tax Check" },
  { href: "https://japan-disaster-prep.vercel.app", label: "Japan Disaster Prep Check" },
  { href: "https://japan-parttime-check.vercel.app", label: "Japan Part-time Work Check" },
  { href: "https://japan-reentry-check.vercel.app", label: "Japan Re-entry Deadline Check" },
  { href: "https://japan-visa-fee.vercel.app", label: "Japan Visa Fee Calculator" },
  { href: "https://japan-pr-check.vercel.app", label: "Japan PR Guideline Check" },
  { href: "https://japan-hsp-points.vercel.app", label: "Japan HSP Points Calculator" },
  { href: "https://japan-mynumber-card-check.vercel.app", label: "Japan My Number Card Check" },
  { href: "https://japan-pet-quarantine.vercel.app", label: "Japan Pet Quarantine Check" },
  { href: "https://japan-overseas-dependents.vercel.app", label: "Japan Overseas Dependents Check" },
  { href: "https://japan-driving-check.vercel.app", label: "Japan Driving Check" },
  { href: "https://japan-tb-screening.vercel.app", label: "Japan TB Screening Check" },
  { href: "https://japan-customs-allowance.vercel.app", label: "Japan Customs Allowance" },
  { href: "https://japan-luggage.vercel.app", label: "Japan Luggage Check" },
  { href: "https://japan-tax-free-refund.vercel.app", label: "Japan Tax-Free Refund" },
  { href: "https://japan-intl-postage.vercel.app", label: "Japan Postage Calculator" },
  { href: "https://japan-alert-decoder.vercel.app", label: "Japan Alert Decoder" },
  { href: "https://japan-dual-pricing.vercel.app", label: "Japan Dual Pricing Check" },
  { href: "https://kyushu-travel-discount.vercel.app", label: "Kyushu Travel Discount" },
  { href: "https://house-rules-check.vercel.app", label: "House Rules Check" },
  { href: "https://japan-trip-brain.vercel.app", label: "Japan Trip Brain" },
  { href: "https://free-agent-tools.vercel.app", label: "Free Agent Tools MCP" },
] as const;

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "")}`;
  return "https://japan-job-loss.vercel.app";
}
