import type {
    AstPredicateComparisonNode,
    AstPredicateLogicalNode,
    AstPredicateNode,
} from './ast-predicate.types.js';

export function mapAstPredicateColumns<
    TInputColumn extends string,
    TOutputColumn extends string,
>(
    node: AstPredicateNode<TInputColumn>,
    mapper: (column: TInputColumn) => TOutputColumn,
): AstPredicateNode<TOutputColumn> {
    if (node.type === 'logical') {
        return {
            ...node,
            conditions: node.conditions.map((condition) =>
                mapAstPredicateColumns(condition, mapper),
            ),
        } satisfies AstPredicateLogicalNode<TOutputColumn>;
    }

    return {
        ...node,
        column: mapper(node.column),
    } satisfies AstPredicateComparisonNode<TOutputColumn>;
}

export function collectAstPredicateColumns<TColumn extends string>(
    node: AstPredicateNode<TColumn>,
): TColumn[] {
    if (node.type === 'logical') {
        return node.conditions.flatMap(collectAstPredicateColumns);
    }

    return [node.column];
}
