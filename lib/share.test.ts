import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EXAMPLE_COMPANY, EXAMPLE_SHARED, parseShared, resultPath, safeCheck, sharedQuery } from "./share";

describe("share", () => {
  it("round-trips example", () => {
    const q = sharedQuery(EXAMPLE_SHARED);
    const again = parseShared(new URLSearchParams(q));
    assert.deepEqual(again, EXAMPLE_SHARED);
    assert.ok(safeCheck(EXAMPLE_SHARED));
    assert.ok(resultPath(EXAMPLE_SHARED).startsWith("/r?"));
  });

  it("company example encodes reason", () => {
    assert.ok(sharedQuery(EXAMPLE_COMPANY).includes("r=company"));
  });
});
