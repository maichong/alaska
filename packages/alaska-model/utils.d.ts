import { Filters, Model } from '.';

/**
 * 合并多个Filters
 */
export function mergeFilters(...filters: Filters[]): Filters | null;

/**
 * 深度克隆对象
 * @param {Object} target 目标对象
 * @param {Object} src 原始对象
 * @returns {Object}
 */
export function deepClone<T extends any>(target: T, src: T): T;

/**
 * 获取记录的字符串ID
 * @param {Model|string|any} record
 * @return {string}
 */
export function getId(record: Model | any): string;

/**
 * 判断两个记录的ID是否相同
 * @param {Model|string|any} a 记录A
 * @param {Model|string|any} b 记录B
 * @return {boolean}
 */
export function isIdEqual(a: any, b: any): boolean;
