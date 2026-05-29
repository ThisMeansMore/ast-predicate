import {
    and,
    eq,
    gt,
    gte,
    inArray,
    isNotNull,
    isNull,
    lt,
    lte,
    neq,
    notInArray,
    or,
} from './ast-predicate.builders.js';
import {
    assertAstPredicateColumnsAllowed,
    assertAstPredicateNode,
} from './ast-predicate.assertions.js';
import { isAstPredicateNode } from './ast-predicate.guards.js';
import {
    collectAstPredicateColumns,
    mapAstPredicateColumns,
} from './ast-predicate.utils.js';

import type {
    AstPredicateBuilder,
    AstPredicateColumnOf,
} from './ast-predicate.types.js';

function createAstPredicateForColumns<
    TColumn extends string,
>(): AstPredicateBuilder<TColumn> {
    return {
        and,
        or,
        eq,
        neq,
        gt,
        gte,
        lt,
        lte,
        inArray,
        notInArray,
        isNull,
        isNotNull,
    };
}

type AstPredicateStatic = {
    <TModel extends object>(): AstPredicateBuilder<AstPredicateColumnOf<TModel>>;

    readonly forColumns: <TColumn extends string>() => AstPredicateBuilder<TColumn>;

    readonly forModel: <TModel extends object>() => AstPredicateBuilder<
        AstPredicateColumnOf<TModel>
    >;

    readonly and: typeof and;
    readonly or: typeof or;
    readonly eq: typeof eq;
    readonly neq: typeof neq;
    readonly gt: typeof gt;
    readonly gte: typeof gte;
    readonly lt: typeof lt;
    readonly lte: typeof lte;
    readonly inArray: typeof inArray;
    readonly notInArray: typeof notInArray;
    readonly isNull: typeof isNull;
    readonly isNotNull: typeof isNotNull;
    readonly isNode: typeof isAstPredicateNode;
    readonly assertNode: typeof assertAstPredicateNode;
    readonly assertColumnsAllowed: typeof assertAstPredicateColumnsAllowed;
    readonly mapColumns: typeof mapAstPredicateColumns;
    readonly collectColumns: typeof collectAstPredicateColumns;
};

/**
 * Public builder and utility entry point for creating predicate AST nodes.
 *
 * The root object can be used directly when column names do not need to be
 * bound to a specific model:
 *
 * ```ts
 * const predicate = AstPredicate.and(
 *     AstPredicate.eq('status', 'ACTIVE'),
 *     AstPredicate.isNull('deletedAt'),
 * );
 * ```
 *
 * For column-name type safety, call `AstPredicate<TModel>()` and destructure
 * the returned model-bound builders:
 *
 * ```ts
 * type EditionTable = {
 *     code: string;
 *     TenantCode: string;
 *     ProductCode: string;
 *     deletedAt: Date | null;
 * };
 *
 * const { and, eq, isNull } = AstPredicate<EditionTable>();
 *
 * const predicate = and(
 *     eq('ProductCode', 'product-1'),
 *     isNull('deletedAt'),
 * );
 *
 * // Type error: "notExists" is not a key of EditionTable.
 * isNull('notExists');
 * ```
 *
 * The model-bound builder currently validates column names only. It does not
 * yet validate that comparison values match the exact property type of the
 * selected column.
 */
export const AstPredicate = Object.assign(
    <TModel extends object>() =>
        createAstPredicateForColumns<AstPredicateColumnOf<TModel>>(),
    {
        forColumns: createAstPredicateForColumns,

        forModel: <TModel extends object>() =>
            createAstPredicateForColumns<AstPredicateColumnOf<TModel>>(),

        and,
        or,
        eq,
        neq,
        gt,
        gte,
        lt,
        lte,
        inArray,
        notInArray,
        isNull,
        isNotNull,
        isNode: isAstPredicateNode,
        assertNode: assertAstPredicateNode,
        assertColumnsAllowed: assertAstPredicateColumnsAllowed,
        mapColumns: mapAstPredicateColumns,
        collectColumns: collectAstPredicateColumns,
    },
) as AstPredicateStatic;