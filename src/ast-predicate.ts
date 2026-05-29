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

export const AstPredicate = {
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
} as const;
