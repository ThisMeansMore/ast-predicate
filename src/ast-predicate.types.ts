export type AstPredicatePrimitive = string | number | boolean | Date | null;

export type AstPredicateValue =
  | AstPredicatePrimitive
  | readonly AstPredicatePrimitive[];

export type AstPredicateBinaryOperator =
  | "="
  | "!="
  | "<>"
  | ">"
  | ">="
  | "<"
  | "<="
  | "in"
  | "not in"
  | "is"
  | "is not"
  | "like"
  | "not like";

export type AstPredicateLogicalOperator = "and" | "or";

export type AstPredicateUnaryOperator = "not";

export type AstPredicateRefOperand<TRef extends string = string> = {
  readonly type: "ref";
  readonly ref: TRef;
};

export type AstPredicateValueOperand = {
  readonly type: "value";
  readonly value: AstPredicateValue;
};

export type AstPredicateOperand<TRef extends string = string> =
  | AstPredicateRefOperand<TRef>
  | AstPredicateValueOperand;

export type AstPredicateBinaryNode<TRef extends string = string> = {
  readonly type: "binary";
  readonly left: AstPredicateRefOperand<TRef>;
  readonly op: AstPredicateBinaryOperator;
  readonly right: AstPredicateOperand<TRef>;
};

export type AstPredicateLogicalNode<TRef extends string = string> = {
  readonly type: "logical";
  readonly op: AstPredicateLogicalOperator;
  readonly nodes: readonly AstPredicateNode<TRef>[];
};

export type AstPredicateUnaryNode<TRef extends string = string> = {
  readonly type: "unary";
  readonly op: AstPredicateUnaryOperator;
  readonly node: AstPredicateNode<TRef>;
};

export type AstPredicateNode<TRef extends string = string> =
  | AstPredicateBinaryNode<TRef>
  | AstPredicateLogicalNode<TRef>
  | AstPredicateUnaryNode<TRef>;

export type AstPredicateExpressionRight<TRef extends string = string> =
  | AstPredicateValue
  | AstPredicateOperand<TRef>;

export type AstPredicateExpressionBuilder<TRef extends string = string> = {
  (
    left: TRef | AstPredicateRefOperand<TRef>,
    op: AstPredicateBinaryOperator,
    right: AstPredicateExpressionRight<TRef>,
  ): AstPredicateBinaryNode<TRef>;

  readonly ref: (
    ref: TRef | AstPredicateRefOperand<TRef>,
  ) => AstPredicateRefOperand<TRef>;

  readonly val: (value: AstPredicateValue) => AstPredicateValueOperand;

  readonly and: (
    nodes: readonly AstPredicateNode<TRef>[],
  ) => AstPredicateLogicalNode<TRef>;

  readonly or: (
    nodes: readonly AstPredicateNode<TRef>[],
  ) => AstPredicateLogicalNode<TRef>;

  readonly not: (node: AstPredicateNode<TRef>) => AstPredicateUnaryNode<TRef>;
};

export type AstPredicateExpressionContext<TRef extends string = string> = {
  readonly eb: AstPredicateExpressionBuilder<TRef>;
  readonly ref: AstPredicateExpressionBuilder<TRef>["ref"];
  readonly val: AstPredicateExpressionBuilder<TRef>["val"];
  readonly and: AstPredicateExpressionBuilder<TRef>["and"];
  readonly or: AstPredicateExpressionBuilder<TRef>["or"];
  readonly not: AstPredicateExpressionBuilder<TRef>["not"];
};

export type AstPredicateExpressionFactory<TRef extends string = string> = (
  context: AstPredicateExpressionContext<TRef>,
) => AstPredicateNode<TRef>;

export type AstPredicateInput<TRef extends string = string> =
  | AstPredicateNode<TRef>
  | AstPredicateExpressionFactory<TRef>;

export type AstPredicateStringKeyOf<TValue> = Extract<keyof TValue, string>;

export type AstPredicateTableModel<
  TDB extends object,
  TTableName extends AstPredicateStringKeyOf<TDB>,
> = Extract<TDB[TTableName], object>;

export type AstPredicateColumnRef<TTable extends object> =
  AstPredicateStringKeyOf<TTable>;

export type AstPredicateTableUniqueIndex<
  TTable extends object,
  TColumns extends readonly AstPredicateColumnRef<TTable>[] =
    readonly AstPredicateColumnRef<TTable>[],
> = {
  readonly columns: TColumns;
  readonly predicate?: AstPredicateNode<AstPredicateColumnRef<TTable>>;
};

export type AstPredicateTableUniqueIndexes<TTable extends object> = Record<
  string,
  AstPredicateTableUniqueIndex<TTable>
>;

export type AstPredicateTableBuilder<TTable extends object> = {
  readonly expressionBuilder: () => AstPredicateExpressionBuilder<
    AstPredicateColumnRef<TTable>
  >;

  readonly where: (
    factory: AstPredicateExpressionFactory<AstPredicateColumnRef<TTable>>,
  ) => AstPredicateNode<AstPredicateColumnRef<TTable>>;

  readonly uniqueIndexes: <
    const TUniqueIndexes extends AstPredicateTableUniqueIndexes<TTable>,
  >(
    indexes: TUniqueIndexes,
  ) => TUniqueIndexes;
};

export type AstPredicateDatabaseRef<TDB extends object> = {
  [TTableName in AstPredicateStringKeyOf<TDB>]: TDB[TTableName] extends object
    ? `${TTableName}.${AstPredicateStringKeyOf<TDB[TTableName]>}`
    : never;
}[AstPredicateStringKeyOf<TDB>];

export type AstPredicateDatabaseAliasMap<TDB extends object> = Record<
  string,
  AstPredicateStringKeyOf<TDB>
>;

export type AstPredicateDatabaseAliasRef<
  TDB extends object,
  TAliases extends AstPredicateDatabaseAliasMap<TDB>,
> = {
  [TAlias in AstPredicateStringKeyOf<TAliases>]: TAliases[TAlias] extends AstPredicateStringKeyOf<TDB>
    ? TDB[TAliases[TAlias]] extends object
      ? `${TAlias}.${AstPredicateStringKeyOf<TDB[TAliases[TAlias]]>}`
      : never
    : never;
}[AstPredicateStringKeyOf<TAliases>];

export type AstPredicateDatabaseAnyRef<
  TDB extends object,
  TAliases extends AstPredicateDatabaseAliasMap<TDB> = Record<never, never>,
> = AstPredicateDatabaseRef<TDB> | AstPredicateDatabaseAliasRef<TDB, TAliases>;

export type AstPredicateDatabase<
  TDB extends object,
  TAliases extends AstPredicateDatabaseAliasMap<TDB> = Record<never, never>,
> = {
  readonly table: <TTableName extends AstPredicateStringKeyOf<TDB>>(
    table: TTableName,
  ) => AstPredicateTableBuilder<AstPredicateTableModel<TDB, TTableName>>;

  readonly ref: (
    ref: AstPredicateDatabaseAnyRef<TDB, TAliases>,
  ) => AstPredicateRefOperand<AstPredicateDatabaseAnyRef<TDB, TAliases>>;

  readonly expressionBuilder: () => AstPredicateExpressionBuilder<
    AstPredicateDatabaseAnyRef<TDB, TAliases>
  >;

  readonly where: (
    factory: AstPredicateExpressionFactory<
      AstPredicateDatabaseAnyRef<TDB, TAliases>
    >,
  ) => AstPredicateNode<AstPredicateDatabaseAnyRef<TDB, TAliases>>;
};