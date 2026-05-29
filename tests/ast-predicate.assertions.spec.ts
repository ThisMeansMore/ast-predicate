import { describe, expect, it } from 'vitest';

import {
    AstPredicateColumnNotAllowedError,
    assertAstPredicateColumnsAllowed,
    assertAstPredicateNode,
    eq,
    isNull,
    or,
} from '../src/index.js';

describe('ast predicate assertions', () => {
    it('does not throw for valid predicate nodes', () => {
        expect(() => {
            assertAstPredicateNode(or(eq('status', 'ACTIVE'), isNull('deletedAt')));
        }).not.toThrow();
    });

    it('throws for invalid predicate nodes', () => {
        expect(() => {
            assertAstPredicateNode({});
        }).toThrow('Invalid AST predicate node.');
    });

    it('does not throw when all columns are allowed', () => {
        const node = or(eq('status', 'ACTIVE'), isNull('deletedAt'));

        expect(() => {
            assertAstPredicateColumnsAllowed(node, ['status', 'deletedAt']);
        }).not.toThrow();
    });

    it('throws when a column is not allowed', () => {
        const node = or(eq('status', 'ACTIVE'), isNull('deletedAt'));

        expect(() => {
            assertAstPredicateColumnsAllowed(node, ['status']);
        }).toThrow(AstPredicateColumnNotAllowedError);
    });
});
