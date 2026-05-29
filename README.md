# ast-predicate

Framework-agnostic TypeScript predicate AST utilities for building, validating, and transforming filter expressions.

The package provides a small typed AST for predicate/filter expressions. It does not depend on a database, ORM, query builder, or runtime framework.

## Installation

```bash
npm install ast-predicate
```

## Basic usage

```ts
import { AstPredicate } from 'ast-predicate';

const predicate = AstPredicate.and(
    AstPredicate.eq('status', 'ACTIVE'),
    AstPredicate.isNull('deletedAt'),
);
```

The generated AST is plain JSON-compatible data, except when using `Date` values.

```ts
const predicate = {
    type: 'logical',
    op: 'and',
    conditions: [
        {
            type: 'comparison',
            column: 'status',
            op: 'eq',
            value: 'ACTIVE',
        },
        {
            type: 'comparison',
            column: 'deletedAt',
            op: 'isNull',
        },
    ],
};
```

## Direct imports

```ts
import { and, eq, isNull } from 'ast-predicate';

const predicate = and(
    eq('status', 'ACTIVE'),
    isNull('deletedAt'),
);
```

## Typed columns

```ts
import { AstPredicate } from 'ast-predicate';

type ProductColumn = 'code' | 'name' | 'status' | 'deletedAt';

const predicate = AstPredicate.and<ProductColumn>(
    AstPredicate.eq('status', 'ACTIVE'),
    AstPredicate.isNull('deletedAt'),
);
```

## Validate unknown input

```ts
import { assertAstPredicateNode } from 'ast-predicate';

const input: unknown = JSON.parse(payload);

assertAstPredicateNode(input);

// input is now typed as AstPredicateNode
```

## Restrict allowed columns

```ts
import { AstPredicate, assertAstPredicateColumnsAllowed } from 'ast-predicate';

const predicate = AstPredicate.eq('status', 'ACTIVE');

assertAstPredicateColumnsAllowed(predicate, ['status', 'deletedAt']);
```

This is useful before converting user-provided filters into SQL, ORM conditions, or another query format.

## Transform columns

```ts
import { AstPredicate } from 'ast-predicate';

const predicate = AstPredicate.and(
    AstPredicate.eq('status', 'ACTIVE'),
    AstPredicate.isNull('deletedAt'),
);

const mapped = AstPredicate.mapColumns(
    predicate,
    (column) => `product.${column}`,
);
```

## Collect columns

```ts
import { AstPredicate } from 'ast-predicate';

const predicate = AstPredicate.and(
    AstPredicate.eq('status', 'ACTIVE'),
    AstPredicate.isNull('deletedAt'),
);

const columns = AstPredicate.collectColumns(predicate);
// ['status', 'deletedAt']
```

## Current scope

This package currently contains only the framework-agnostic core.

Adapters may be added later as separate packages or optional modules, for example:

```txt
ast-predicate-kysely
ast-predicate-sequelize
```

## License

MIT
