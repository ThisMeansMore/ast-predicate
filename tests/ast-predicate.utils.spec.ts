import { describe, expect, it } from 'vitest';

import {
    and,
    collectAstPredicateColumns,
    eq,
    isNull,
    mapAstPredicateColumns,
    or,
} from '../src/index.js';

describe('ast predicate utils', () => {
    it('collects columns from nested predicate nodes', () => {
        const node = and(
            eq('status', 'ACTIVE'),
            or(isNull('deletedAt'), eq('tenantCode', 'tenant-1')),
        );

        expect(collectAstPredicateColumns(node)).toEqual([
            'status',
            'deletedAt',
            'tenantCode',
        ]);
    });

    it('maps columns from nested predicate nodes', () => {
        const node = and(
            eq('status', 'ACTIVE'),
            or(isNull('deletedAt'), eq('tenantCode', 'tenant-1')),
        );

        expect(mapAstPredicateColumns(node, (column) => `table.${column}`)).toEqual({
            type: 'logical',
            op: 'and',
            conditions: [
                {
                    type: 'comparison',
                    column: 'table.status',
                    op: 'eq',
                    value: 'ACTIVE',
                },
                {
                    type: 'logical',
                    op: 'or',
                    conditions: [
                        {
                            type: 'comparison',
                            column: 'table.deletedAt',
                            op: 'isNull',
                        },
                        {
                            type: 'comparison',
                            column: 'table.tenantCode',
                            op: 'eq',
                            value: 'tenant-1',
                        },
                    ],
                },
            ],
        });
    });
});
