import type {
  AstPredicateColumnRef,
  AstPredicateDatabase,
  AstPredicateDatabaseAliasMap,
  AstPredicateDatabaseAnyRef,
  AstPredicateExpressionBuilder,
  AstPredicateExpressionContext,
  AstPredicateExpressionFactory,
  AstPredicateExpressionRight,
  AstPredicateInput,
  AstPredicateNode,
  AstPredicateOperand,
  AstPredicateRefOperand,
  AstPredicateStringKeyOf,
  AstPredicateTableBuilder,
  AstPredicateTableModel,
  AstPredicateTableUniqueIndexesFactory,
  AstPredicateTableUniqueIndexesWithDefault,
  AstPredicateValue,
  AstPredicateValueOperand,
} from "./ast-predicate.types.js";

function isAstPredicateOperand<TRef extends string>(
  value: unknown,
): value is AstPredicateOperand<TRef> {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return false;
  }

  return value.type === "ref" || value.type === "value";
}

function normalizeAstPredicateRef<TRef extends string>(
  ref: TRef | AstPredicateRefOperand<TRef>,
): AstPredicateRefOperand<TRef> {
  if (typeof ref === "string") {
    return createAstPredicateRef(ref);
  }

  return ref;
}

export function createAstPredicateRef<TRef extends string>(
  ref: TRef,
): AstPredicateRefOperand<TRef> {
  return {
    type: "ref",
    ref,
  };
}

export function createAstPredicateValue(
  value: AstPredicateValue,
): AstPredicateValueOperand {
  return {
    type: "value",
    value,
  };
}

export function createAstPredicateExpressionBuilder<
  TRef extends string,
>(): AstPredicateExpressionBuilder<TRef> {
  const eb = ((
    left: TRef | AstPredicateRefOperand<TRef>,
    op: Parameters<AstPredicateExpressionBuilder<TRef>>[1],
    right: AstPredicateExpressionRight<TRef>,
  ) => ({
    type: "binary",
    left: normalizeAstPredicateRef(left),
    op,
    right: isAstPredicateOperand(right)
      ? right
      : createAstPredicateValue(right),
  })) as AstPredicateExpressionBuilder<TRef>;

  return Object.assign(eb, {
    ref: normalizeAstPredicateRef<TRef>,
    val: createAstPredicateValue,

    and: (nodes: readonly AstPredicateNode<TRef>[]) => ({
      type: "logical",
      op: "and",
      nodes,
    }),

    or: (nodes: readonly AstPredicateNode<TRef>[]) => ({
      type: "logical",
      op: "or",
      nodes,
    }),

    not: (node: AstPredicateNode<TRef>) => ({
      type: "unary",
      op: "not",
      node,
    }),
  });
}

export function createAstPredicateExpressionContext<TRef extends string>(
  eb: AstPredicateExpressionBuilder<TRef>,
): AstPredicateExpressionContext<TRef> {
  return {
    eb,
    ref: eb.ref,
    val: eb.val,
    and: eb.and,
    or: eb.or,
    not: eb.not,
  };
}

export function resolveAstPredicateInput<TRef extends string>(
  input: AstPredicateInput<TRef>,
  eb: AstPredicateExpressionBuilder<TRef> = createAstPredicateExpressionBuilder<TRef>(),
): AstPredicateNode<TRef> {
  if (typeof input === "function") {
    return input(createAstPredicateExpressionContext(eb));
  }

  return input;
}

export function createAstPredicateWhere<TTable extends object>(
  factory: AstPredicateExpressionFactory<AstPredicateColumnRef<TTable>>,
): AstPredicateNode<AstPredicateColumnRef<TTable>> {
  const eb =
    createAstPredicateExpressionBuilder<AstPredicateColumnRef<TTable>>();

  return factory(createAstPredicateExpressionContext(eb));
}

/**
 * Creates a table-scoped AST predicate builder.
 *
 * The builder can create table-scoped predicates through `where(...)`,
 * expose a typed expression builder through `expressionBuilder()`, and
 * define table unique-index metadata through `uniqueIndexes(...)`.
 *
 * By default, `uniqueIndexes(...)` requires a unique index named `pkey`.
 * Pass a different string as `TDefaultUniqueIndexName` to require another
 * index name, or pass `never` to disable the required default index.
 *
 * @typeParam TTable - Table attributes used for column-name validation.
 * @typeParam TDefaultUniqueIndexName - Required unique-index key. Defaults to `pkey`.
 *
 * @example
 * ```ts
 * const table = createAstPredicateTableBuilder<ArticleTable>();
 *
 * const uniqueIndexes = table.uniqueIndexes(({ eb }) => ({
 *   pkey: {
 *     columns: ['code'],
 *   },
 *   active_slug_unique: {
 *     columns: ['workspaceId', 'slug'],
 *     where: eb('deletedAt', 'is', null),
 *   },
 * }));
 * ```
 * 
 * @example
 * ```ts
 * const table = createAstPredicateTableBuilder<ArticleTable, never>();
 *
 * const uniqueIndexes = table.uniqueIndexes({
 *   active_slug_unique: {
 *     columns: ['workspaceId', 'slug'],
 *   },
 * });
 * ```
 */
export function createAstPredicateTableBuilder<
  TTable extends object,
  TDefaultUniqueIndexName extends string = 'pkey',
>(): AstPredicateTableBuilder<TTable, TDefaultUniqueIndexName> {
  const expressionBuilder = () =>
    createAstPredicateExpressionBuilder<AstPredicateColumnRef<TTable>>();

  const where = (
    factory: AstPredicateExpressionFactory<AstPredicateColumnRef<TTable>>,
  ) => createAstPredicateWhere<TTable>(factory);

  const uniqueIndexes = <
    const TUniqueIndexes extends AstPredicateTableUniqueIndexesWithDefault<
      TTable,
      TDefaultUniqueIndexName
    >,
  >(
    indexesOrFactory:
      | TUniqueIndexes
      | AstPredicateTableUniqueIndexesFactory<TTable, TUniqueIndexes>,
  ): TUniqueIndexes => {
    if (typeof indexesOrFactory === "function") {
      const eb = expressionBuilder();

      return indexesOrFactory({
        expressionBuilder,
        where,
        ...createAstPredicateExpressionContext(eb),
      });
    }

    return indexesOrFactory;
  };

  return {
    expressionBuilder,
    where,
    uniqueIndexes,
  };
}

export function createAstPredicateDatabase<
  TDB extends object,
  TAliases extends AstPredicateDatabaseAliasMap<TDB> = Record<never, never>,
>(): AstPredicateDatabase<TDB, TAliases> {
  type TRef = AstPredicateDatabaseAnyRef<TDB, TAliases>;

  const expressionBuilder = () => createAstPredicateExpressionBuilder<TRef>();

  const table = <TTableName extends AstPredicateStringKeyOf<TDB>>(
    _table: TTableName,
  ): AstPredicateTableBuilder<AstPredicateTableModel<TDB, TTableName>> => {
    void _table;

    return createAstPredicateTableBuilder<
      AstPredicateTableModel<TDB, TTableName>
    >();
  };

  return {
    table,

    ref: (ref) => createAstPredicateRef(ref),

    expressionBuilder,

    where: (factory) => {
      const eb = expressionBuilder();

      return factory(createAstPredicateExpressionContext(eb));
    },
  };
}
