import { isAstPredicateNode } from './ast-predicate.guards.js';

import type { AstPredicateNode } from './ast-predicate.types.js';

export class InvalidAstPredicateNodeError extends Error {
    constructor() {
        super('Invalid AST predicate node.');
        this.name = 'InvalidAstPredicateNodeError';
    }
}

export class AstPredicateColumnNotAllowedError extends Error {
    constructor(column: string) {
        super(`AST predicate column "${column}" is not allowed.`);
        this.name = 'AstPredicateColumnNotAllowedError';
    }
}

export function assertAstPredicateNode<TColumn extends string = string>(
    value: unknown,
): asserts value is AstPredicateNode<TColumn> {
    if (!isAstPredicateNode<TColumn>(value)) {
        throw new InvalidAstPredicateNodeError();
    }
}

export function assertAstPredicateColumnsAllowed<TColumn extends string>(
    node: AstPredicateNode<TColumn>,
    allowedColumns: readonly TColumn[],
): void {
    if (node.type === 'logical') {
        for (const condition of node.conditions) {
            assertAstPredicateColumnsAllowed(condition, allowedColumns);
        }

        return;
    }

    if (!allowedColumns.includes(node.column)) {
        throw new AstPredicateColumnNotAllowedError(node.column);
    }
}
