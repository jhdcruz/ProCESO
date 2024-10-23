import type ApiResponse from '@/utils/response';
import type { Tables } from '../_database';

export interface StorageResponse extends ApiResponse {
  data?: Blob | Blob[];
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

export interface EventsViewResponse extends ApiResponse {
  data?: Tables<'events_details_view'>[];
}

export interface EventDetailsProps extends Tables<'events_details_view'> {
  users: Tables<'events_faculties_view'>[];
}

export interface EventDetailsResponse extends ApiResponse {
  data?: EventDetailsProps;
}

export interface EventFacultiesResponse extends ApiResponse {
  data?: Tables<'events_faculties_view'>[];
}

export interface EventFilesResponse extends ApiResponse {
  data?: Tables<'event_files'>[];
}

export interface SeriesResponse extends ApiResponse {
  data?: Tables<'series'>[];
}

export interface FacultyAssignmentsResponse extends ApiResponse {
  data?: Tables<'faculty_assignments'>[];
}

export interface SubscriptionsViewResponse extends ApiResponse {
  data?: Tables<'events_subscriptions_view'>[];
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
