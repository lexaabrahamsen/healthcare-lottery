import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS, parseState, serializeState } from "../web/src/lib/urlState.ts";

const allowed = { countries: ["DE", "UK", "CH", "CA", "NL"], scenarios: ["healthy", "baby", "serious"] };

describe("urlState", () => {
  it("returns the defaults for an empty query", () => {
    assert.deepEqual(parseState("", allowed), DEFAULTS);
  });

  it("round-trips any valid state", () => {
    const state = { income: 42_000, adults: 1 as const, children: 3, vs: "CH", scenario: "serious", view: "full" as const };
    assert.deepEqual(parseState(serializeState(state), allowed), state);
  });

  it("keeps the plain URL clean when everything is a default", () => {
    assert.equal(serializeState(DEFAULTS), "");
  });

  it("only writes what differs from the defaults", () => {
    assert.equal(serializeState({ ...DEFAULTS, income: 50_000 }), "?income=50000");
  });

  it("ignores malformed and out-of-range values, field by field", () => {
    const s = parseState("?income=-5&adults=3&kids=99&vs=US&s=nope&view=weird", allowed);
    assert.deepEqual(s, DEFAULTS);
    assert.equal(parseState("?income=abc&kids=1", allowed).income, DEFAULTS.income);
    assert.equal(parseState("?income=abc&kids=1", allowed).children, 1);
  });

  it("rejects decimals, exponents and absurd incomes", () => {
    assert.equal(parseState("?income=1e6", allowed).income, DEFAULTS.income);
    assert.equal(parseState("?income=1.5", allowed).income, DEFAULTS.income);
    assert.equal(parseState("?income=99999999999", allowed).income, DEFAULTS.income);
  });

  it("does not let the US be the comparison country", () => {
    assert.equal(parseState("?vs=US", allowed).vs, DEFAULTS.vs);
  });
});
