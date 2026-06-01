import type {
    AstPredicateBinaryNode,
    AstPredicateLogicalNode,
    AstPredicateNode,
    AstPredicateOperand,
    AstPredicateRefOperand,
    AstPredicateUnaryNode,
} from './ast-predicate.types.js';

export function mapAstPredicateRefs<
    TInputRef extends string,
    TOutputRef extends string,
>(
    node: AstPredicateNode<TInputRef>,
    mapper: (ref: TInputRef) => TOutputRef,
): AstPredicateNode<TOutputRef> {
    if (node.type === 'logical') {
        return {
            ...node,
            nodes: node.nodes.map((childNode) =>
                mapAstPredicateRefs(childNode, mapper),
            ),
        } satisfies AstPredicateLogicalNode<TOutputRef>;
    }

    if (node.type === 'unary') {
        return {
            ...node,
            node: mapAstPredicateRefs(node.node, mapper),
        } satisfies AstPredicateUnaryNode<TOutputRef>;
    }

    return {
        ...node,
        left: mapAstPredicateRefOperand(node.left, mapper),
        right: mapAstPredicateOperandRef(node.right, mapper),
    } satisfies AstPredicateBinaryNode<TOutputRef>;
}

export function collectAstPredicateRefs<TRef extends string>(
    node: AstPredicateNode<TRef>,
): TRef[] {
    if (node.type === 'logical') {
        return node.nodes.flatMap(collectAstPredicateRefs);
    }

    if (node.type === 'unary') {
        return collectAstPredicateRefs(node.node);
    }

    return [
        node.left.ref,
        ...collectAstPredicateOperandRefs(node.right),
    ];
}

function mapAstPredicateRefOperand<
    TInputRef extends string,
    TOutputRef extends string,
>(
    operand: AstPredicateRefOperand<TInputRef>,
    mapper: (ref: TInputRef) => TOutputRef,
): AstPredicateRefOperand<TOutputRef> {
    return {
        ...operand,
        ref: mapper(operand.ref),
    };
}

function mapAstPredicateOperandRef<
    TInputRef extends string,
    TOutputRef extends string,
>(
    operand: AstPredicateOperand<TInputRef>,
    mapper: (ref: TInputRef) => TOutputRef,
): AstPredicateOperand<TOutputRef> {
    if (operand.type === 'value') {
        return operand;
    }

    return mapAstPredicateRefOperand(operand, mapper);
}

function collectAstPredicateOperandRefs<TRef extends string>(
    operand: AstPredicateOperand<TRef>,
): TRef[] {
    if (operand.type === 'value') {
        return [];
    }

    return [operand.ref];
}