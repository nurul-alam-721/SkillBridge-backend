

import { PaginationSortingResult } from "../interfaces";

export const paginationSortingHelper = (
  query: Record<string, unknown>
): PaginationSortingResult => {
  const page  = query.page  ? Number(query.page)  : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip  = (page - 1) * limit;

  const sortBy    = typeof query.sortBy === "string" ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";

  return { page, limit, skip, sortBy, sortOrder };
};