CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


grant delete on table "storage"."s3_multipart_uploads" to "postgres";

grant insert on table "storage"."s3_multipart_uploads" to "postgres";

grant references on table "storage"."s3_multipart_uploads" to "postgres";

grant select on table "storage"."s3_multipart_uploads" to "postgres";

grant trigger on table "storage"."s3_multipart_uploads" to "postgres";

grant truncate on table "storage"."s3_multipart_uploads" to "postgres";

grant update on table "storage"."s3_multipart_uploads" to "postgres";

grant delete on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant insert on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant references on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant select on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant trigger on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant truncate on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant update on table "storage"."s3_multipart_uploads_parts" to "postgres";

create policy "Allow public reads (getPublicUrl) 1kajtb_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'certs'::text));


create policy "Allow public reads (getPublicUrl) 3k1b64_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'activity_covers'::text));


create policy "Anyone can upload an avatar."
on "storage"."objects"
as permissive
for insert
to public
with check ((bucket_id = 'avatars'::text));


create policy "Avatar images are publicly accessible."
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'avatars'::text));


create policy "Give admin/staffs authenticated access 1kajtb_1"
on "storage"."objects"
as permissive
for insert
to public
with check ((((bucket_id = 'certs'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give admin/staffs authenticated access 1kajtb_2"
on "storage"."objects"
as permissive
for update
to public
using ((((bucket_id = 'certs'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give admin/staffs authenticated access 1kajtb_3"
on "storage"."objects"
as permissive
for delete
to public
using ((((bucket_id = 'certs'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give admin/staffs authenticated access 3k1b64_0"
on "storage"."objects"
as permissive
for insert
to public
with check ((((bucket_id = 'activity_covers'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give admin/staffs authenticated access 3k1b64_1"
on "storage"."objects"
as permissive
for update
to public
using ((((bucket_id = 'activity_covers'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give admin/staffs authenticated access 3k1b64_2"
on "storage"."objects"
as permissive
for delete
to public
using ((((bucket_id = 'activity_covers'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give admin/staffs authenticated access ewcd95_0"
on "storage"."objects"
as permissive
for select
to public
using ((((bucket_id = 'public_assets'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give admin/staffs authenticated access ewcd95_1"
on "storage"."objects"
as permissive
for insert
to public
with check ((((bucket_id = 'public_assets'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give admin/staffs authenticated access ewcd95_2"
on "storage"."objects"
as permissive
for delete
to public
using ((((bucket_id = 'public_assets'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give admin/staffs authenticated access ewcd95_3"
on "storage"."objects"
as permissive
for update
to public
using ((((bucket_id = 'public_assets'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give authenticated access to admin/staff 1kvb2vq_0"
on "storage"."objects"
as permissive
for select
to public
using ((((bucket_id = 'activity_analytics'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give authenticated access to admin/staff 1kvb2vq_1"
on "storage"."objects"
as permissive
for insert
to public
with check ((((bucket_id = 'activity_analytics'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give authenticated access to admin/staff 1kvb2vq_2"
on "storage"."objects"
as permissive
for update
to public
using ((((bucket_id = 'activity_analytics'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give authenticated access to admin/staff 1kvb2vq_3"
on "storage"."objects"
as permissive
for delete
to public
using ((((bucket_id = 'activity_analytics'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give only admin/staffs access xvopv1_0"
on "storage"."objects"
as permissive
for select
to public
using ((((bucket_id = 'activities'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give only admin/staffs access xvopv1_1"
on "storage"."objects"
as permissive
for update
to public
using ((((bucket_id = 'activities'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give only admin/staffs access xvopv1_2"
on "storage"."objects"
as permissive
for insert
to public
with check ((((bucket_id = 'activities'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));


create policy "Give only admin/staffs access xvopv1_3"
on "storage"."objects"
as permissive
for delete
to public
using ((((bucket_id = 'activities'::text) AND (( SELECT users.active
   FROM users
  WHERE (users.id = auth.uid())) = true) AND (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::roles_user)) OR (( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'staff'::roles_user)));



