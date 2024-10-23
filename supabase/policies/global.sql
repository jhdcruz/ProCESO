-- Enable changes for authenticated admin/staff only
-- Applies to all table that requires admin/staff privileges (ex. series, event_handlers, etc.)
alter policy "Enable X for admin/staff only"
on "public"."<table_name>"
to authenticated
using (
  (( SELECT users.role
   FROM users
  WHERE (users.id = ( SELECT auth.uid() AS uid))) = ANY (ARRAY['admin'::user_roles, 'staff'::user_roles]))
);

CREATE UNIQUE INDEX faculty_assignments_event_id_user_id_idx ON public.faculty_assignments USING btree (event_id, user_id)
CREATE UNIQUE INDEX event_subscription_event_id_user_id_idx ON public.event_subscriptions USING btree (event_id, user_id)
