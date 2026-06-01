import {
    createAstPredicateDatabase,
    createAstPredicateExpressionBuilder,
    createAstPredicateWhere,
    resolveAstPredicateInput,
} from './ast-predicate.builders.js';
import {
    assertAstPredicateNode,
    assertAstPredicateRefsAllowed,
} from './ast-predicate.assertions.js';
import { isAstPredicateNode } from './ast-predicate.guards.js';
import {
    collectAstPredicateRefs,
    mapAstPredicateRefs,
} from './ast-predicate.utils.js';

import type {
    AstPredicateColumnRef,
    AstPredicateDatabase,
    AstPredicateDatabaseAliasMap,
    AstPredicateExpressionBuilder,
    AstPredicateExpressionFactory,
    AstPredicateNode,
} from './ast-predicate.types.js';

type AstPredicateStatic = {
    readonly expressionBuilder: <TTable extends object>() =>
        AstPredicateExpressionBuilder<AstPredicateColumnRef<TTable>>;

    readonly database: <
        TDB extends object,
        TAliases extends AstPredicateDatabaseAliasMap<TDB> = Record<
            never,
            never
        >,
    >() => AstPredicateDatabase<TDB, TAliases>;

    readonly where: <TTable extends object>(
        factory: AstPredicateExpressionFactory<AstPredicateColumnRef<TTable>>,
    ) => AstPredicateNode<AstPredicateColumnRef<TTable>>;

    readonly resolve: typeof resolveAstPredicateInput;

    readonly isNode: typeof isAstPredicateNode;
    readonly assertNode: typeof assertAstPredicateNode;
    readonly assertRefsAllowed: typeof assertAstPredicateRefsAllowed;
    readonly mapRefs: typeof mapAstPredicateRefs;
    readonly collectRefs: typeof collectAstPredicateRefs;
};

/**
 * Public entry point for creating typed predicate AST nodes.
 *
 * `ast-predicate` uses a Kysely-like expression-builder style:
 *
 * ```ts
 * type ArticleTable = {
 *     id: string;
 *     status: string;
 *     deletedAt: Date | null;
 * };
 *
 * const eb = AstPredicate.expressionBuilder<ArticleTable>();
 *
 * const predicate = eb.and([
 *     eb('deletedAt', 'is', null),
 *     eb('status', '=', 'PUBLISHED'),
 * ]);
 * ```
 *
 * For database-level expressions, use `AstPredicate.database<DB>()` to get
 * table-qualified refs:
 *
 * ```ts
 * type DB = {
 *     Article: {
 *         categoryId: string;
 *         workspaceId: string;
 *     };
 *     Category: {
 *         id: string;
 *         workspaceId: string;
 *     };
 * };
 *
 * const db = AstPredicate.database<DB>();
 *
 * const predicate = db.where(({ eb, and, ref }) =>
 *     and([
 *         eb('Article.categoryId', '=', ref('Category.id')),
 *         eb('Article.workspaceId', '=', ref('Category.workspaceId')),
 *     ]),
 * );
 * ```
 *
 * For table-scoped metadata, build predicates with the table builder first
 * and store the resulting AST node in the metadata object:
 *
 * ```ts
 * const articles = db.table('Article');
 *
 * const uniqueIndexes = articles.uniqueIndexes({
 *     slug_unique: {
 *         columns: ['workspaceId', 'categoryId', 'slug'],
 *         where: articles.where(({ eb }) =>
 *             eb('deletedAt', 'is', null),
 *         ),
 *     },
 * });
 * ```
 *
 * Optional aliases can be added type-only:
 *
 * ```ts
 * const db = AstPredicate.database<
 *     DB,
 *     {
 *         a: 'Article';
 *         c: 'Category';
 *     }
 * >();
 *
 * const predicate = db.where(({ eb, ref }) =>
 *     eb('a.categoryId', '=', ref('c.id')),
 * );
 * ```
 */
export const AstPredicate = {
    expressionBuilder: <TTable extends object>() =>
        createAstPredicateExpressionBuilder<AstPredicateColumnRef<TTable>>(),

    database: createAstPredicateDatabase,

    where: createAstPredicateWhere,

    resolve: resolveAstPredicateInput,

    isNode: isAstPredicateNode,
    assertNode: assertAstPredicateNode,
    assertRefsAllowed: assertAstPredicateRefsAllowed,
    mapRefs: mapAstPredicateRefs,
    collectRefs: collectAstPredicateRefs,
} as AstPredicateStatic;