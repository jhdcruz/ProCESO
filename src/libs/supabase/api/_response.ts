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

export interface ActivityResponse extends ApiResponse {
  data?: Tables<'activities'>[];
}

export interface ActivitiesViewResponse extends ApiResponse {
  data?: Tables<'activities_details_view'>[];
}

export interface ActivityDetailsProps
  extends Tables<'activities_details_view'> {
  users: Tables<'activities_faculties_view'>[];
}

export interface ActivityDetailsResponse extends ApiResponse {
  data?: ActivityDetailsProps;
}

export interface ActivityFacultiesResponse extends ApiResponse {
  data?: Tables<'activities_faculties_view'>[];
}

export interface ActivityFilesResponse extends ApiResponse {
  data?: Tables<'activity_files'>[];
}

export interface SeriesResponse extends ApiResponse {
  data?: Tables<'series'>[];
}

export interface FacultyAssignmentsResponse extends ApiResponse {
  data?: Tables<'faculty_assignments'>[];
}

export interface SubscriptionsViewResponse extends ApiResponse {
  data?: Tables<'activities_subscriptions_view'>[];
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
