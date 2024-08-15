/**
 * Response which can then be used to display notifications.
 */
export interface ApiResponse {
  status: 0 | 1 | 2; // 0 for success, 1 for warning, 2 for error
  title: string;
  message: string;
  data?: any;
}
