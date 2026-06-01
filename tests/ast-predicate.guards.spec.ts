import { describe, expect, it } from 'vitest';

import {
    isAstPredicateBinaryOperator,
    isAstPredicateLogicalOperator,
    isAstPredicateNode,
    isAstPredicatePrimitive,
    isAstPredicateUnaryOperator,
    isAstPredicateValue,
} from '../src/index.js';

describe('ast predicate guards', () => {
    it('detects logical operators', () => {
        expect(isAstPredicateLogicalOperator('and')).toBe(true);
        expect(isAstPredicateLogicalOperator('or')).toBe(true);
        expect(isAstPredicateLogicalOperator('xor')).toBe(false);
    });

    it('detects binary operators', () => {
        expect(isAstPredicateBinaryOperator('=')).toBe(true);
        expect(isAstPredicateBinaryOperator('is')).toBe(true);
        expect(isAstPredicateBinaryOperator('is not')).toBe(true);
        expect(isAstPredicateBinaryOperator('in')).toBe(true);
        expect(isAstPredicateBinaryOperator('not in')).toBe(true);
        expect(isAstPredicateBinaryOperator('contains')).toBe(false);
    });

    it('detects unary operators', () => {
        expect(isAstPredicateUnaryOperator('not')).toBe(true);
        expect(isAstPredicateUnaryOperator('exists')).toBe(false);
    });

    it('detects primitive values', () => {
        expect(isAstPredicatePrimitive('ACTIVE')).toBe(true);
        expect(isAstPredicatePrimitive(1)).toBe(true);
        expect(isAstPredicatePrimitive(true)).toBe(true);
        expect(isAstPredicatePrimitive(new Date())).toBe(true);
        expect(isAstPredicatePrimitive(null)).toBe(true);
        expect(isAstPredicatePrimitive({})).toBe(false);
    });

    it('detects predicate values', () => {
        expect(isAstPredicateValue(['ACTIVE', 'DRAFT'])).toBe(true);
        expect(isAstPredicateValue(['ACTIVE', {}])).toBe(false);
    });

    it('detects valid predicate nodes', () => {
        expect(
            isAstPredicateNode({
                type: 'logical',
                op: 'and',
                nodes: [
                    {
                        type: 'binary',
                        left: {
                            type: 'ref',
                            ref: 'deletedAt',
                        },
                        op: 'is',
                        right: {
                            type: 'value',
                            value: null,
                        },
                    },
                    {
                        type: 'unary',
                        op: 'not',
                        node: {
                            type: 'binary',
                            left: {
                                type: 'ref',
                                ref: 'status',
                            },
                            op: '=',
                            right: {
                                type: 'value',
                                value: 'ACTIVE',
                            },
                        },
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
                type: 'comparison',
                column: 'status',
                op: 'eq',
                value: 'ACTIVE',
            }),
        ).toBe(false);

        expect(
            isAstPredicateNode({
                type: 'binary',
                left: {
                    type: 'value',
                    value: 'status',
                },
                op: '=',
                right: {
                    type: 'value',
                    value: 'ACTIVE',
                },
            }),
        ).toBe(true);
    });
});