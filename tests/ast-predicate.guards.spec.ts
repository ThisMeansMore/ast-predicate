import { describe, expect, it } from 'vitest';

import {
    isAstPredicateComparisonOperator,
    isAstPredicateLogicalOperator,
    isAstPredicateNode,
    isAstPredicatePrimitive,
    isAstPredicateValue,
} from '../src/index.js';

describe('ast predicate guards', () => {
    it('detects logical operators', () => {
        expect(isAstPredicateLogicalOperator('and')).toBe(true);
        expect(isAstPredicateLogicalOperator('or')).toBe(true);
        expect(isAstPredicateLogicalOperator('xor')).toBe(false);
    });

    it('detects comparison operators', () => {
        expect(isAstPredicateComparisonOperator('eq')).toBe(true);
        expect(isAstPredicateComparisonOperator('isNull')).toBe(true);
        expect(isAstPredicateComparisonOperator('contains')).toBe(false);
    });

    it('detects primitive values', () => {
        expect(isAstPredicatePrimitive('text')).toBe(true);
        expect(isAstPredicatePrimitive(123)).toBe(true);
        expect(isAstPredicatePrimitive(false)).toBe(true);
        expect(isAstPredicatePrimitive(null)).toBe(true);
        expect(isAstPredicatePrimitive(new Date())).toBe(true);
        expect(isAstPredicatePrimitive({})).toBe(false);
    });

    it('detects predicate values', () => {
        expect(isAstPredicateValue(['ACTIVE', 'INACTIVE'])).toBe(true);
        expect(isAstPredicateValue(['ACTIVE', {}])).toBe(false);
    });

    it('detects valid predicate nodes', () => {
        expect(
            isAstPredicateNode({
                type: 'logical',
                op: 'and',
                conditions: [
                    {
                        type: 'comparison',
                        column: 'status',
                        op: 'eq',
                        value: 'ACTIVE',
                    },
                ],
            }),
        ).toBe(true);
    });

    it('rejects invalid predicate nodes', () => {
        expect(isAstPredicateNode(null)).toBe(false);
        expect(isAstPredicateNode({})).toBe(false);

        expect(
            isAstPredicateNode({
                type: 'logical',
                op: 'xor',
                conditions: [],
            }),
        ).toBe(false);

        expect(
            isAstPredicateNode({
                type: 'comparison',
                column: 'status',
                op: 'eq',
                value: {},
            }),
        ).toBe(false);
    });
});
