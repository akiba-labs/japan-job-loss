import { preflight, staticJson } from "@/lib/agent-api";
import { PUBLIC_URL } from "@/lib/api";
import { DISCLAIMER, RULES, RULES_AS_OF, SOURCES } from "@/lib/jobloss";

export function GET() {
  return staticJson({
    ...RULES,
    rulesAsOf: RULES_AS_OF,
    sources: SOURCES,
    disclaimer: DISCLAIMER,
    docs: `${PUBLIC_URL}/openapi.json`,
    checker: `${PUBLIC_URL}/api/check`,
  });
}
export const OPTIONS = preflight;
