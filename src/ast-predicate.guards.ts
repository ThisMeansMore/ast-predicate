import { isRecord } from './internal/is-record.js';

import type {
    AstPredicateBinaryOperator,
    AstPredicateLogicalOperator,
    AstPredicateNode,
    AstPredicatePrimitive,
    AstPredicateUnaryOperator,
    AstPredicateValue,
} from './ast-predicate.types.js';

const binaryOperators = [
    '=',
    '!=',
    '<>',
    '>',
    '>=',
    '<',
    '<=',
    'in',
    'not in',
    'is',
    'is not',
    'like',
    'not like',
] as const;

const logicalOperators = ['and', 'or'] as const;

const unaryOperators = ['not'] as const;

export function isAstPredicateBinaryOperator(
    value: unknown,
): value is AstPredicateBinaryOperator {
    return binaryOperators.includes(value as AstPredicateBinaryOperator);
}

export function isAstPredicateLogicalOperator(
    value: unknown,
): value is AstPredicateLogicalOperator {
    return logicalOperators.includes(value as AstPredicateLogicalOperator);
}

export function isAstPredicateUnaryOperator(
    value: unknown,
): value is AstPredicateUnaryOperator {
    return unaryOperators.includes(value as AstPredicateUnaryOperator);
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

export function isAstPredicateOperand(value: unknown): boolean {
    if (!isRecord(value)) {
        return false;
    }

    if (value.type === 'ref') {
        return typeof value.ref === 'string';
    }

    if (value.type === 'value') {
        return isAstPredicateValue(value.value);
    }

    return false;
}

export function isAstPredicateNode<TRef extends string = string>(
    value: unknown,
): value is AstPredicateNode<TRef> {
    if (!isRecord(value)) {
        return false;
    }

    if (value.type === 'binary') {
        return (
            isAstPredicateOperand(value.left) &&
            isAstPredicateBinaryOperator(value.op) &&
            isAstPredicateOperand(value.right)
        );
    }

    if (value.type === 'logical') {
        return (
            isAstPredicateLogicalOperator(value.op) &&
            Array.isArray(value.nodes) &&
            value.nodes.every(isAstPredicateNode)
        );
    }

    if (value.type === 'unary') {
        return (
            isAstPredicateUnaryOperator(value.op) &&
            isAstPredicateNode(value.node)
        );
    }

    return false;
}