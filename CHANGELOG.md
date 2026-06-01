## v0.4.1 - 2026-06-01

unique-index property `predicate` changed to `where`

## v0.4.0 - 2026-06-01

### Changed

- Updated table metadata predicates to use explicit table-scoped AST nodes created with `table.where(...)`.
- Improved `uniqueIndexes()` typing so index column lists stay narrow while predicates can still reference any table column.
- Updated README and public JSDoc examples to document the safer `table.where(...)` metadata pattern.
- Added tests for mapped database table types and unique-index predicate typing.

# Changelog

## 0.3.0

Changed:

- Replaced the previous comparison-node AST with a Kysely-like binary expression AST.
- Replaced custom predicate builders such as `eq`, `isNull`, and `isNotNull` with `expressionBuilder`.
- Added single-table expression builders with column-name type safety.
- Added database-scoped expression builders with typed `Table.column` refs.
- Added optional type-only database aliases.
- Renamed column utilities to ref utilities: `mapRefs`, `collectRefs`, and `assertRefsAllowed`.

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

## 0.1.2

Added:

- Added model-bound predicate builders.

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
