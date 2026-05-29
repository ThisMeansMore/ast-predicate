import type {
    CompiledSqlAssertInput,
    CompiledSqlAssertion,
    CompiledSqlExpect,
    ExpectFunction,
} from './compiled-sql-expect.types.js';

export function normalizeSql(sql: string): string {
    return sql.replace(/\s+/g, ' ').trim();
}

export function quotedPgTable(table: string): string {
    const [schema, tableName] = table.split('.');

    if (!schema || !tableName) {
        throw new Error(
            `Expected PostgreSQL table name in "schema.table" format, received "${table}".`,
        );
    }

    return `"${schema}"\\."${tableName}"`;
}

export function quotedPgColumn(column: string): string {
    return `"${column}"`;
}

export function createCompiledSqlExpect(
    expectFn: ExpectFunction,
): CompiledSqlExpect {
    function expectCompiledSql(
        compiled: CompiledSqlAssertInput,
        assertion: CompiledSqlAssertion,
    ): void {
        const normalizedSql = normalizeSql(compiled.sql);

        for (const fragment of assertion.contains ?? []) {
            expectFn(normalizedSql).toContain(normalizeSql(fragment));
        }

        for (const fragment of assertion.notContains ?? []) {
            expectFn(normalizedSql).not.toContain(normalizeSql(fragment));
        }

        for (const pattern of assertion.matches ?? []) {
            expectFn(normalizedSql).toMatch(pattern);
        }

        for (const pattern of assertion.notMatches ?? []) {
            expectFn(normalizedSql).not.toMatch(pattern);
        }

        for (const parameter of assertion.parameters ?? []) {
            expectFn(compiled.parameters).toContain(parameter);
        }

        if (assertion.exactParameters) {
            expectFn(compiled.parameters).toEqual(assertion.exactParameters);
        }
    }

    function expectSelectFrom(
        compiled: CompiledSqlAssertInput,
        table: string,
    ): void {
        expectCompiledSql(compiled, {
            matches: [
                new RegExp(
                    `^select\\s+.+\\s+from\\s+${quotedPgTable(table)}(?:\\s|$)`,
                    'i',
                ),
            ],
        });
    }

    function expectUpdateTable(
        compiled: CompiledSqlAssertInput,
        table: string,
    ): void {
        expectCompiledSql(compiled, {
            matches: [
                new RegExp(`^update\\s+${quotedPgTable(table)}\\s+set\\s+`, 'i'),
            ],
        });
    }

    function expectWhereEquals(
        compiled: CompiledSqlAssertInput,
        column: string,
        value?: unknown,
    ): void {
        expectCompiledSql(compiled, {
            matches: [
                new RegExp(`${quotedPgColumn(column)}\\s*=\\s*\\$\\d+`, 'i'),
            ],
        });

        if (value !== undefined) {
            expectFn(compiled.parameters).toContain(value);
        }
    }

    function expectWhereIsNull(
        compiled: CompiledSqlAssertInput,
        column: string,
    ): void {
        expectCompiledSql(compiled, {
            matches: [
                new RegExp(`${quotedPgColumn(column)}\\s+is\\s+null`, 'i'),
            ],
        });
    }

    function expectNoWhereEquals(
        compiled: CompiledSqlAssertInput,
        column: string,
        value?: unknown,
    ): void {
        expectCompiledSql(compiled, {
            notMatches: [
                new RegExp(`${quotedPgColumn(column)}\\s*=\\s*\\$\\d+`, 'i'),
            ],
        });

        if (value !== undefined) {
            expectFn(compiled.parameters).not.toContain(value);
        }
    }

    function expectSetColumn(
        compiled: CompiledSqlAssertInput,
        column: string,
        value?: unknown,
    ): void {
        expectCompiledSql(compiled, {
            matches: [
                new RegExp(
                    `set\\s+.*${quotedPgColumn(column)}\\s*=\\s*\\$\\d+`,
                    'i',
                ),
            ],
        });

        if (value !== undefined) {
            expectFn(compiled.parameters).toContain(value);
        }
    }

    function expectOrderByColumn(
        compiled: CompiledSqlAssertInput,
        column: string,
        direction: 'asc' | 'desc',
    ): void {
        expectCompiledSql(compiled, {
            matches: [
                new RegExp(
                    `order\\s+by\\s+.*${quotedPgColumn(column)}\\s+${direction}`,
                    'i',
                ),
            ],
        });
    }

    function expectLimitParameter(
        compiled: CompiledSqlAssertInput,
        limit: number,
    ): void {
        expectCompiledSql(compiled, {
            matches: [/limit\s+\$\d+/i],
            parameters: [limit],
        });
    }

    function expectParameterOccurrences(
        compiled: CompiledSqlAssertInput,
        value: unknown,
        count: number,
    ): void {
        const occurrences = compiled.parameters.filter(
            (parameter) => parameter === value,
        );

        expectFn(occurrences).toHaveLength(count);
    }

    return {
        normalizeSql,
        quotedPgTable,
        quotedPgColumn,
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
    };
}
