# Changelog

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
