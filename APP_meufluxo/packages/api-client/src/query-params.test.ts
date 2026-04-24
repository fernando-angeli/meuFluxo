import { describe, expect, it } from "vitest";

import { applyQueryRecord } from "./query-params";

describe("applyQueryRecord", () => {
  it("appends repeated keys for array values", () => {
    const url = new URL("https://api.example/planned");
    applyQueryRecord(url, {
      page: 0,
      categoryIds: [1, 2, 3],
    });
    expect(url.searchParams.getAll("categoryIds")).toEqual(["1", "2", "3"]);
    expect(url.searchParams.get("page")).toBe("0");
  });

  it("skips null, undefined, and empty array entries", () => {
    const url = new URL("https://api.example/x");
    applyQueryRecord(url, {
      a: null,
      b: undefined,
      c: [],
      d: "ok",
    });
    expect([...url.searchParams.keys()].sort()).toEqual(["d"]);
  });
});
