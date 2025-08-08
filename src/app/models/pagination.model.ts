// src/app/models/pagination.model.ts

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
}

export interface PageRequest {
  page: number;
  size: number;
  sort?: string[];
}