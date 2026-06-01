# ast-predicate

Framework-agnostic TypeScript predicate AST utilities for building, validating, and adapting typed predicate expressions.

`ast-predicate` has the ambition to be a companion to tools like Kysely: not a replacement, but a small utility layer for custom implementation details that are often too application-specific for general-purpose query builders, while still making those details easier to model, reuse, and adapt.

`ast-predicate` provides a small predicate AST and typed builders. It does not execute queries and does not depend on a database driver, ORM, query builder, or runtime framework.

## Why ast-predicate exists

`ast-predicate` is useful when predicate logic should live outside a specific ORM, query builder, or SQL implementation.

Many mature backend codebases contain filtering rules in several forms at once: Sequelize scopes, Prisma filters, Kysely expressions, raw SQL fragments, service configuration, and test helpers. That makes gradual refactoring harder, because the rules are coupled to the tool that currently executes them.

With `ast-predicate`, a service can define filters or metadata once using a framework-agnostic AST. Adapters can then translate the same predicate into Sequelize, Kysely, raw SQL, validation logic, or tests.

This makes the package useful as a small binding layer during incremental migration or mixed-stack development. It does not replace an ORM or query builder; it only describes predicate logic in a neutral format that surrounding code can adapt to its own execution layer.

The builder syntax is intentionally SQL/Kysely-like. The goal is to keep the developer experience familiar, reduce the pain of switching between related tools, and make adoption easier in codebases where people already work with query builders, ORMs, and SQL-oriented patterns.

## Installation

```bash
npm install ast-predicate
```

## Core idea

Predicates are represented as plain TypeScript objects.

```ts
import { createAstPredicateExpressionBuilder } from 'ast-predicate';

type ArticleTable = {
    id: string;
    status: string;
    deletedAt: Date | null;
};

const eb = createAstPredicateExpressionBuilder<keyof ArticleTable & string>();

const predicate = eb.and([
    eb('deletedAt', 'is', null),
    eb('status', '=', 'PUBLISHED'),
]);
```

The generated AST is plain data.

```ts
{
    type: 'logical',
    op: 'and',
    nodes: [
        {
            type: 'binary',
            left: {
                type: 'ref',
                ref: 'deletedAt',
            },
            op: 'is',
            right: {
                type: 'value',
                value: null,
            },
        },
        {
            type: 'binary',
            left: {
                type: 'ref',
                ref: 'status',
            },
            op: '=',
            right: {
                type: 'value',
                value: 'PUBLISHED',
            },
        },
    ],
}
```

The AST is JSON-compatible except when predicate values contain values such as `Date`.

## Expression builder

The expression builder is a callable object. The call signature creates binary predicate nodes.

```ts
const predicate = eb('status', '=', 'PUBLISHED');
```

It also exposes helpers for references, literal values, and logical nodes.

```ts
const predicate = eb.and([
    eb('deletedAt', 'is', null),
    eb.or([
        eb('publishedAt', 'is not', null),
        eb('status', '=', 'PUBLISHED'),
    ]),
    eb.not(eb('status', '=', 'ARCHIVED')),
]);
```

Supported binary operators are SQL/Kysely-like.

```ts
'=' | '!=' | '<>' | '>' | '>=' | '<' | '<=' |
'in' | 'not in' | 'is' | 'is not' | 'like' | 'not like'
```

## Table-scoped builders

For table-local predicates, use `createAstPredicateWhere` or the table builder from a database definition.

```ts
import { createAstPredicateWhere } from 'ast-predicate';

type ArticleTable = {
    id: string;
    workspaceId: string;
    categoryId: string;
    status: string;
    deletedAt: Date | null;
};

const predicate = createAstPredicateWhere<ArticleTable>(({ eb, and }) =>
    and([
        eb('deletedAt', 'is', null),
        eb('status', '=', 'PUBLISHED'),
    ]),
);
```

Invalid column names are rejected by TypeScript.

```ts
createAstPredicateWhere<ArticleTable>(({ eb }) =>
    eb('missingColumn', '=', 'value'),
);
// Type error
```

## Database-scoped builders

Use `createAstPredicateDatabase` when predicates need fully-qualified references across multiple tables.

```ts
import { createAstPredicateDatabase } from 'ast-predicate';

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

const predicate = db.where(({ eb, and, ref }) =>
    and([
        eb('Article.categoryId', '=', ref('Category.id')),
        eb('Article.workspaceId', '=', ref('Category.workspaceId')),
    ]),
);
```

Database references use this format:

```txt
TableName.columnName
```

## Database aliases

Aliases are type-only. They let you define shorter reference names while still validating table and column names.

```ts
const db = createAstPredicateDatabase<
    DB,
    {
        a: 'Article';
        c: 'Category';
    }
>();

const predicate = db.where(({ eb, and, ref }) =>
    and([
        eb('a.categoryId', '=', ref('c.id')),
        eb('a.workspaceId', '=', ref('c.workspaceId')),
    ]),
);
```

The generated AST keeps the alias strings as given.

```ts
{
    type: 'binary',
    left: {
        type: 'ref',
        ref: 'a.categoryId',
    },
    op: '=',
    right: {
        type: 'ref',
        ref: 'c.id',
    },
}
```

## Table metadata helpers

The database builder can create table-scoped metadata helpers. The first supported helper is `uniqueIndexes`.

Use the table builder to create both the unique-index metadata and any predicate used by that metadata.

```ts
import { createAstPredicateDatabase } from 'ast-predicate';

type PredicateTestDatabase = {
    'schema.Articles': {
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
};

const predicateDb = createAstPredicateDatabase<PredicateTestDatabase>();
const articles = predicateDb.table('schema.Articles');

const articleUniqueIndexes = articles.uniqueIndexes({
    pkey: {
        columns: ['id'],
    },
    slug_unique: {
        columns: ['workspaceId', 'categoryId', 'slug'],
        where: articles.where(({ eb }) =>
            eb('deletedAt', 'is', null),
        ),
    },
    nullable_description_unique: {
        columns: ['workspaceId', 'categoryId', 'description'],
    },
    published_slug_unique: {
        columns: ['workspaceId', 'categoryId', 'slug'],
        where: articles.where(({ eb, and, or }) =>
            and([
                eb('deletedAt', 'is', null),
                or([
                    eb('publishedAt', 'is not', null),
                    eb('status', '=', 'PUBLISHED'),
                ]),
            ]),
        ),
    },
    category_ref_unique: {
        columns: ['workspaceId', 'categoryId', 'slug'],
        where: articles.where(({ eb, ref }) =>
            eb('categoryId', '=', ref('id')),
        ),
    },
});
```

`uniqueIndexes()` preserves the metadata object as-is. Predicate values should be AST nodes created with the same table builder, usually through `table.where(...)`.

This keeps column lists narrow for unique-index filter typing, while predicates can still reference any column from the table.

The resulting metadata is useful as adapter input. For example, an adapter can read `columns` to build unique-index filters and use `predicate` as an already-built AST node.

## Namespace API

The package also exposes the same main entry points through the `AstPredicate` namespace.

```ts
import { AstPredicate } from 'ast-predicate';

const db = AstPredicate.database<PredicateTestDatabase>();
const eb = AstPredicate.expressionBuilder<'status' | 'deletedAt'>();
```

This style is useful when you prefer fewer named imports.

## Predicate input callbacks

Many APIs accept `AstPredicateInput<TRef>`. It can be either an already-built AST node or a callback that receives an expression context.

```ts
import {
    createAstPredicateExpressionBuilder,
    resolveAstPredicateInput,
} from 'ast-predicate';

const eb = createAstPredicateExpressionBuilder<'deletedAt'>();

const predicate = resolveAstPredicateInput(
    ({ eb }) => eb('deletedAt', 'is', null),
    eb,
);
```

The callback context contains:

```ts
eb
ref
val
and
or
not
```

For table metadata such as `uniqueIndexes()`, prefer resolving predicates before storing them in the metadata object:

```ts
const articles = predicateDb.table('schema.Articles');

const indexes = articles.uniqueIndexes({
    slug_unique: {
        columns: ['workspaceId', 'categoryId', 'slug'],
        where: articles.where(({ eb }) =>
            eb('deletedAt', 'is', null),
        ),
    },
});
```

This avoids relying on nested callback inference inside large metadata objects and keeps the metadata shape simple for adapters.

## AST node shape

The current AST uses binary, logical, and unary nodes.

```ts
type AstPredicateNode<TRef extends string = string> =
    | AstPredicateBinaryNode<TRef>
    | AstPredicateLogicalNode<TRef>
    | AstPredicateUnaryNode<TRef>;
```

Binary node:

```ts
type AstPredicateBinaryNode<TRef extends string = string> = {
    readonly type: 'binary';
    readonly left: AstPredicateRefOperand<TRef>;
    readonly op: AstPredicateBinaryOperator;
    readonly right: AstPredicateOperand<TRef>;
};
```

Logical node:

```ts
type AstPredicateLogicalNode<TRef extends string = string> = {
    readonly type: 'logical';
    readonly op: 'and' | 'or';
    readonly nodes: readonly AstPredicateNode<TRef>[];
};
```

Unary node:

```ts
type AstPredicateUnaryNode<TRef extends string = string> = {
    readonly type: 'unary';
    readonly op: 'not';
    readonly node: AstPredicateNode<TRef>;
};
```

Reference operand:

```ts
type AstPredicateRefOperand<TRef extends string = string> = {
    readonly type: 'ref';
    readonly ref: TRef;
};
```

Value operand:

```ts
type AstPredicateValueOperand = {
    readonly type: 'value';
    readonly value: AstPredicateValue;
};
```

## Validating unknown input

Use `assertAstPredicateNode` when accepting a predicate from an unknown source.

```ts
import { assertAstPredicateNode } from 'ast-predicate';

const input: unknown = JSON.parse(payload);

assertAstPredicateNode(input);

// input is now typed as AstPredicateNode
```

This only validates the AST structure. It does not decide whether a reference is safe for a specific adapter or database schema. Adapters should still validate or map references before converting predicates into executable queries.

## Test utilities

`ast-predicate` exposes optional SQL assertion helpers from a separate subpath.

```ts
import { createCompiledSqlExpect } from 'ast-predicate/test-utils';
```

These helpers are intended for tests around SQL-producing adapters or services. They are PostgreSQL-oriented and expect the test framework `expect` function to be passed in by the consumer.

See [test utilities documentation](./docs/test-utils.md) for examples.

## Current scope

The package currently contains:

- framework-agnostic predicate AST types
- typed expression builders
- table-scoped metadata helpers
- database-scoped reference helpers
- runtime AST assertions
- optional PostgreSQL-oriented test utilities

The package intentionally does not execute queries and does not provide database connectivity.

Adapters may be added later as separate packages or optional modules, for example:

```txt
ast-predicate-kysely
ast-predicate-sequelize
```

## License

MIT
