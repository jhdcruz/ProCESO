/**
 * Response interface which can then be used
 * to display notifications using mantine.
 */
export default interface ApiResponse {
  // 0 for success, 1 for warning, 2 for error
  status: 0 | 1 | 2;
  title: string;
  message: string;
  data?: any;
  count?: number;
}
