import { Filters } from '.';

/**
 * 合并多个Filters
 */
export function mergeFilters(...filters: Filters[]): Filters | null;

export function deepClone<T extends any>(target: T, src: T): T;
