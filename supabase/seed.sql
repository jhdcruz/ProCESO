

SET statement_timeout = 10;
SET lock_timeout = 6;
SET idle_in_transaction_session_timeout = 10;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', true);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = on;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "intarray" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."activity_visibility" AS ENUM (
    'Everyone',
    'Faculty',
    'Internal'
);


ALTER TYPE "public"."activity_visibility" OWNER TO "postgres";


CREATE TYPE "public"."feedback_type" AS ENUM (
    'partners',
    'implementers',
    'beneficiaries'
);


ALTER TYPE "public"."feedback_type" OWNER TO "postgres";


CREATE TYPE "public"."roles_dept" AS ENUM (
    'ccs',
    'cea',
    'cbe',
    'coa',
    'ceso',
    'na',
    'itso'
);


ALTER TYPE "public"."roles_dept" OWNER TO "postgres";


CREATE TYPE "public"."roles_pos" AS ENUM (
    'head',
    'dean',
    'chair'
);


ALTER TYPE "public"."roles_pos" OWNER TO "postgres";


CREATE TYPE "public"."roles_user" AS ENUM (
    'admin',
    'staff',
    'faculty',
    'officer',
    'student'
);


ALTER TYPE "public"."roles_user" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_linked_activity_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Delete from activity_subscriptions
    DELETE FROM public.activity_subscriptions
    WHERE activity_id = OLD.id;

    -- Delete from faculty_assignments
    DELETE FROM public.faculty_assignments
    WHERE activity_id = OLD.id;

    -- Delete from activity_files
    DELETE FROM public.activity_files
    WHERE activity = OLD.id;

    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."delete_linked_activity_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$BEGIN
    RAISE LOG 'Role: %, Dept: %, Pos: %',
    NEW.raw_user_meta_data ->> 'role',
    NEW.raw_user_meta_data ->> 'dept',
    NEW.raw_user_meta_data ->> 'pos';

    INSERT INTO public.users (
        id,
        email,
        name,
        avatar_url,
        active,
        role,
        department,
        other_roles
    ) VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'name',
        NEW.raw_user_meta_data ->> 'avatar_url',
        TRUE,
        (NEW.raw_user_meta_data ->> 'role')::public.roles_user,
        (NEW.raw_user_meta_data ->> 'dept')::public.roles_dept,
       CASE 
            WHEN NEW.raw_user_meta_data -> 'pos' IS NULL 
                 OR NEW.raw_user_meta_data -> 'pos' = '[]' THEN ARRAY[]::public.roles_pos[]
            ELSE (SELECT ARRAY(SELECT elem::public.roles_pos 
                               FROM jsonb_array_elements_text(NEW.raw_user_meta_data -> 'pos') AS elem))
        END
    );

    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_raw_app_meta_data"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        UPDATE auth.users
        SET raw_app_meta_data = jsonb_set(raw_app_meta_data, '{role}', to_jsonb(NEW.role::text))
        WHERE id = NEW.id;
    END IF;

    IF OLD.active IS DISTINCT FROM NEW.active THEN
        UPDATE auth.users
        SET raw_app_meta_data = jsonb_set(raw_app_meta_data, '{active}', to_jsonb(NEW.active::boolean))
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_raw_app_meta_data"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "visibility" "public"."activity_visibility" DEFAULT 'Everyone'::"public"."activity_visibility" NOT NULL,
    "date_starting" timestamp with time zone,
    "date_ending" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "series" "uuid",
    "image_url" "text",
    "objectives" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "feedback" boolean DEFAULT false NOT NULL,
    "outcomes" "text"[] DEFAULT '{"''Key Outcomes''","''Impact on Community''","''Success Indicators''","''Overall Achievement Level''"}'::"text"[] NOT NULL,
    "venue" double precision[],
    "venue_additional" "text"
);


ALTER TABLE "public"."activities" OWNER TO "postgres";


COMMENT ON COLUMN "public"."activities"."objectives" IS 'Event objectives and goals (for feedback)';



COMMENT ON COLUMN "public"."activities"."feedback" IS 'Whether activity is open for feedback responses.';



COMMENT ON COLUMN "public"."activities"."outcomes" IS 'Activity outcomes for feedback';



COMMENT ON COLUMN "public"."activities"."venue_additional" IS 'Additional venue info or address';



CREATE TABLE IF NOT EXISTS "public"."series" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "color" "text",
    CONSTRAINT "series_color_check" CHECK (("length"("color") <= 10))
);


ALTER TABLE "public"."series" OWNER TO "postgres";


COMMENT ON TABLE "public"."series" IS 'Event grouping for organization and historical tracking.';



COMMENT ON COLUMN "public"."series"."color" IS 'Hexadecimal color string that defines/categories the event series.';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" DEFAULT 'Unverified User'::"text",
    "avatar_url" "text" DEFAULT ''::"text",
    "role" "public"."roles_user" DEFAULT 'student'::"public"."roles_user",
    "active" boolean DEFAULT true NOT NULL,
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "department" "public"."roles_dept" DEFAULT 'na'::"public"."roles_dept",
    "other_roles" "public"."roles_pos"[]
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'Mixed collections of user from auth.users.';



CREATE OR REPLACE VIEW "public"."activities_details_view" WITH ("security_invoker"='on') AS
 SELECT "activities"."id",
    "activities"."title",
    "activities"."description",
    "activities"."venue",
    "activities"."venue_additional",
    "series"."title" AS "series",
    "series"."color" AS "series_color",
    "activities"."visibility",
    "activities"."image_url",
    "activities"."date_starting",
    "activities"."date_ending",
    "activities"."created_at",
    "activities"."updated_at",
    "activities"."feedback",
    "activities"."objectives",
    "activities"."outcomes",
    "users"."name" AS "created_by",
    "users"."email" AS "creator_email",
    "users"."role" AS "creator_role",
    "users"."department" AS "creator_department",
    "users"."other_roles" AS "creator_other_roles",
    "users"."avatar_url" AS "creator_avatar"
   FROM (("public"."activities"
     LEFT JOIN "public"."users" ON (("activities"."created_by" = "users"."id")))
     LEFT JOIN "public"."series" ON (("activities"."series" = "series"."id")));


ALTER TABLE "public"."activities_details_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."faculty_assignments" (
    "id" bigint NOT NULL,
    "activity_id" "uuid",
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "referrer" "uuid" DEFAULT "auth"."uid"(),
    "rsvp" boolean
);


ALTER TABLE "public"."faculty_assignments" OWNER TO "postgres";


COMMENT ON TABLE "public"."faculty_assignments" IS 'Track who is/are assigned to a particular event.';



COMMENT ON COLUMN "public"."faculty_assignments"."rsvp" IS 'Whether a faculty has accepted the assignment.';



CREATE OR REPLACE VIEW "public"."activities_faculties_view" WITH ("security_invoker"='on') AS
 SELECT "activities"."id" AS "activity_id",
    "users"."id",
    "users"."email",
    "users"."name",
    "users"."avatar_url",
    "users"."role",
    "users"."active",
    "users"."department",
    "users"."other_roles",
    "faculty_assignments"."rsvp",
    "ref"."id" AS "referrer_id",
    "ref"."email" AS "referrer_email",
    "ref"."name" AS "referrer_name",
    "ref"."avatar_url" AS "referrer_avatar",
    "ref"."role" AS "referrer_role",
    "ref"."department" AS "referrer_department",
    "ref"."other_roles" AS "referrer_other_roles"
   FROM ((("public"."faculty_assignments"
     LEFT JOIN "public"."activities" ON (("activities"."id" = "faculty_assignments"."activity_id")))
     LEFT JOIN "public"."users" ON (("users"."id" = "faculty_assignments"."user_id")))
     LEFT JOIN "public"."users" "ref" ON (("ref"."id" = "faculty_assignments"."referrer")));


ALTER TABLE "public"."activities_faculties_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activity_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "activity_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."activity_subscriptions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."activities_subscriptions_view" WITH ("security_invoker"='on') AS
 SELECT "activities"."id" AS "activity_id",
    "users"."id" AS "subscriber_id",
    "users"."name" AS "subscriber_name",
    "users"."email" AS "subscriber_email",
    "users"."avatar_url" AS "subscriber_avatar"
   FROM (("public"."activity_subscriptions"
     LEFT JOIN "public"."activities" ON (("activities"."id" = "activity_subscriptions"."activity_id")))
     LEFT JOIN "public"."users" ON (("users"."id" = "activity_subscriptions"."user_id")));


ALTER TABLE "public"."activities_subscriptions_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activity_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "activity_id" "uuid" NOT NULL,
    "response" "jsonb" NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "type" "public"."feedback_type" NOT NULL,
    "score_emotions" "jsonb",
    "score_sentiment" "jsonb",
    "score_ratings" smallint
);


ALTER TABLE "public"."activity_feedback" OWNER TO "postgres";


COMMENT ON TABLE "public"."activity_feedback" IS 'Feedback responses from an activity.';



COMMENT ON COLUMN "public"."activity_feedback"."type" IS 'Type of feedback';



COMMENT ON COLUMN "public"."activity_feedback"."score_emotions" IS 'Sentiment score based on emotions';



COMMENT ON COLUMN "public"."activity_feedback"."score_sentiment" IS 'Sentiment analysis (positive, neutral, and negative)';



COMMENT ON COLUMN "public"."activity_feedback"."score_ratings" IS 'Total score for rating fields (1-6)';



CREATE OR REPLACE VIEW "public"."activity_eval_view" WITH ("security_invoker"='on') AS
 SELECT "activities"."title",
    "activity_feedback"."type",
    (("activity_feedback"."response" -> 'respondent'::"text") ->> 'name'::"text") AS "name",
    (("activity_feedback"."response" -> 'respondent'::"text") ->> 'email'::"text") AS "email",
    (("activity_feedback"."score_sentiment" ->> 'positive'::"text"))::double precision AS "sentiment_positive",
    (("activity_feedback"."score_sentiment" ->> 'neutral'::"text"))::double precision AS "sentiment_neutral",
    (("activity_feedback"."score_sentiment" ->> 'negative'::"text"))::double precision AS "sentiment_negative",
    "activity_feedback"."score_ratings" AS "rating_score",
        CASE
            WHEN ("activity_feedback"."type" = 'partners'::"public"."feedback_type") THEN (72)::bigint
            WHEN ("activity_feedback"."type" = 'implementers'::"public"."feedback_type") THEN (102)::bigint
            WHEN ("activity_feedback"."type" = 'beneficiaries'::"public"."feedback_type") THEN (48)::bigint
            ELSE (0)::bigint
        END AS "rating_max",
    "string_agg"(("emotions"."value" ->> 'label'::"text"), ' '::"text") AS "emotion_labels"
   FROM ("public"."activity_feedback"
     LEFT JOIN "public"."activities" ON (("activity_feedback"."activity_id" = "activities"."id"))),
    LATERAL "jsonb_array_elements"(("activity_feedback"."score_emotions" -> 'emotions'::"text")) "emotions"("value")
  GROUP BY "activities"."title", "activity_feedback"."type", "activity_feedback"."response", "activity_feedback"."score_sentiment", "activity_feedback"."score_ratings";


ALTER TABLE "public"."activity_eval_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."activity_feedback_view" WITH ("security_invoker"='on') AS
 SELECT "activity_feedback"."activity_id",
    "activity_feedback"."type",
    "jsonb_agg"("activity_feedback"."score_emotions") AS "score_emotions",
    "jsonb_agg"("activity_feedback"."score_sentiment") AS "score_sentiment",
    "sum"("activity_feedback"."score_ratings") AS "score_ratings",
        CASE
            WHEN ("activity_feedback"."type" = 'partners'::"public"."feedback_type") THEN (72 * "count"("activity_feedback"."type"))
            WHEN ("activity_feedback"."type" = 'implementers'::"public"."feedback_type") THEN (102 * "count"("activity_feedback"."type"))
            WHEN ("activity_feedback"."type" = 'beneficiaries'::"public"."feedback_type") THEN (48 * "count"("activity_feedback"."type"))
            ELSE (0)::bigint
        END AS "max_ratings"
   FROM "public"."activity_feedback"
  GROUP BY "activity_feedback"."activity_id", "activity_feedback"."type";


ALTER TABLE "public"."activity_feedback_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activity_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "checksum" "text" DEFAULT ''::"text" NOT NULL,
    "activity" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "type" "text" DEFAULT '???'::"text" NOT NULL,
    "key" "text",
    "encrypted_checksum" "text"
);


ALTER TABLE "public"."activity_files" OWNER TO "postgres";


COMMENT ON TABLE "public"."activity_files" IS 'Activity-related uploaded files metadata table';



COMMENT ON COLUMN "public"."activity_files"."checksum" IS 'Plaintext/unencrypted file checksum';



COMMENT ON COLUMN "public"."activity_files"."type" IS 'file type';



COMMENT ON COLUMN "public"."activity_files"."key" IS 'Symmetric encryption key hex';



COMMENT ON COLUMN "public"."activity_files"."encrypted_checksum" IS 'Encrypted checksum, for verifying download integrity';



CREATE TABLE IF NOT EXISTS "public"."allowed_domains" (
    "domain" "text" NOT NULL
);


ALTER TABLE "public"."allowed_domains" OWNER TO "postgres";


COMMENT ON TABLE "public"."allowed_domains" IS 'Allowed domains to use the system';



CREATE TABLE IF NOT EXISTS "public"."analytics_metadata" (
    "id" bigint NOT NULL,
    "activity_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "content" "text"
);


ALTER TABLE "public"."analytics_metadata" OWNER TO "postgres";


COMMENT ON COLUMN "public"."analytics_metadata"."content" IS 'Optional content if not for ''storage'' use';



ALTER TABLE "public"."analytics_metadata" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."analytics_metadata_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."certs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recipient_name" "text",
    "recipient_email" "text",
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "generated_by" "uuid" DEFAULT "auth"."uid"(),
    "hash" "text",
    "activity_id" "uuid",
    "url" "text"
);


ALTER TABLE "public"."certs" OWNER TO "postgres";


COMMENT ON COLUMN "public"."certs"."hash" IS 'Integrity hash';



ALTER TABLE "public"."faculty_assignments" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."event_handlers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."activity_feedback"
    ADD CONSTRAINT "activity_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_files"
    ADD CONSTRAINT "activity_files_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."activity_files"
    ADD CONSTRAINT "activity_files_mac_key" UNIQUE ("encrypted_checksum");



ALTER TABLE ONLY "public"."allowed_domains"
    ADD CONSTRAINT "allowed_domains_domain_key" UNIQUE ("domain");



ALTER TABLE ONLY "public"."allowed_domains"
    ADD CONSTRAINT "allowed_domains_pkey" PRIMARY KEY ("domain");



ALTER TABLE ONLY "public"."analytics_metadata"
    ADD CONSTRAINT "analytics_metadata_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certs"
    ADD CONSTRAINT "certs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_files"
    ADD CONSTRAINT "event_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."series"
    ADD CONSTRAINT "event_groups_title_key" UNIQUE ("title");



ALTER TABLE ONLY "public"."faculty_assignments"
    ADD CONSTRAINT "event_handlers_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."faculty_assignments"
    ADD CONSTRAINT "event_handlers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "events_title_key" UNIQUE ("title");



ALTER TABLE ONLY "public"."activity_subscriptions"
    ADD CONSTRAINT "participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."series"
    ADD CONSTRAINT "series_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_key" UNIQUE ("id");


CREATE INDEX "activities_date_starting_date_ending_idx" ON "public"."activities" USING "btree" ("date_starting", "date_ending");



CREATE INDEX "activity_feedback_score_sentiment_score_emotions_response_idx" ON "public"."activity_feedback" USING "gin" ("score_sentiment", "score_emotions", "response");



CREATE INDEX "activity_feedback_type_activity_id_idx" ON "public"."activity_feedback" USING "btree" ("type", "activity_id");



CREATE UNIQUE INDEX "activity_files_checksum_activity_idx" ON "public"."activity_files" USING "btree" ("activity", "checksum");




CREATE UNIQUE INDEX "analytics_metadata_type_idx" ON "public"."analytics_metadata" USING "btree" ("activity_id", "type");



CREATE UNIQUE INDEX "event_subscription_event_id_user_id_idx" ON "public"."activity_subscriptions" USING "btree" ("activity_id", "user_id");



CREATE UNIQUE INDEX "faculty_assignments_event_id_user_id_idx" ON "public"."faculty_assignments" USING "btree" ("activity_id", "user_id");



CREATE INDEX "users_role_idx" ON "public"."users" USING "btree" ("role");



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."activities" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."analytics_metadata" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "update_raw_app_meta_data_trigger" AFTER UPDATE OF "role", "active" ON "public"."users" FOR EACH ROW WHEN ((("old"."role" IS DISTINCT FROM "new"."role") OR ("old"."active" IS DISTINCT FROM "new"."active"))) EXECUTE FUNCTION "public"."update_raw_app_meta_data"();



ALTER TABLE ONLY "public"."activity_feedback"
    ADD CONSTRAINT "activity_feedback_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_feedback"
    ADD CONSTRAINT "activity_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."analytics_metadata"
    ADD CONSTRAINT "analytics_metadata_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."certs"
    ADD CONSTRAINT "certs_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."certs"
    ADD CONSTRAINT "certs_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."activity_files"
    ADD CONSTRAINT "event_files_event_fkey" FOREIGN KEY ("activity") REFERENCES "public"."activities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."faculty_assignments"
    ADD CONSTRAINT "event_handlers_event_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."faculty_assignments"
    ADD CONSTRAINT "event_handlers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "events_series_fkey" FOREIGN KEY ("series") REFERENCES "public"."series"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."faculty_assignments"
    ADD CONSTRAINT "faculty_assignments_referrer_fkey" FOREIGN KEY ("referrer") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."activity_subscriptions"
    ADD CONSTRAINT "participants_event_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_subscriptions"
    ADD CONSTRAINT "participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Allow delete for admin/staff only" ON "public"."activities" FOR DELETE USING ((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])));



CREATE POLICY "Allow deletes for admin/staff only" ON "public"."activity_feedback" FOR DELETE USING ((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])));



CREATE POLICY "Allow public inserts" ON "public"."activity_feedback" FOR INSERT WITH CHECK (true);



CREATE POLICY "Elevated users + faculty rsvp" ON "public"."faculty_assignments" FOR UPDATE USING (((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])) OR (( SELECT "users"."other_roles"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) && ARRAY['chair'::"public"."roles_pos", 'dean'::"public"."roles_pos"]) OR ( SELECT ("auth"."uid"() = "faculty_assignments"."user_id"))));



CREATE POLICY "Enable actions for internal users" ON "public"."analytics_metadata" TO "authenticated" USING ((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])));



CREATE POLICY "Enable changes from admin and staff only" ON "public"."allowed_domains" USING ((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"]))) WITH CHECK ((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])));



CREATE POLICY "Enable delete for admin/staff only" ON "public"."series" FOR DELETE TO "authenticated" USING ((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])));



CREATE POLICY "Enable delete for admin/staff only" ON "public"."users" FOR DELETE USING ((( SELECT "users_1"."role"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])));



CREATE POLICY "Enable delete for elevated users" ON "public"."certs" FOR DELETE USING (((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])) OR (( SELECT "users"."other_roles"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) && ARRAY['chair'::"public"."roles_pos", 'dean'::"public"."roles_pos"])));



CREATE POLICY "Enable delete for elevated users" ON "public"."faculty_assignments" FOR DELETE USING (((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])) OR (( SELECT "users"."other_roles"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) && ARRAY['chair'::"public"."roles_pos", 'dean'::"public"."roles_pos"])));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."activity_subscriptions" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for admin/staff only" ON "public"."activities" FOR INSERT WITH CHECK ((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])));



CREATE POLICY "Enable insert for admin/staff only" ON "public"."series" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."activity_subscriptions" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for elevated users" ON "public"."certs" FOR INSERT WITH CHECK (((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])) OR (( SELECT "users"."other_roles"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) && ARRAY['chair'::"public"."roles_pos", 'dean'::"public"."roles_pos"])));



CREATE POLICY "Enable insert for elevated users" ON "public"."faculty_assignments" FOR INSERT WITH CHECK (((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])) OR (( SELECT "users"."other_roles"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) && ARRAY['chair'::"public"."roles_pos", 'dean'::"public"."roles_pos"])));



CREATE POLICY "Enable inserts for admin/staff" ON "public"."users" FOR INSERT WITH CHECK ((( SELECT "users_1"."role"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])));



CREATE POLICY "Enable read access for admin/staff users" ON "public"."activity_feedback" FOR SELECT USING ((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])));



CREATE POLICY "Enable read access for all users" ON "public"."activity_subscriptions" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."certs" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."faculty_assignments" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."series" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Enable update for admin/staff only" ON "public"."activities" FOR UPDATE USING ((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])));



CREATE POLICY "Enable update for admin/staff only" ON "public"."series" FOR UPDATE TO "authenticated" USING ((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])));



CREATE POLICY "Enable update for admin/staff only" ON "public"."users" FOR UPDATE USING ((( SELECT "users_1"."role"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])));



CREATE POLICY "Enable update for users based on id" ON "public"."activity_subscriptions" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable updates for admin/staff users" ON "public"."activity_feedback" FOR UPDATE USING ((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"]))) WITH CHECK ((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])));



CREATE POLICY "Enable updates for elevated users" ON "public"."certs" FOR UPDATE USING (((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])) OR (( SELECT "users"."other_roles"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) && ARRAY['chair'::"public"."roles_pos", 'dean'::"public"."roles_pos"])));



CREATE POLICY "Return data based on user role" ON "public"."activities" FOR SELECT USING (((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = 'admin'::"public"."roles_user") OR (( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = 'staff'::"public"."roles_user") OR ((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = 'faculty'::"public"."roles_user") AND ("visibility" = ANY (ARRAY['Faculty'::"public"."activity_visibility", 'Everyone'::"public"."activity_visibility"]))) OR ("visibility" = 'Everyone'::"public"."activity_visibility")));



ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."allowed_domains" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_metadata" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."certs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."faculty_assignments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "only allow admin/staffs" ON "public"."activity_files" USING ((( SELECT "users"."role"
   FROM "public"."users"
  WHERE ("users"."id" = ( SELECT "auth"."uid"() AS "uid"))) = ANY (ARRAY['admin'::"public"."roles_user", 'staff'::"public"."roles_user"])));



ALTER TABLE "public"."series" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."activities";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."activity_feedback";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."activity_subscriptions";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."faculty_assignments";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."delete_linked_activity_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_linked_activity_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_linked_activity_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_raw_app_meta_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_raw_app_meta_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_raw_app_meta_data"() TO "service_role";























































































GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";



GRANT ALL ON TABLE "public"."series" TO "anon";
GRANT ALL ON TABLE "public"."series" TO "authenticated";
GRANT ALL ON TABLE "public"."series" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."activities_details_view" TO "anon";
GRANT ALL ON TABLE "public"."activities_details_view" TO "authenticated";
GRANT ALL ON TABLE "public"."activities_details_view" TO "service_role";



GRANT ALL ON TABLE "public"."faculty_assignments" TO "anon";
GRANT ALL ON TABLE "public"."faculty_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."faculty_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."activities_faculties_view" TO "anon";
GRANT ALL ON TABLE "public"."activities_faculties_view" TO "authenticated";
GRANT ALL ON TABLE "public"."activities_faculties_view" TO "service_role";



GRANT ALL ON TABLE "public"."activity_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."activity_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."activities_subscriptions_view" TO "anon";
GRANT ALL ON TABLE "public"."activities_subscriptions_view" TO "authenticated";
GRANT ALL ON TABLE "public"."activities_subscriptions_view" TO "service_role";



GRANT ALL ON TABLE "public"."activity_feedback" TO "anon";
GRANT ALL ON TABLE "public"."activity_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."activity_eval_view" TO "anon";
GRANT ALL ON TABLE "public"."activity_eval_view" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_eval_view" TO "service_role";



GRANT ALL ON TABLE "public"."activity_feedback_view" TO "anon";
GRANT ALL ON TABLE "public"."activity_feedback_view" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_feedback_view" TO "service_role";



GRANT ALL ON TABLE "public"."activity_files" TO "anon";
GRANT ALL ON TABLE "public"."activity_files" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_files" TO "service_role";



GRANT ALL ON TABLE "public"."allowed_domains" TO "anon";
GRANT ALL ON TABLE "public"."allowed_domains" TO "authenticated";
GRANT ALL ON TABLE "public"."allowed_domains" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_metadata" TO "anon";
GRANT ALL ON TABLE "public"."analytics_metadata" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_metadata" TO "service_role";



GRANT ALL ON SEQUENCE "public"."analytics_metadata_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."analytics_metadata_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."analytics_metadata_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."certs" TO "anon";
GRANT ALL ON TABLE "public"."certs" TO "authenticated";
GRANT ALL ON TABLE "public"."certs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."event_handlers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."event_handlers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."event_handlers_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
