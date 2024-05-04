import { Type } from "class-transformer";
import { Max, Min } from "class-validator";

export class PageableParams {
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  limit = 20;

  @Min(1)
  @Type(() => Number)
  page = 1;

  @Type(() => String)
  sort?: string;

  @Type(() => String)
  order?: SortOrder;

  @Type(() => String)
  filter?: string;
}

export class PageableData<T = any> {
  constructor(
    readonly items: T[],
    readonly totalCount: number,
    readonly currentPage: number,
    readonly pageSize: number
  ) {
  }
}

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}
