import type ApiResponse from '@/utils/response';
import type { Tables } from '../_database';

export interface UserResponse extends ApiResponse {
  data?: Tables<'users'>;
}

export interface UsersResponse extends ApiResponse {
  data?: Tables<'users'>[];
}

export interface EventResponse extends ApiResponse {
  data?: Tables<'events'>[];
}

export interface EventDetailsProps
  extends Partial<Tables<'events_details_view'>> {
  users: Tables<'events_faculties_view'>[] | null;
}

export interface EventDetailsResponse extends ApiResponse {
  data?: EventDetailsProps;
}

export interface EventFacultiesResponse extends ApiResponse {
  data?: Tables<'events_faculties_view'>[];
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
