-- Enable changes for authenticated admin/staff only
-- Applies to all table that requires admin/staff privileges (ex. series, activity_handlers, etc.)
alter policy "Enable X for admin/staff only"
on "public"."<table_name>"
to authenticated
using (
  (( SELECT users.role
   FROM users
  WHERE (users.id = ( SELECT auth.uid() AS uid))) = ANY (ARRAY['admin'::user_roles, 'staff'::user_roles]))
);

CREATE UNIQUE INDEX faculty_assignments_activity_id_user_id_idx ON public.faculty_assignments USING btree (activity_id, user_id)
CREATE UNIQUE INDEX activity_subscription_activity_id_user_id_idx ON public.activity_subscriptions USING btree (activity_id, user_id)
