# Changelog

## 0.2.1

Changed:

- Documented model-bound `AstPredicate<TModel>()` usage.
- Documented destructuring of model-bound builders.
- Documented `ast-predicate/test-utils`.
- Added JSDoc to the exported `AstPredicate` entry point.

## 0.2.0

Added:

- Added `ast-predicate/test-utils` subpath.
- Added framework-light compiled SQL assertion helpers via `createCompiledSqlExpect(expect)`.

## 0.1.1

Changed:

- Published package as dual ESM/CommonJS output.
- Added CommonJS `require` export for Jest/CommonJS consumers.

## 0.1.0

Initial public package structure.

Added:

- Predicate AST node types.
- Logical builders: `and`, `or`.
- Comparison builders: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `inArray`, `notInArray`, `isNull`, `isNotNull`.
- Runtime guards for predicate nodes and values.
- Runtime assertions for valid predicate nodes and allowed columns.
- Utilities for mapping and collecting predicate columns.
