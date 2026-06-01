import { isAstPredicateNode } from './ast-predicate.guards.js';

import type {
    AstPredicateNode,
    AstPredicateOperand,
} from './ast-predicate.types.js';

export class InvalidAstPredicateNodeError extends Error {
    constructor() {
        super('Invalid AST predicate node.');
        this.name = 'InvalidAstPredicateNodeError';
    }
}

export class AstPredicateRefNotAllowedError extends Error {
    constructor(ref: string) {
        super(`AST predicate ref "${ref}" is not allowed.`);
        this.name = 'AstPredicateRefNotAllowedError';
    }
}

export function assertAstPredicateNode<TRef extends string = string>(
    value: unknown,
): asserts value is AstPredicateNode<TRef> {
    if (!isAstPredicateNode<TRef>(value)) {
        throw new InvalidAstPredicateNodeError();
    }
}

export function assertAstPredicateRefsAllowed<TRef extends string>(
    node: AstPredicateNode<TRef>,
    allowedRefs: readonly TRef[],
): void {
    if (node.type === 'logical') {
        for (const childNode of node.nodes) {
            assertAstPredicateRefsAllowed(childNode, allowedRefs);
        }

        return;
    }

    if (node.type === 'unary') {
        assertAstPredicateRefsAllowed(node.node, allowedRefs);

        return;
    }

    assertOperandRefAllowed(node.left, allowedRefs);
    assertOperandRefAllowed(node.right, allowedRefs);
}

function assertOperandRefAllowed<TRef extends string>(
    operand: AstPredicateOperand<TRef>,
    allowedRefs: readonly TRef[],
): void {
    if (operand.type !== 'ref') {
        return;
    }

    if (!allowedRefs.includes(operand.ref)) {
        throw new AstPredicateRefNotAllowedError(operand.ref);
    }
}