export type AstPredicateLogicalOperator = 'and' | 'or';

export type AstPredicateComparisonOperator =
    | 'eq'
    | 'neq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'notIn'
    | 'isNull'
    | 'isNotNull';

export type AstPredicatePrimitive = string | number | boolean | Date | null;

export type AstPredicateValue =
    | AstPredicatePrimitive
    | readonly AstPredicatePrimitive[];

export type AstPredicateLogicalNode<TColumn extends string = string> = {
    readonly type: 'logical';
    readonly op: AstPredicateLogicalOperator;
    readonly conditions: readonly AstPredicateNode<TColumn>[];
};

export type AstPredicateComparisonNode<TColumn extends string = string> = {
    readonly type: 'comparison';
    readonly column: TColumn;
    readonly op: AstPredicateComparisonOperator;
    readonly value?: AstPredicateValue;
};

export type AstPredicateNode<TColumn extends string = string> =
    | AstPredicateLogicalNode<TColumn>
    | AstPredicateComparisonNode<TColumn>;

export type AstPredicateColumnOf<TModel extends object> =
    Extract<keyof TModel, string>;

export type AstPredicateBuilder<TColumn extends string> = {
    readonly and: (
        ...conditions: readonly AstPredicateNode<TColumn>[]
    ) => AstPredicateLogicalNode<TColumn>;

    readonly or: (
        ...conditions: readonly AstPredicateNode<TColumn>[]
    ) => AstPredicateLogicalNode<TColumn>;

    readonly eq: (
        column: TColumn,
        value: AstPredicatePrimitive,
    ) => AstPredicateComparisonNode<TColumn>;

    readonly neq: (
        column: TColumn,
        value: AstPredicatePrimitive,
    ) => AstPredicateComparisonNode<TColumn>;

    readonly gt: (
        column: TColumn,
        value: Exclude<AstPredicatePrimitive, boolean | null>,
    ) => AstPredicateComparisonNode<TColumn>;

    readonly gte: (
        column: TColumn,
        value: Exclude<AstPredicatePrimitive, boolean | null>,
    ) => AstPredicateComparisonNode<TColumn>;

    readonly lt: (
        column: TColumn,
        value: Exclude<AstPredicatePrimitive, boolean | null>,
    ) => AstPredicateComparisonNode<TColumn>;

    readonly lte: (
        column: TColumn,
        value: Exclude<AstPredicatePrimitive, boolean | null>,
    ) => AstPredicateComparisonNode<TColumn>;

    readonly inArray: (
        column: TColumn,
        value: readonly AstPredicatePrimitive[],
    ) => AstPredicateComparisonNode<TColumn>;

    readonly notInArray: (
        column: TColumn,
        value: readonly AstPredicatePrimitive[],
    ) => AstPredicateComparisonNode<TColumn>;

    readonly isNull: (column: TColumn) => AstPredicateComparisonNode<TColumn>;

    readonly isNotNull: (column: TColumn) => AstPredicateComparisonNode<TColumn>;
};