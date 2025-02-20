export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          created_by: string
          date_ending: string | null
          date_starting: string | null
          description: string | null
          feedback: boolean
          id: string
          image_url: string | null
          objectives: string[]
          outcomes: string[]
          series: string | null
          target: number | null
          title: string
          updated_at: string | null
          venue: number[] | null
          venue_additional: string | null
          visibility: Database["public"]["Enums"]["activity_visibility"]
        }
        Insert: {
          created_at?: string
          created_by?: string
          date_ending?: string | null
          date_starting?: string | null
          description?: string | null
          feedback?: boolean
          id?: string
          image_url?: string | null
          objectives?: string[]
          outcomes?: string[]
          series?: string | null
          target?: number | null
          title: string
          updated_at?: string | null
          venue?: number[] | null
          venue_additional?: string | null
          visibility?: Database["public"]["Enums"]["activity_visibility"]
        }
        Update: {
          created_at?: string
          created_by?: string
          date_ending?: string | null
          date_starting?: string | null
          description?: string | null
          feedback?: boolean
          id?: string
          image_url?: string | null
          objectives?: string[]
          outcomes?: string[]
          series?: string | null
          target?: number | null
          title?: string
          updated_at?: string | null
          venue?: number[] | null
          venue_additional?: string | null
          visibility?: Database["public"]["Enums"]["activity_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["referrer_id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "activities_subscriptions_view"
            referencedColumns: ["subscriber_id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_series_fkey"
            columns: ["series"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_feedback: {
        Row: {
          activity_id: string
          id: string
          response: Json
          score_emotions: Json | null
          score_ratings: number | null
          score_sentiment: Json | null
          submitted_at: string
          type: Database["public"]["Enums"]["feedback_type"]
          user_id: string | null
        }
        Insert: {
          activity_id: string
          id?: string
          response: Json
          score_emotions?: Json | null
          score_ratings?: number | null
          score_sentiment?: Json | null
          submitted_at?: string
          type: Database["public"]["Enums"]["feedback_type"]
          user_id?: string | null
        }
        Update: {
          activity_id?: string
          id?: string
          response?: Json
          score_emotions?: Json | null
          score_ratings?: number | null
          score_sentiment?: Json | null
          submitted_at?: string
          type?: Database["public"]["Enums"]["feedback_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_feedback_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feedback_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_details_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feedback_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "activity_feedback_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_subscriptions_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "activity_feedback_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activitiesdetails_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["referrer_id"]
          },
          {
            foreignKeyName: "activity_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "activities_subscriptions_view"
            referencedColumns: ["subscriber_id"]
          },
          {
            foreignKeyName: "activity_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_files: {
        Row: {
          activity: string
          checksum: string
          encrypted_checksum: string | null
          id: string
          key: string | null
          name: string
          type: string
          uploaded_at: string
        }
        Insert: {
          activity?: string
          checksum?: string
          encrypted_checksum?: string | null
          id?: string
          key?: string | null
          name?: string
          type?: string
          uploaded_at?: string
        }
        Update: {
          activity?: string
          checksum?: string
          encrypted_checksum?: string | null
          id?: string
          key?: string | null
          name?: string
          type?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_files_event_fkey"
            columns: ["activity"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_files_event_fkey"
            columns: ["activity"]
            isOneToOne: false
            referencedRelation: "activities_details_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_files_event_fkey"
            columns: ["activity"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "event_files_event_fkey"
            columns: ["activity"]
            isOneToOne: false
            referencedRelation: "activities_subscriptions_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "event_files_event_fkey"
            columns: ["activity"]
            isOneToOne: false
            referencedRelation: "activitiesdetails_view"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_subscriptions: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_event_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_event_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_details_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_event_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "participants_event_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_subscriptions_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "participants_event_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activitiesdetails_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["referrer_id"]
          },
          {
            foreignKeyName: "participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "activities_subscriptions_view"
            referencedColumns: ["subscriber_id"]
          },
          {
            foreignKeyName: "participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      allowed_domains: {
        Row: {
          domain: string
        }
        Insert: {
          domain: string
        }
        Update: {
          domain?: string
        }
        Relationships: []
      }
      analytics_metadata: {
        Row: {
          activity_id: string
          content: string | null
          id: number
          type: string
          updated_at: string
        }
        Insert: {
          activity_id: string
          content?: string | null
          id?: number
          type: string
          updated_at?: string
        }
        Update: {
          activity_id?: string
          content?: string | null
          id?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_metadata_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_metadata_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_details_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_metadata_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "analytics_metadata_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_subscriptions_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "analytics_metadata_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activitiesdetails_view"
            referencedColumns: ["id"]
          },
        ]
      }
      certs: {
        Row: {
          activity_id: string | null
          created_at: string
          generated_by: string | null
          hash: string | null
          id: string
          recipient_email: string | null
          recipient_name: string | null
          url: string | null
        }
        Insert: {
          activity_id?: string | null
          created_at?: string
          generated_by?: string | null
          hash?: string | null
          id?: string
          recipient_email?: string | null
          recipient_name?: string | null
          url?: string | null
        }
        Update: {
          activity_id?: string | null
          created_at?: string
          generated_by?: string | null
          hash?: string | null
          id?: string
          recipient_email?: string | null
          recipient_name?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certs_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certs_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_details_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certs_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "certs_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_subscriptions_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "certs_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activitiesdetails_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certs_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certs_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["referrer_id"]
          },
          {
            foreignKeyName: "certs_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "activities_subscriptions_view"
            referencedColumns: ["subscriber_id"]
          },
          {
            foreignKeyName: "certs_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_assignments: {
        Row: {
          activity_id: string | null
          created_at: string
          id: number
          referrer: string | null
          rsvp: boolean | null
          rsvp_comments: string | null
          user_id: string | null
        }
        Insert: {
          activity_id?: string | null
          created_at?: string
          id?: number
          referrer?: string | null
          rsvp?: boolean | null
          rsvp_comments?: string | null
          user_id?: string | null
        }
        Update: {
          activity_id?: string | null
          created_at?: string
          id?: number
          referrer?: string | null
          rsvp?: boolean | null
          rsvp_comments?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_handlers_event_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_handlers_event_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_details_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_handlers_event_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "event_handlers_event_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_subscriptions_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "event_handlers_event_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activitiesdetails_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_handlers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_handlers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["referrer_id"]
          },
          {
            foreignKeyName: "event_handlers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "activities_subscriptions_view"
            referencedColumns: ["subscriber_id"]
          },
          {
            foreignKeyName: "event_handlers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_assignments_referrer_fkey"
            columns: ["referrer"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_assignments_referrer_fkey"
            columns: ["referrer"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["referrer_id"]
          },
          {
            foreignKeyName: "faculty_assignments_referrer_fkey"
            columns: ["referrer"]
            isOneToOne: false
            referencedRelation: "activities_subscriptions_view"
            referencedColumns: ["subscriber_id"]
          },
          {
            foreignKeyName: "faculty_assignments_referrer_fkey"
            columns: ["referrer"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      series: {
        Row: {
          color: string | null
          created_at: string
          id: string
          title: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string
          department: Database["public"]["Enums"]["roles_dept"] | null
          email: string
          id: string
          name: string | null
          other_roles: Database["public"]["Enums"]["roles_pos"][] | null
          role: Database["public"]["Enums"]["roles_user"] | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["roles_dept"] | null
          email: string
          id?: string
          name?: string | null
          other_roles?: Database["public"]["Enums"]["roles_pos"][] | null
          role?: Database["public"]["Enums"]["roles_user"] | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["roles_dept"] | null
          email?: string
          id?: string
          name?: string | null
          other_roles?: Database["public"]["Enums"]["roles_pos"][] | null
          role?: Database["public"]["Enums"]["roles_user"] | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      activities_details_view: {
        Row: {
          created_at: string | null
          created_by: string | null
          creator_avatar: string | null
          creator_department: Database["public"]["Enums"]["roles_dept"] | null
          creator_email: string | null
          creator_other_roles: Database["public"]["Enums"]["roles_pos"][] | null
          creator_role: Database["public"]["Enums"]["roles_user"] | null
          date_ending: string | null
          date_starting: string | null
          description: string | null
          feedback: boolean | null
          id: string | null
          image_url: string | null
          objectives: string[] | null
          outcomes: string[] | null
          series: string | null
          series_color: string | null
          target: number | null
          title: string | null
          updated_at: string | null
          venue: number[] | null
          venue_additional: string | null
          visibility: Database["public"]["Enums"]["activity_visibility"] | null
        }
        Relationships: []
      }
      activities_faculties_view: {
        Row: {
          active: boolean | null
          activity_id: string | null
          avatar_url: string | null
          department: Database["public"]["Enums"]["roles_dept"] | null
          email: string | null
          id: string | null
          name: string | null
          other_roles: Database["public"]["Enums"]["roles_pos"][] | null
          referrer_avatar: string | null
          referrer_department: Database["public"]["Enums"]["roles_dept"] | null
          referrer_email: string | null
          referrer_id: string | null
          referrer_name: string | null
          referrer_other_roles:
            | Database["public"]["Enums"]["roles_pos"][]
            | null
          referrer_role: Database["public"]["Enums"]["roles_user"] | null
          role: Database["public"]["Enums"]["roles_user"] | null
          rsvp: boolean | null
        }
        Relationships: []
      }
      activities_subscriptions_view: {
        Row: {
          activity_id: string | null
          subscriber_avatar: string | null
          subscriber_email: string | null
          subscriber_id: string | null
          subscriber_name: string | null
        }
        Relationships: []
      }
      activitiesdetails_view: {
        Row: {
          created_at: string | null
          created_by: string | null
          creator_avatar: string | null
          creator_department: Database["public"]["Enums"]["roles_dept"] | null
          creator_email: string | null
          creator_other_roles: Database["public"]["Enums"]["roles_pos"][] | null
          creator_role: Database["public"]["Enums"]["roles_user"] | null
          date_ending: string | null
          date_starting: string | null
          description: string | null
          feedback: boolean | null
          id: string | null
          image_url: string | null
          objectives: string[] | null
          outcomes: string[] | null
          series: string | null
          series_color: string | null
          target: number | null
          title: string | null
          updated_at: string | null
          venue: number[] | null
          venue_additional: string | null
          visibility: Database["public"]["Enums"]["activity_visibility"] | null
        }
        Relationships: []
      }
      activity_eval_view: {
        Row: {
          email: string | null
          emotion_labels: string | null
          name: string | null
          rating_max: number | null
          rating_score: number | null
          sentiment_negative: number | null
          sentiment_neutral: number | null
          sentiment_positive: number | null
          submitted_at: string | null
          title: string | null
          type: Database["public"]["Enums"]["feedback_type"] | null
        }
        Relationships: []
      }
      activity_feedback_view: {
        Row: {
          activity_id: string | null
          max_ratings: number | null
          score_emotions: Json | null
          score_ratings: number | null
          score_sentiment: Json | null
          type: Database["public"]["Enums"]["feedback_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_feedback_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feedback_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_details_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feedback_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_faculties_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "activity_feedback_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_subscriptions_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "activity_feedback_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activitiesdetails_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_visibility: "Everyone" | "Faculty" | "Internal"
      feedback_type: "partners" | "implementers" | "beneficiaries"
      roles_dept: "ccs" | "cea" | "cbe" | "coa" | "ceso" | "na" | "itso"
      roles_pos: "head" | "dean" | "chair"
      roles_user: "admin" | "staff" | "faculty" | "officer" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
