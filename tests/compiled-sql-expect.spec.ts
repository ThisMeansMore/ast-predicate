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
                    from "schema"."Articles"
                    where "workspaceId" = $1
                    limit $2
                `,
                parameters: ['workspace-1', 10],
            },
            {
                contains: ['from "schema"."Articles"'],
                notContains: ['order by'],
                matches: [/"workspaceId"\s*=\s*\$\d+/i],
                notMatches: [/offset/i],
                parameters: ['workspace-1'],
                exactParameters: ['workspace-1', 10],
            },
        );
    });

    it('asserts common PostgreSQL query patterns', () => {
        const compiled = {
            sql: `
                select *
                from "schema"."Articles"
                where "workspaceId" = $1
                  and "categoryId" = $2
                  and "deletedAt" is null
                order by "title" asc
                limit $3
            `,
            parameters: ['workspace-1', 'category-1', 25],
        };

        expectSelectFrom(compiled, 'schema.Articles');
        expectWhereEquals(compiled, 'workspaceId', 'workspace-1');
        expectWhereEquals(compiled, 'categoryId', 'category-1');
        expectWhereIsNull(compiled, 'deletedAt');
        expectNoWhereEquals(compiled, 'missingColumn');
        expectOrderByColumn(compiled, 'title', 'asc');
        expectLimitParameter(compiled, 25);
        expectParameterOccurrences(compiled, 'workspace-1', 1);
    });

    it('asserts update query patterns', () => {
        const compiled = {
            sql: `
                update "schema"."Articles"
                set "description" = $1
                where "id" = $2
            `,
            parameters: ['Updated', 'article-1'],
        };

        expectUpdateTable(compiled, 'schema.Articles');
        expectSetColumn(compiled, 'description', 'Updated');
        expectWhereEquals(compiled, 'id', 'article-1');
    });
});