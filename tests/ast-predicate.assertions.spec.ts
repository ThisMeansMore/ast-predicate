import { describe, expect, it } from 'vitest';

import {
    assertAstPredicateNode,
    assertAstPredicateRefsAllowed,
    AstPredicateRefNotAllowedError,
    createAstPredicateWhere,
    InvalidAstPredicateNodeError,
} from '../src/index.js';

describe('ast predicate assertions', () => {
    it('does not throw for valid predicate nodes', () => {
        type ArticleTable = {
            status: string;
            deletedAt: Date | null;
        };

        const node = createAstPredicateWhere<ArticleTable>(({ eb, or }) =>
            or([
                eb('status', '=', 'PUBLISHED'),
                eb('deletedAt', 'is', null),
            ]),
        );

        expect(() => {
            assertAstPredicateNode(node);
        }).not.toThrow();
    });

    it('throws for invalid predicate nodes', () => {
        expect(() => {
            assertAstPredicateNode({
                type: 'comparison',
                column: 'status',
                op: 'eq',
                value: 'PUBLISHED',
            });
        }).toThrow(InvalidAstPredicateNodeError);
    });

    it('does not throw when all refs are allowed', () => {
        type ArticleTable = {
            status: string;
            deletedAt: Date | null;
        };

        const node = createAstPredicateWhere<ArticleTable>(({ eb, or }) =>
            or([
                eb('status', '=', 'PUBLISHED'),
                eb('deletedAt', 'is', null),
            ]),
        );

        expect(() => {
            assertAstPredicateRefsAllowed(node, ['status', 'deletedAt']);
        }).not.toThrow();
    });

    it('throws when a ref is not allowed', () => {
        type ArticleTable = {
            status: string;
            deletedAt: Date | null;
        };

        const node = createAstPredicateWhere<ArticleTable>(({ eb, or }) =>
            or([
                eb('status', '=', 'PUBLISHED'),
                eb('deletedAt', 'is', null),
            ]),
        );

        expect(() => {
            assertAstPredicateRefsAllowed(node, ['status']);
        }).toThrow(AstPredicateRefNotAllowedError);
    });
});