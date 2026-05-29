import type {
    AstPredicateComparisonNode,
    AstPredicateLogicalNode,
    AstPredicateNode,
    AstPredicatePrimitive,
} from './ast-predicate.types.js';

export function and<TColumn extends string>(
    ...conditions: readonly AstPredicateNode<TColumn>[]
): AstPredicateLogicalNode<TColumn> {
    return {
        type: 'logical',
        op: 'and',
        conditions,
    };
}

export function or<TColumn extends string>(
    ...conditions: readonly AstPredicateNode<TColumn>[]
): AstPredicateLogicalNode<TColumn> {
    return {
        type: 'logical',
        op: 'or',
        conditions,
    };
}

export function eq<TColumn extends string>(
    column: TColumn,
    value: AstPredicatePrimitive,
): AstPredicateComparisonNode<TColumn> {
    return {
        type: 'comparison',
        column,
        op: 'eq',
        value,
    };
}

export function neq<TColumn extends string>(
    column: TColumn,
    value: AstPredicatePrimitive,
): AstPredicateComparisonNode<TColumn> {
    return {
        type: 'comparison',
        column,
        op: 'neq',
        value,
    };
}

export function gt<TColumn extends string>(
    column: TColumn,
    value: Exclude<AstPredicatePrimitive, boolean | null>,
): AstPredicateComparisonNode<TColumn> {
    return {
        type: 'comparison',
        column,
        op: 'gt',
        value,
    };
}

export function gte<TColumn extends string>(
    column: TColumn,
    value: Exclude<AstPredicatePrimitive, boolean | null>,
): AstPredicateComparisonNode<TColumn> {
    return {
        type: 'comparison',
        column,
        op: 'gte',
        value,
    };
}

export function lt<TColumn extends string>(
    column: TColumn,
    value: Exclude<AstPredicatePrimitive, boolean | null>,
): AstPredicateComparisonNode<TColumn> {
    return {
        type: 'comparison',
        column,
        op: 'lt',
        value,
    };
}

export function lte<TColumn extends string>(
    column: TColumn,
    value: Exclude<AstPredicatePrimitive, boolean | null>,
): AstPredicateComparisonNode<TColumn> {
    return {
        type: 'comparison',
        column,
        op: 'lte',
        value,
    };
}

export function inArray<TColumn extends string>(
    column: TColumn,
    value: readonly AstPredicatePrimitive[],
): AstPredicateComparisonNode<TColumn> {
    return {
        type: 'comparison',
        column,
        op: 'in',
        value,
    };
}

export function notInArray<TColumn extends string>(
    column: TColumn,
    value: readonly AstPredicatePrimitive[],
): AstPredicateComparisonNode<TColumn> {
    return {
        type: 'comparison',
        column,
        op: 'notIn',
        value,
    };
}

export function isNull<TColumn extends string>(
    column: TColumn,
): AstPredicateComparisonNode<TColumn> {
    return {
        type: 'comparison',
        column,
        op: 'isNull',
    };
}

export function isNotNull<TColumn extends string>(
    column: TColumn,
): AstPredicateComparisonNode<TColumn> {
    return {
        type: 'comparison',
        column,
        op: 'isNotNull',
    };
}
