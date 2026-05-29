import { describe, expect, it } from "vitest";

import {
  and,
  AstPredicate,
  eq,
  gt,
  inArray,
  isNotNull,
  isNull,
  notInArray,
  or,
} from "../src/index.js";

describe("ast predicate builders", () => {
  it("builds comparison nodes", () => {
    expect(eq("status", "ACTIVE")).toEqual({
      type: "comparison",
      column: "status",
      op: "eq",
      value: "ACTIVE",
    });

    expect(gt("createdAt", new Date("2026-01-01T00:00:00.000Z"))).toEqual({
      type: "comparison",
      column: "createdAt",
      op: "gt",
      value: new Date("2026-01-01T00:00:00.000Z"),
    });
  });

  it("builds array comparison nodes", () => {
    expect(inArray("status", ["ACTIVE", "INACTIVE"])).toEqual({
      type: "comparison",
      column: "status",
      op: "in",
      value: ["ACTIVE", "INACTIVE"],
    });

    expect(notInArray("status", ["DELETED"])).toEqual({
      type: "comparison",
      column: "status",
      op: "notIn",
      value: ["DELETED"],
    });
  });

  it("builds null comparison nodes without value", () => {
    expect(isNull("deletedAt")).toEqual({
      type: "comparison",
      column: "deletedAt",
      op: "isNull",
    });

    expect(isNotNull("publishedAt")).toEqual({
      type: "comparison",
      column: "publishedAt",
      op: "isNotNull",
    });
  });

  it("builds logical nodes", () => {
    expect(
      and(
        eq("status", "ACTIVE"),
        or(isNull("deletedAt"), isNotNull("publishedAt")),
      ),
    ).toEqual({
      type: "logical",
      op: "and",
      conditions: [
        {
          type: "comparison",
          column: "status",
          op: "eq",
          value: "ACTIVE",
        },
        {
          type: "logical",
          op: "or",
          conditions: [
            {
              type: "comparison",
              column: "deletedAt",
              op: "isNull",
            },
            {
              type: "comparison",
              column: "publishedAt",
              op: "isNotNull",
            },
          ],
        },
      ],
    });
  });
  it("creates model-bound builders", () => {
    type EditionTable = {
      code: string;
      TenantCode: string;
      ProductCode: string;
      deletedAt: Date;
    };

    const { and, isNull, eq } = AstPredicate<EditionTable>();

    expect(and(isNull("deletedAt"), eq("ProductCode", "product-1"))).toEqual({
      type: "logical",
      op: "and",
      conditions: [
        {
          type: "comparison",
          column: "deletedAt",
          op: "isNull",
        },
        {
          type: "comparison",
          column: "ProductCode",
          op: "eq",
          value: "product-1",
        },
      ],
    });

    // @ts-expect-error column does not exist on EditionTable
    AstPredicate<EditionTable>().isNull("not-exists");
  });
});
