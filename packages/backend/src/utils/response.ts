import { ApiResponse, SuccessResponse, ErrorResponse, PaginatedResponse, PaginationInfo, DEFAULT_PAGE_SIZE } from '@personal-assistant/types';

export function success<T>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

export function error(message: string): ErrorResponse {
  return {
    success: false,
    error: message,
  };
}

export function paginated<T>(
  data: T[],
  page: number,
  total: number,
  pageSize: number = DEFAULT_PAGE_SIZE
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / pageSize);
  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function getPaginationOffset(page: number, pageSize: number = DEFAULT_PAGE_SIZE): number {
  return (page - 1) * pageSize;
}

export type { ApiResponse, SuccessResponse, ErrorResponse, PaginatedResponse, PaginationInfo };
