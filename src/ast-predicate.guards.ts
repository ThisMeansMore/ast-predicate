import { isRecord } from './internal/is-record.js';

import type {
    AstPredicateComparisonOperator,
    AstPredicateLogicalOperator,
    AstPredicateNode,
    AstPredicatePrimitive,
    AstPredicateValue,
} from './ast-predicate.types.js';

const logicalOperators = ['and', 'or'] as const;

const comparisonOperators = [
    'eq',
    'neq',
    'gt',
    'gte',
    'lt',
    'lte',
    'in',
    'notIn',
    'isNull',
    'isNotNull',
] as const;

export function isAstPredicateLogicalOperator(
    value: unknown,
): value is AstPredicateLogicalOperator {
    return logicalOperators.includes(value as AstPredicateLogicalOperator);
}

export function isAstPredicateComparisonOperator(
    value: unknown,
): value is AstPredicateComparisonOperator {
    return comparisonOperators.includes(value as AstPredicateComparisonOperator);
}

export function isAstPredicatePrimitive(
    value: unknown,
): value is AstPredicatePrimitive {
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value instanceof Date ||
        value === null
    );
}

export function isAstPredicateValue(value: unknown): value is AstPredicateValue {
    return (
        isAstPredicatePrimitive(value) ||
        (Array.isArray(value) && value.every(isAstPredicatePrimitive))
    );
}

export function isAstPredicateNode<TColumn extends string = string>(
    value: unknown,
): value is AstPredicateNode<TColumn> {
    if (!isRecord(value)) {
        return false;
    }

    if (value.type === 'logical') {
        return (
            isAstPredicateLogicalOperator(value.op) &&
            Array.isArray(value.conditions) &&
            value.conditions.every(isAstPredicateNode)
        );
    }

    if (value.type === 'comparison') {
        return (
            typeof value.column === 'string' &&
            isAstPredicateComparisonOperator(value.op) &&
            (!('value' in value) || isAstPredicateValue(value.value))
        );
    }

    return false;
}
