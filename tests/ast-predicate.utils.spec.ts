import { describe, expect, it } from 'vitest';

import {
    collectAstPredicateRefs,
    createAstPredicateWhere,
    mapAstPredicateRefs,
} from '../src/index.js';

describe('ast predicate utils', () => {
    it('collects refs from nested predicate nodes', () => {
        type EditionTable = {
            status: string;
            deletedAt: Date | null;
            tenantCode: string;
        };

        const node = createAstPredicateWhere<EditionTable>(({ eb, and, or }) =>
            and([
                eb('status', '=', 'ACTIVE'),
                or([
                    eb('deletedAt', 'is', null),
                    eb('tenantCode', '=', 'tenant-1'),
                ]),
            ]),
        );

        expect(collectAstPredicateRefs(node)).toEqual([
            'status',
            'deletedAt',
            'tenantCode',
        ]);
    });

    it('maps refs from nested predicate nodes', () => {
        type EditionTable = {
            status: string;
            deletedAt: Date | null;
            tenantCode: string;
        };

        const node = createAstPredicateWhere<EditionTable>(({ eb, and, or }) =>
            and([
                eb('status', '=', 'ACTIVE'),
                or([
                    eb('deletedAt', 'is', null),
                    eb('tenantCode', '=', 'tenant-1'),
                ]),
            ]),
        );

        expect(mapAstPredicateRefs(node, (ref) => `Edition.${ref}`)).toEqual({
            type: 'logical',
            op: 'and',
            nodes: [
                {
                    type: 'binary',
                    left: {
                        type: 'ref',
                        ref: 'Edition.status',
                    },
                    op: '=',
                    right: {
                        type: 'value',
                        value: 'ACTIVE',
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
                                ref: 'Edition.deletedAt',
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
                                ref: 'Edition.tenantCode',
                            },
                            op: '=',
                            right: {
                                type: 'value',
                                value: 'tenant-1',
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
                ref: 'Edition.ProductCode',
            },
            op: '=',
            right: {
                type: 'ref',
                ref: 'Product.code',
            },
        } as const;

        expect(collectAstPredicateRefs(node)).toEqual([
            'Edition.ProductCode',
            'Product.code',
        ]);
    });
});