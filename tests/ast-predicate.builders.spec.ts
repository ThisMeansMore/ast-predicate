import { describe, expect, it } from "vitest";

import {
  createAstPredicateDatabase,
  createAstPredicateExpressionBuilder,
  createAstPredicateTableBuilder,
  createAstPredicateWhere,
  resolveAstPredicateInput,
  type AstPredicateColumnRef,
} from "../src/index.js";

type ArticleTable = {
  id: string;
  workspaceId: string;
  categoryId: string;
  slug: string;
  title: string;
  description: string | null;
  deletedAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  status: string;
};

type PredicateTestDatabase = {
  "schema.Articles": ArticleTable;
};

type PriceVersionTable = {
  code: string;
  PricingPlanCode: string;
  ComponentCode: string | null;
  validFrom: Date;
};

type BillingTable = {
  code: string;
  type: string;
  documentNumber: string;
  deletedAt: Date | null;
  createdAt: Date;
};

describe("ast predicate builders", () => {
  describe("expression builder", () => {
    it("builds table-scoped binary expressions", () => {
      type TestArticleTable = {
        id: string;
        status: string;
        deletedAt: Date | null;
      };

      const eb =
        createAstPredicateExpressionBuilder<
          AstPredicateColumnRef<TestArticleTable>
        >();

      expect(eb("status", "=", "PUBLISHED")).toEqual({
        type: "binary",
        left: {
          type: "ref",
          ref: "status",
        },
        op: "=",
        right: {
          type: "value",
          value: "PUBLISHED",
        },
      });
    });

    it("builds array expressions", () => {
      type TestArticleTable = {
        status: string;
      };

      const eb =
        createAstPredicateExpressionBuilder<
          AstPredicateColumnRef<TestArticleTable>
        >();

      expect(eb("status", "in", ["PUBLISHED", "DRAFT"])).toEqual({
        type: "binary",
        left: {
          type: "ref",
          ref: "status",
        },
        op: "in",
        right: {
          type: "value",
          value: ["PUBLISHED", "DRAFT"],
        },
      });
    });

    it("builds null expressions", () => {
      type TestArticleTable = {
        deletedAt: Date | null;
      };

      const eb =
        createAstPredicateExpressionBuilder<
          AstPredicateColumnRef<TestArticleTable>
        >();

      expect(eb("deletedAt", "is", null)).toEqual({
        type: "binary",
        left: {
          type: "ref",
          ref: "deletedAt",
        },
        op: "is",
        right: {
          type: "value",
          value: null,
        },
      });
    });

    it("builds logical expressions", () => {
      type TestArticleTable = {
        status: string;
        deletedAt: Date | null;
        publishedAt: Date | null;
      };

      const eb =
        createAstPredicateExpressionBuilder<
          AstPredicateColumnRef<TestArticleTable>
        >();

      expect(
        eb.and([
          eb("status", "=", "PUBLISHED"),
          eb.or([
            eb("deletedAt", "is", null),
            eb("publishedAt", "is not", null),
          ]),
        ]),
      ).toEqual({
        type: "logical",
        op: "and",
        nodes: [
          {
            type: "binary",
            left: {
              type: "ref",
              ref: "status",
            },
            op: "=",
            right: {
              type: "value",
              value: "PUBLISHED",
            },
          },
          {
            type: "logical",
            op: "or",
            nodes: [
              {
                type: "binary",
                left: {
                  type: "ref",
                  ref: "deletedAt",
                },
                op: "is",
                right: {
                  type: "value",
                  value: null,
                },
              },
              {
                type: "binary",
                left: {
                  type: "ref",
                  ref: "publishedAt",
                },
                op: "is not",
                right: {
                  type: "value",
                  value: null,
                },
              },
            ],
          },
        ],
      });
    });
  });

  describe("where builder", () => {
    it("builds callback expressions", () => {
      type TestArticleTable = {
        status: string;
        deletedAt: Date | null;
      };

      expect(
        createAstPredicateWhere<TestArticleTable>(({ eb, and }) =>
          and([eb("deletedAt", "is", null), eb("status", "=", "PUBLISHED")]),
        ),
      ).toEqual({
        type: "logical",
        op: "and",
        nodes: [
          {
            type: "binary",
            left: {
              type: "ref",
              ref: "deletedAt",
            },
            op: "is",
            right: {
              type: "value",
              value: null,
            },
          },
          {
            type: "binary",
            left: {
              type: "ref",
              ref: "status",
            },
            op: "=",
            right: {
              type: "value",
              value: "PUBLISHED",
            },
          },
        ],
      });
    });
  });

  describe("database builder", () => {
    it("builds database-scoped ref-to-ref expressions", () => {
      type DB = {
        Article: {
          categoryId: string;
          workspaceId: string;
        };
        Category: {
          id: string;
          workspaceId: string;
        };
      };

      const db = createAstPredicateDatabase<DB>();

      expect(
        db.where(({ eb, and, ref }) =>
          and([
            eb("Article.categoryId", "=", ref("Category.id")),
            eb("Article.workspaceId", "=", ref("Category.workspaceId")),
          ]),
        ),
      ).toEqual({
        type: "logical",
        op: "and",
        nodes: [
          {
            type: "binary",
            left: {
              type: "ref",
              ref: "Article.categoryId",
            },
            op: "=",
            right: {
              type: "ref",
              ref: "Category.id",
            },
          },
          {
            type: "binary",
            left: {
              type: "ref",
              ref: "Article.workspaceId",
            },
            op: "=",
            right: {
              type: "ref",
              ref: "Category.workspaceId",
            },
          },
        ],
      });
    });

    it("builds database-scoped alias refs", () => {
      type DB = {
        Article: {
          categoryId: string;
          workspaceId: string;
        };
        Category: {
          id: string;
          workspaceId: string;
        };
      };

      const db = createAstPredicateDatabase<
        DB,
        {
          a: "Article";
          c: "Category";
        }
      >();

      expect(
        db.where(({ eb, and, ref }) =>
          and([
            eb("a.categoryId", "=", ref("c.id")),
            eb("a.workspaceId", "=", ref("c.workspaceId")),
          ]),
        ),
      ).toEqual({
        type: "logical",
        op: "and",
        nodes: [
          {
            type: "binary",
            left: {
              type: "ref",
              ref: "a.categoryId",
            },
            op: "=",
            right: {
              type: "ref",
              ref: "c.id",
            },
          },
          {
            type: "binary",
            left: {
              type: "ref",
              ref: "a.workspaceId",
            },
            op: "=",
            right: {
              type: "ref",
              ref: "c.workspaceId",
            },
          },
        ],
      });
    });
  });

  describe("table builder", () => {
    describe("uniqueIndexes", () => {
      it("builds table-scoped unique indexes from an object", () => {
        const predicateDb = createAstPredicateDatabase<PredicateTestDatabase>();
        const articleTable = predicateDb.table("schema.Articles");

        const articleUniqueIndexes = articleTable.uniqueIndexes({
          pkey: {
            columns: ["id"],
          },
          slug_unique: {
            columns: ["workspaceId", "categoryId", "slug"],
            where: articleTable.where(({ eb }) => eb("deletedAt", "is", null)),
          },
          nullable_description_unique: {
            columns: ["workspaceId", "categoryId", "description"],
          },
          published_slug_unique: {
            columns: ["workspaceId", "categoryId", "slug"],
            where: articleTable.where(({ eb, and, or }) =>
              and([
                eb("deletedAt", "is", null),
                or([
                  eb("publishedAt", "is not", null),
                  eb("status", "=", "PUBLISHED"),
                ]),
              ]),
            ),
          },
          category_ref_unique: {
            columns: ["workspaceId", "categoryId", "slug"],
            where: articleTable.where(({ eb, ref }) =>
              eb("categoryId", "=", ref("id")),
            ),
          },
        });

        expect(articleUniqueIndexes.pkey.columns).toEqual(["id"]);

        expect(articleUniqueIndexes.slug_unique.columns).toEqual([
          "workspaceId",
          "categoryId",
          "slug",
        ]);

        expect(
          articleUniqueIndexes.nullable_description_unique.columns,
        ).toEqual(["workspaceId", "categoryId", "description"]);

        expect(articleUniqueIndexes.published_slug_unique.columns).toEqual([
          "workspaceId",
          "categoryId",
          "slug",
        ]);

        expect(articleUniqueIndexes.category_ref_unique.columns).toEqual([
          "workspaceId",
          "categoryId",
          "slug",
        ]);
      });

      it("builds table-scoped unique indexes from a callback", () => {
        const uniqueIndexes =
          createAstPredicateTableBuilder<PriceVersionTable>().uniqueIndexes(
            ({ eb }) => ({
              pkey: {
                columns: ["code"],
              },
              with_ComponentCode: {
                columns: ["PricingPlanCode", "ComponentCode", "validFrom"],
                where: eb("ComponentCode", "is not", null),
              },
              without_ComponentCode: {
                columns: ["PricingPlanCode", "validFrom"],
                where: eb("ComponentCode", "is", null),
              },
            }),
          );

        expect(uniqueIndexes.with_ComponentCode.where).toEqual({
          type: "binary",
          left: {
            type: "ref",
            ref: "ComponentCode",
          },
          op: "is not",
          right: {
            type: "value",
            value: null,
          },
        });

        expect(uniqueIndexes.without_ComponentCode.where).toEqual({
          type: "binary",
          left: {
            type: "ref",
            ref: "ComponentCode",
          },
          op: "is",
          right: {
            type: "value",
            value: null,
          },
        });
      });

      it("requires pkey as default unique index name", () => {
        createAstPredicateTableBuilder<PriceVersionTable>().uniqueIndexes({
          pkey: {
            columns: ["code"],
          },
        });

        createAstPredicateTableBuilder<PriceVersionTable>().uniqueIndexes(
          // @ts-expect-error - configured default unique index "pkey" is required
          {
            with_ComponentCode: {
              columns: ["PricingPlanCode", "ComponentCode", "validFrom"],
            },
          },
        );
      });

      it("requires configured custom default unique index name", () => {
        createAstPredicateTableBuilder<
          PriceVersionTable,
          "price_version_pkey"
        >().uniqueIndexes({
          price_version_pkey: {
            columns: ["code"],
          },
        });

        createAstPredicateTableBuilder<
          PriceVersionTable,
          "price_version_pkey"
        >().uniqueIndexes(
          // @ts-expect-error - configured default unique index "price_version_pkey" is required
          {
            pkey: {
              columns: ["code"],
            },
          },
        );
      });

      it("allows omitting default unique index name when disabled with never", () => {
        type SimpleArticleTable = {
          id: string;
          workspaceId: string;
          slug: string;
          deletedAt: Date | null;
        };

        const articleUniqueIndexes = createAstPredicateTableBuilder<
          SimpleArticleTable,
          never
        >().uniqueIndexes({
          active_slug_unique: {
            columns: ["workspaceId", "slug"],
          },
        });

        expect(articleUniqueIndexes.active_slug_unique.columns).toEqual([
          "workspaceId",
          "slug",
        ]);
      });

      it("keeps unique index columns narrow while predicate can use any table column", () => {
        type DB = {
          Billing: BillingTable;
        };

        const db = createAstPredicateDatabase<DB>();
        const billing = db.table("Billing");

        const uniqueIndexes = billing.uniqueIndexes({
          pkey: {
            columns: ["code"],
          },
          type_and_number: {
            columns: ["type", "documentNumber"],
            where: billing.where(({ eb }) => eb("deletedAt", "is not", null)),
          },
        });

        expect(uniqueIndexes.pkey.columns).toEqual(["code"]);

        expect(uniqueIndexes.type_and_number.columns).toEqual([
          "type",
          "documentNumber",
        ]);

        expect(
          resolveAstPredicateInput(
            uniqueIndexes.type_and_number.where,
            billing.expressionBuilder(),
          ),
        ).toEqual({
          type: "binary",
          left: {
            type: "ref",
            ref: "deletedAt",
          },
          op: "is not",
          right: {
            type: "value",
            value: null,
          },
        });

        type PKeyColumn = (typeof uniqueIndexes.pkey.columns)[number];

        const pkeyColumn: PKeyColumn = "code";
        expect(pkeyColumn).toBe("code");

        // @ts-expect-error - pkey columns must stay narrowed to "code"
        const invalidPKeyColumn: PKeyColumn = "deletedAt";
        expect(invalidPKeyColumn).toBe("deletedAt");
      });

      it("keeps unique index predicate callback typed for mapped database tables", () => {
        type Generated<T> = T & { readonly __generated?: unique symbol };

        type RawDatabase = {
          Billing: {
            code: Generated<string>;
            type: string;
            documentNumber: string;
            deletedAt: Date | null;
          };
        };

        type RawDatabaseTableName = Extract<keyof RawDatabase, string>;

        type RowOfTable<TTable extends RawDatabaseTableName> = {
          [TColumn in keyof RawDatabase[TTable]]: RawDatabase[TTable][TColumn] extends Generated<
            infer TValue
          >
            ? TValue
            : RawDatabase[TTable][TColumn];
        };

        type PredicateDatabase = {
          [TTable in RawDatabaseTableName]: RowOfTable<TTable>;
        };

        const db = createAstPredicateDatabase<PredicateDatabase>();
        const billing = db.table("Billing");

        const uniqueIndexes = billing.uniqueIndexes({
          pkey: {
            columns: ["code"],
          },
          type_and_number: {
            columns: ["type", "documentNumber"],
            where: billing.where(({ eb }) => eb("deletedAt", "is not", null)),
          },
        });

        expect(
          resolveAstPredicateInput(
            uniqueIndexes.type_and_number.where,
            billing.expressionBuilder(),
          ),
        ).toEqual({
          type: "binary",
          left: {
            type: "ref",
            ref: "deletedAt",
          },
          op: "is not",
          right: {
            type: "value",
            value: null,
          },
        });
      });
    });
  });

  describe("resolveAstPredicateInput", () => {
    it("resolves predicate callback input", () => {
      type TestArticleTable = {
        deletedAt: Date | null;
      };

      const eb =
        createAstPredicateExpressionBuilder<
          AstPredicateColumnRef<TestArticleTable>
        >();

      expect(
        resolveAstPredicateInput(({ eb }) => eb("deletedAt", "is", null), eb),
      ).toEqual({
        type: "binary",
        left: {
          type: "ref",
          ref: "deletedAt",
        },
        op: "is",
        right: {
          type: "value",
          value: null,
        },
      });
    });

    it("resolves table-scoped unique index predicates", () => {
      const predicateDb = createAstPredicateDatabase<PredicateTestDatabase>();
      const articleTable = predicateDb.table("schema.Articles");

      const articleUniqueIndexes = articleTable.uniqueIndexes({
        pkey: {
          columns: ["id"],
        },
        published_slug_unique: {
          columns: ["workspaceId", "categoryId", "slug"],
          where: articleTable.where(({ eb, and, or }) =>
            and([
              eb("deletedAt", "is", null),
              or([
                eb("publishedAt", "is not", null),
                eb("status", "=", "PUBLISHED"),
              ]),
            ]),
          ),
        },
        category_ref_unique: {
          columns: ["workspaceId", "categoryId", "slug"],
          where: articleTable.where(({ eb, ref }) =>
            eb("categoryId", "=", ref("id")),
          ),
        },
      });

      const eb = articleTable.expressionBuilder();

      expect(
        resolveAstPredicateInput(
          articleUniqueIndexes.published_slug_unique.where,
          eb,
        ),
      ).toEqual({
        type: "logical",
        op: "and",
        nodes: [
          {
            type: "binary",
            left: {
              type: "ref",
              ref: "deletedAt",
            },
            op: "is",
            right: {
              type: "value",
              value: null,
            },
          },
          {
            type: "logical",
            op: "or",
            nodes: [
              {
                type: "binary",
                left: {
                  type: "ref",
                  ref: "publishedAt",
                },
                op: "is not",
                right: {
                  type: "value",
                  value: null,
                },
              },
              {
                type: "binary",
                left: {
                  type: "ref",
                  ref: "status",
                },
                op: "=",
                right: {
                  type: "value",
                  value: "PUBLISHED",
                },
              },
            ],
          },
        ],
      });

      expect(
        resolveAstPredicateInput(
          articleUniqueIndexes.category_ref_unique.where,
          eb,
        ),
      ).toEqual({
        type: "binary",
        left: {
          type: "ref",
          ref: "categoryId",
        },
        op: "=",
        right: {
          type: "ref",
          ref: "id",
        },
      });
    });
  });
});
