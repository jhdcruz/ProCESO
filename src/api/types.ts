import { Tables } from '@/utils/supabase/types';

/**
 * Response which can then be used to display notifications.
 */
export interface ApiResponse {
  // 0 for success, 1 for warning, 2 for error
  status: 0 | 1 | 2;
  title: string;
  message: string;
  data?: any;
}

export interface CountResponse extends ApiResponse {
  data?: number | null;
}

export interface UserResponse extends ApiResponse {
  data?: Tables<'users'>;
}

export interface UsersResponse extends ApiResponse {
  data?: Tables<'users'>[];
}

export interface EventResponse extends ApiResponse {
  data?: Tables<'events'>[];
}

export interface SeriesResponse extends ApiResponse {
  data?: Tables<'series'>[];
}

export interface FacultyAssignmentsResponse extends ApiResponse {
  data?: Tables<'faculty_assignments'>[];
}

// Referenced tables
export interface FacultyConflictsResponse extends ApiResponse {
  data?: {
    faculty_assignments:
      | {
          user_id: string | null;
        }[]
      | null;
  }[];
}

export interface EventDetailsProps extends Partial<Tables<'events'>> {
  users: Partial<Tables<'users'>> | null;
}
