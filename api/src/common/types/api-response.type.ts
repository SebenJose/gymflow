export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiErrorBody = {
  statusCode: number;
  message: string;
  details?: string[];
  path: string;
  timestamp: string;
};

export type ApiErrorResponse = {
  success: false;
  error: ApiErrorBody;
};
