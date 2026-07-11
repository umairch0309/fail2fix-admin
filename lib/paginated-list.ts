import type { PaginatedResponse } from "@/lib/api-client";
import { isPaginatedResult, unwrapListData } from "@/lib/api-client";

export const DEFAULT_PAGE_SIZE = 20;

/** Stable empty array — avoids infinite re-renders from `?? []` in list pages. */
export const EMPTY_LIST_ITEMS: never[] = [];

export function normalizePaginatedList<T>(
  data: T[] | PaginatedResponse<T> | undefined,
  page: number,
  limit: number = DEFAULT_PAGE_SIZE,
): { items: T[]; pagination: PaginatedResponse<T>["pagination"] } {
  if (!data) {
    return {
      items: EMPTY_LIST_ITEMS as T[],
      pagination: { page, limit, total: 0, totalPages: 1 },
    };
  }

  if (isPaginatedResult(data)) {
    return { items: data.items, pagination: data.pagination };
  }

  const items = unwrapListData(data);
  return {
    items,
    pagination: {
      page: 1,
      limit: items.length || limit,
      total: items.length,
      totalPages: 1,
    },
  };
}

function rangeFiltersEqual(
  a: Record<string, [number, number]>,
  b: Record<string, [number, number]>,
): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every(
    (key) => a[key]?.[0] === b[key]?.[0] && a[key]?.[1] === b[key]?.[1],
  );
}

export function buildInitialRangeFilters(
  filters: Array<{ key: string; type?: string; min?: number; max?: number }>,
): Record<string, [number, number]> {
  const initial: Record<string, [number, number]> = {};
  for (const filter of filters) {
    if (filter.type === "range" && filter.min !== undefined && filter.max !== undefined) {
      initial[filter.key] = [filter.min, filter.max];
    }
  }
  return initial;
}

export function syncRangeFilters(
  prev: Record<string, [number, number]>,
  filters: Array<{ key: string; type?: string; min?: number; max?: number }>,
): Record<string, [number, number]> {
  const next = buildInitialRangeFilters(filters);
  return rangeFiltersEqual(prev, next) ? prev : next;
}
