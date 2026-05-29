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
