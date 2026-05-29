import { describe, expect, it } from 'vitest';

import { createCompiledSqlExpect } from '../src/test-utils/index.js';

describe('compiled SQL expect test utils', () => {
    const {
        expectCompiledSql,
        expectSelectFrom,
        expectUpdateTable,
        expectWhereEquals,
        expectWhereIsNull,
        expectNoWhereEquals,
        expectSetColumn,
        expectOrderByColumn,
        expectLimitParameter,
        expectParameterOccurrences,
    } = createCompiledSqlExpect(expect);

    it('asserts SQL fragments and parameters', () => {
        expectCompiledSql(
            {
                sql: `
                    select *
                    from "superlicensor"."Editions"
                    where "TenantCode" = $1
                    limit $2
                `,
                parameters: ['tenant-1', 10],
            },
            {
                contains: ['from "superlicensor"."Editions"'],
                notContains: ['order by'],
                matches: [/"TenantCode"\s*=\s*\$\d+/i],
                notMatches: [/offset/i],
                parameters: ['tenant-1'],
                exactParameters: ['tenant-1', 10],
            },
        );
    });

    it('asserts common PostgreSQL query patterns', () => {
        const compiled = {
            sql: `
                select *
                from "superlicensor"."Editions"
                where "TenantCode" = $1
                  and "ProductCode" = $2
                  and "deletedAt" is null
                order by "name" asc
                limit $3
            `,
            parameters: ['tenant-1', 'product-1', 25],
        };

        expectSelectFrom(compiled, 'superlicensor.Editions');
        expectWhereEquals(compiled, 'TenantCode', 'tenant-1');
        expectWhereIsNull(compiled, 'deletedAt');
        expectNoWhereEquals(compiled, 'missingColumn');
        expectOrderByColumn(compiled, 'name', 'asc');
        expectLimitParameter(compiled, 25);
        expectParameterOccurrences(compiled, 'tenant-1', 1);
    });

    it('asserts update query patterns', () => {
        const compiled = {
            sql: `
                update "superlicensor"."Editions"
                set "description" = $1
                where "code" = $2
            `,
            parameters: ['Updated', 'edition-1'],
        };

        expectUpdateTable(compiled, 'superlicensor.Editions');
        expectSetColumn(compiled, 'description', 'Updated');
        expectWhereEquals(compiled, 'code', 'edition-1');
    });
});
