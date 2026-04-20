export type PaginationSortingResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
};
