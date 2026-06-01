import { describe, expect, it } from 'vitest';

import {
    collectAstPredicateRefs,
    createAstPredicateWhere,
    mapAstPredicateRefs,
} from '../src/index.js';

describe('ast predicate utils', () => {
    it('collects refs from nested predicate nodes', () => {
        type ArticleTable = {
            status: string;
            deletedAt: Date | null;
            workspaceId: string;
        };

        const node = createAstPredicateWhere<ArticleTable>(({ eb, and, or }) =>
            and([
                eb('status', '=', 'PUBLISHED'),
                or([
                    eb('deletedAt', 'is', null),
                    eb('workspaceId', '=', 'workspace-1'),
                ]),
            ]),
        );

        expect(collectAstPredicateRefs(node)).toEqual([
            'status',
            'deletedAt',
            'workspaceId',
        ]);
    });

    it('maps refs from nested predicate nodes', () => {
        type ArticleTable = {
            status: string;
            deletedAt: Date | null;
            workspaceId: string;
        };

        const node = createAstPredicateWhere<ArticleTable>(({ eb, and, or }) =>
            and([
                eb('status', '=', 'PUBLISHED'),
                or([
                    eb('deletedAt', 'is', null),
                    eb('workspaceId', '=', 'workspace-1'),
                ]),
            ]),
        );

        expect(mapAstPredicateRefs(node, (ref) => `Article.${ref}`)).toEqual({
            type: 'logical',
            op: 'and',
            nodes: [
                {
                    type: 'binary',
                    left: {
                        type: 'ref',
                        ref: 'Article.status',
                    },
                    op: '=',
                    right: {
                        type: 'value',
                        value: 'PUBLISHED',
                    },
                },
                {
                    type: 'logical',
                    op: 'or',
                    nodes: [
                        {
                            type: 'binary',
                            left: {
                                type: 'ref',
                                ref: 'Article.deletedAt',
                            },
                            op: 'is',
                            right: {
                                type: 'value',
                                value: null,
                            },
                        },
                        {
                            type: 'binary',
                            left: {
                                type: 'ref',
                                ref: 'Article.workspaceId',
                            },
                            op: '=',
                            right: {
                                type: 'value',
                                value: 'workspace-1',
                            },
                        },
                    ],
                },
            ],
        });
    });

    it('collects refs from ref-to-ref predicates', () => {
        const node = {
            type: 'binary',
            left: {
                type: 'ref',
                ref: 'Article.categoryId',
            },
            op: '=',
            right: {
                type: 'ref',
                ref: 'Category.id',
            },
        } as const;

        expect(collectAstPredicateRefs(node)).toEqual([
            'Article.categoryId',
            'Category.id',
        ]);
    });
});