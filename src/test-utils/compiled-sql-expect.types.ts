export type CompiledSqlAssertInput = {
    readonly sql: string;
    readonly parameters: readonly unknown[];
};

export type CompiledSqlAssertion = {
    readonly contains?: readonly string[];
    readonly notContains?: readonly string[];
    readonly matches?: readonly RegExp[];
    readonly notMatches?: readonly RegExp[];
    readonly parameters?: readonly unknown[];
    readonly exactParameters?: readonly unknown[];
};

export type ExpectMatcher = {
    readonly not: {
        toContain(expected: unknown): void;
        toEqual(expected: unknown): void;
        toMatch(expected: RegExp): void;
        toHaveLength(expected: number): void;
    };

    toContain(expected: unknown): void;
    toEqual(expected: unknown): void;
    toMatch(expected: RegExp): void;
    toHaveLength(expected: number): void;
};

export type ExpectFunction = (actual: unknown) => ExpectMatcher;

export type CompiledSqlExpect = {
    readonly normalizeSql: (sql: string) => string;
    readonly quotedPgTable: (table: string) => string;
    readonly quotedPgColumn: (column: string) => string;
    readonly expectCompiledSql: (
        compiled: CompiledSqlAssertInput,
        assertion: CompiledSqlAssertion,
    ) => void;
    readonly expectSelectFrom: (
        compiled: CompiledSqlAssertInput,
        table: string,
    ) => void;
    readonly expectUpdateTable: (
        compiled: CompiledSqlAssertInput,
        table: string,
    ) => void;
    readonly expectWhereEquals: (
        compiled: CompiledSqlAssertInput,
        column: string,
        value?: unknown,
    ) => void;
    readonly expectWhereIsNull: (
        compiled: CompiledSqlAssertInput,
        column: string,
    ) => void;
    readonly expectNoWhereEquals: (
        compiled: CompiledSqlAssertInput,
        column: string,
        value?: unknown,
    ) => void;
    readonly expectSetColumn: (
        compiled: CompiledSqlAssertInput,
        column: string,
        value?: unknown,
    ) => void;
    readonly expectOrderByColumn: (
        compiled: CompiledSqlAssertInput,
        column: string,
        direction: 'asc' | 'desc',
    ) => void;
    readonly expectLimitParameter: (
        compiled: CompiledSqlAssertInput,
        limit: number,
    ) => void;
    readonly expectParameterOccurrences: (
        compiled: CompiledSqlAssertInput,
        value: unknown,
        count: number,
    ) => void;
};
