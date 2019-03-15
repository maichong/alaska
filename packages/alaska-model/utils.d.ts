import { Filters, Model, RecordId } from '.';

/**
 * 合并多个Filters
 */
export function mergeFilters(...filters: Filters[]): Filters | null;

/**
 * 将普通Filters转换为Aggregation Match
 * @param {object} filters
 */
export function filtersToMatch(filters: any): any;

/**
 * 深度克隆对象
 * @param {object} target 目标对象
 * @param {object} src 原始对象
 * @returns {object}
 */
export function deepClone<T extends any>(target: T, src: T): T;

/**
 * 获取记录的字符串ID
 * @param {Model|string|any} record
 * @return {string}
 */
export function getId(record: Model | RecordId): string;

/**
 * 判断两个记录的ID是否相同
 * @param {Model|string|any} a 记录A
 * @param {Model|string|any} b 记录B
 * @return {boolean}
 */
export function isIdEqual(a: Model | RecordId, b: Model | RecordId): boolean;
