import { Type } from "class-transformer";
import { Max, Min } from "class-validator";

/**
 * A class that defines the parameters for pagination.
 */
export class PageableParams {
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  /**
   * The maximum number of items to return per page.
   * @type {number}
   * @default 20
   */
  limit = 20;

  @Min(1)
  @Type(() => Number)
  /**
   * The page number to return.
   * @type {number}
   * @default 1
   */
  page = 1;

  @Type(() => String)
  /**
   * The field by which to sort the items.
   * @type {string}
   * @optional
   */
  sort?: string;

  @Type(() => String)
  /**
   * The order in which to sort the items.
   * @type {SortOrder}
   * @optional
   */
  order?: SortOrder;

  @Type(() => String)
  /**
   * The filter criteria to apply to the items.
   * @type {string}
   * @optional
   */
  filter?: string;
}

/**
 * A class that represents paginated data.
 * @template T - The type of items in the paginated data.
 */
export class PageableData<T = any> {
  /**
   * Creates an instance of PageableData.
   * @param {T[]} items - The items for the current page.
   * @param {number} totalCount - The total number of items available.
   * @param {number} currentPage - The current page number.
   * @param {number} pageSize - The number of items per page.
   */
  constructor(
    readonly items: T[],
    readonly totalCount: number,
    readonly currentPage: number,
    readonly pageSize: number,
  ) {}
}

/**
 * @enum SortOrder
 * Enumeration for the sort order.
 */
export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}
