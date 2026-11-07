import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { InputError } from "./agent-api";
import { EXAMPLE_GET, computeCheck } from "./api";

describe("computeCheck", () => {
  it("example get works", () => {
    const q = Object.fromEntries(new URL(`https://x.example${EXAMPLE_GET}`).searchParams);
    const r = computeCheck(q);
    assert.equal(r.jobEndDate, "2026-10-31");
    assert.equal(r.immigration.notifyBy, "2026-11-14");
    assert.ok(r.sources.length >= 5);
  });

  it("accepts JA aliases", () => {
    const r = computeCheck({ jobEndDate: "2026-10-31", status: "技人国", reason: "会社都合", insuredMonths: 9, today: "2026-11-07" });
    assert.equal(r.status, "work");
    assert.equal(r.reason, "company");
    assert.equal(r.unemployment.restrictionMonths, 0);
  });

  it("missing date → InputError", () => {
    assert.throws(() => computeCheck({}), InputError);
  });

  it("bad status → InputError", () => {
    assert.throws(() => computeCheck({ jobEndDate: "2026-10-31", status: "tourist" }), InputError);
  });
});
