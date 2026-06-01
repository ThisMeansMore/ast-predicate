import { describe, expect, it } from 'vitest';

import {
    createAstPredicateDatabase,
    createAstPredicateExpressionBuilder,
    createAstPredicateWhere,
    resolveAstPredicateInput,
    type AstPredicateColumnRef,
} from '../src/index.js';

describe('ast predicate builders', () => {
    it('builds table-scoped binary expressions', () => {
        type EditionTable = {
            code: string;
            status: string;
            deletedAt: Date | null;
        };

        const eb = createAstPredicateExpressionBuilder<
    AstPredicateColumnRef<EditionTable>
>();

        expect(eb('status', '=', 'ACTIVE')).toEqual({
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
        });
    });

    it('builds array expressions', () => {
        type EditionTable = {
            status: string;
        };

        const eb = createAstPredicateExpressionBuilder<
    AstPredicateColumnRef<EditionTable>
>();

        expect(eb('status', 'in', ['ACTIVE', 'INACTIVE'])).toEqual({
            type: 'binary',
            left: {
                type: 'ref',
                ref: 'status',
            },
            op: 'in',
            right: {
                type: 'value',
                value: ['ACTIVE', 'INACTIVE'],
            },
        });
    });

    it('builds null expressions', () => {
        type EditionTable = {
            deletedAt: Date | null;
        };

        const eb = createAstPredicateExpressionBuilder<
    AstPredicateColumnRef<EditionTable>
>();

        expect(eb('deletedAt', 'is', null)).toEqual({
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
        });
    });

    it('builds logical expressions', () => {
        type EditionTable = {
            status: string;
            deletedAt: Date | null;
            publishedAt: Date | null;
        };

        const eb = createAstPredicateExpressionBuilder<
    AstPredicateColumnRef<EditionTable>
>();

        expect(
            eb.and([
                eb('status', '=', 'ACTIVE'),
                eb.or([
                    eb('deletedAt', 'is', null),
                    eb('publishedAt', 'is not', null),
                ]),
            ]),
        ).toEqual({
            type: 'logical',
            op: 'and',
            nodes: [
                {
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
                {
                    type: 'logical',
                    op: 'or',
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
                            type: 'binary',
                            left: {
                                type: 'ref',
                                ref: 'publishedAt',
                            },
                            op: 'is not',
                            right: {
                                type: 'value',
                                value: null,
                            },
                        },
                    ],
                },
            ],
        });
    });

    it('builds callback expressions', () => {
        type EditionTable = {
            status: string;
            deletedAt: Date | null;
        };

        expect(
            createAstPredicateWhere<EditionTable>(({ eb, and }) =>
                and([
                    eb('deletedAt', 'is', null),
                    eb('status', '=', 'ACTIVE'),
                ]),
            ),
        ).toEqual({
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
            ],
        });
    });

    it('builds database-scoped ref-to-ref expressions', () => {
        type DB = {
            Edition: {
                ProductCode: string;
                TenantCode: string;
            };
            Product: {
                code: string;
                TenantCode: string;
            };
        };

        const db = createAstPredicateDatabase<DB>();

        expect(
            db.where(({ eb, and, ref }) =>
                and([
                    eb('Edition.ProductCode', '=', ref('Product.code')),
                    eb('Edition.TenantCode', '=', ref('Product.TenantCode')),
                ]),
            ),
        ).toEqual({
            type: 'logical',
            op: 'and',
            nodes: [
                {
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
                },
                {
                    type: 'binary',
                    left: {
                        type: 'ref',
                        ref: 'Edition.TenantCode',
                    },
                    op: '=',
                    right: {
                        type: 'ref',
                        ref: 'Product.TenantCode',
                    },
                },
            ],
        });
    });

    it('builds database-scoped alias refs', () => {
        type DB = {
            Edition: {
                ProductCode: string;
                TenantCode: string;
            };
            Product: {
                code: string;
                TenantCode: string;
            };
        };

        const db = createAstPredicateDatabase<
            DB,
            {
                e: 'Edition';
                p: 'Product';
            }
        >();

        expect(
            db.where(({ eb, and, ref }) =>
                and([
                    eb('e.ProductCode', '=', ref('p.code')),
                    eb('e.TenantCode', '=', ref('p.TenantCode')),
                ]),
            ),
        ).toEqual({
            type: 'logical',
            op: 'and',
            nodes: [
                {
                    type: 'binary',
                    left: {
                        type: 'ref',
                        ref: 'e.ProductCode',
                    },
                    op: '=',
                    right: {
                        type: 'ref',
                        ref: 'p.code',
                    },
                },
                {
                    type: 'binary',
                    left: {
                        type: 'ref',
                        ref: 'e.TenantCode',
                    },
                    op: '=',
                    right: {
                        type: 'ref',
                        ref: 'p.TenantCode',
                    },
                },
            ],
        });
    });

    it('resolves predicate callback input', () => {
        type EditionTable = {
            deletedAt: Date | null;
        };

        const eb = createAstPredicateExpressionBuilder<
    AstPredicateColumnRef<EditionTable>
>();

        expect(
            resolveAstPredicateInput(
                ({ eb }) => eb('deletedAt', 'is', null),
                eb,
            ),
        ).toEqual({
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
        });
    });
});