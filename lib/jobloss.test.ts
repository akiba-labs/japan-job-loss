import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RESTRICTION_CHANGE_DATE, RuleInputError, addDays, checkJobLoss } from "./jobloss";

describe("checkJobLoss", () => {
  it("requires jobEndDate", () => {
    assert.throws(() => checkJobLoss({ jobEndDate: "" }), RuleInputError);
    assert.throws(() => checkJobLoss({ jobEndDate: "31-10-2026" }), RuleInputError);
  });

  it("self-quit work status: 14-day ISA notice + 1-month restriction after 2025-04-01", () => {
    const r = checkJobLoss({
      jobEndDate: "2026-10-31",
      status: "work",
      reason: "self",
      insuredMonths: 18,
      lookingForWork: true,
      today: "2026-11-07",
    });
    assert.equal(r.immigration.notificationNeeded, true);
    assert.equal(r.immigration.notifyBy, "2026-11-14");
    assert.equal(r.unemployment.likelyEligible, true);
    assert.equal(r.unemployment.waitingDays, 7);
    assert.equal(r.unemployment.restrictionMonths, 1);
    assert.ok(r.unemployment.earliestBenefitDay);
    assert.equal(r.health.chooseBy, "2026-11-20");
    assert.equal(r.pension.switchNeeded, true);
    assert.equal(r.verdict, "act_now");
    assert.ok(r.deadlines.some((d) => d.ja.includes("所属機関")));
    assert.ok(r.disclaimer.includes("Educational"));
    assert.equal(r.rulesAsOf, "2026-11-07");
  });

  it("company layoff with enough months: no restriction", () => {
    const r = checkJobLoss({
      jobEndDate: "2026-10-15",
      status: "work",
      reason: "company",
      insuredMonths: 8,
      today: "2026-11-07",
    });
    assert.equal(r.unemployment.likelyEligible, true);
    assert.equal(r.unemployment.restrictionMonths, 0);
  });

  it("self-quit before restriction change used 3 months", () => {
    const r = checkJobLoss({
      jobEndDate: "2025-03-31",
      status: "work",
      reason: "self",
      insuredMonths: 20,
      today: "2025-04-10",
    });
    assert.equal(r.jobEndDate < RESTRICTION_CHANGE_DATE, true);
    assert.equal(r.unemployment.restrictionMonths, 3);
  });

  it("PR: no ISA organisation notice", () => {
    const r = checkJobLoss({ jobEndDate: "2026-10-31", status: "pr_spr", reason: "self", insuredMonths: 20, today: "2026-11-07" });
    assert.equal(r.immigration.notificationNeeded, false);
    assert.equal(r.immigration.notifyBy, null);
  });

  it("student: limited path", () => {
    const r = checkJobLoss({ jobEndDate: "2026-10-31", status: "student", reason: "self", today: "2026-11-07" });
    assert.equal(r.unemployment.likelyEligible, false);
    assert.equal(r.verdict, "limited");
  });

  it("future job end → plan_ahead when not urgent", () => {
    const r = checkJobLoss({
      jobEndDate: "2027-03-31",
      status: "work",
      reason: "self",
      insuredMonths: 24,
      today: "2026-11-07",
    });
    assert.equal(r.verdict, "plan_ahead");
    assert.ok(r.warnings.some((w) => w.includes("future")));
  });

  it("new job clears three-month risk and pension switch", () => {
    const r = checkJobLoss({
      jobEndDate: "2026-10-31",
      status: "work",
      reason: "self",
      hasNewJob: true,
      newJobStartDate: "2026-11-01",
      today: "2026-11-07",
    });
    assert.equal(r.immigration.threeMonthRisk, false);
    assert.equal(r.pension.switchNeeded, false);
    assert.equal(r.unemployment.likelyEligible, false);
  });

  it("late ISA window warns", () => {
    const r = checkJobLoss({
      jobEndDate: "2026-10-01",
      status: "work",
      reason: "company",
      insuredMonths: 10,
      today: "2026-11-07",
    });
    assert.ok(r.warnings.some((w) => w.includes("14-day")));
    assert.equal(r.immigration.notifyBy, "2026-10-15");
    assert.equal(r.immigration.notifyBy && r.immigration.notifyBy < "2026-11-07", true);
  });

  it("addDays helpers", () => {
    assert.equal(addDays("2026-10-31", 14), "2026-11-14");
    assert.equal(addDays("2026-02-20", 10), "2026-03-02");
  });

  it("rejects bad new job date", () => {
    assert.throws(
      () => checkJobLoss({ jobEndDate: "2026-10-31", newJobStartDate: "2026-10-01", today: "2026-11-07" }),
      RuleInputError,
    );
  });

  it("under-insured self-quit → not eligible", () => {
    const r = checkJobLoss({
      jobEndDate: "2026-10-31",
      status: "work",
      reason: "self",
      insuredMonths: 4,
      today: "2026-11-07",
    });
    assert.equal(r.unemployment.likelyEligible, false);
  });
});
