-- CRUD policies for 'allowed_domains' table

-- Policy for SELECT
CREATE POLICY "Allow reads for allowed domains" ON public.allowed_domains FOR
SELECT TO authenticated USING (
    true
);

-- Policy for INSERT
CREATE POLICY "Allow insert on allowed_domains for admin or staff" ON public.allowed_domains FOR
INSERT TO authenticated WITH CHECK (
  (( SELECT users.role
   FROM users
  WHERE (users.id = ( SELECT auth.uid() AS uid))) = ANY (ARRAY['admin'::user_roles, 'staff'::user_roles]))
);

-- Policy for UPDATE
CREATE POLICY "Allow update on allowed_domains for admin or staff" ON public.allowed_domains FOR
UPDATE TO authenticated USING (
  (( SELECT users.role
   FROM users
  WHERE (users.id = ( SELECT auth.uid() AS uid))) = ANY (ARRAY['admin'::user_roles, 'staff'::user_roles]))
)
-- Policy for DELETE
CREATE POLICY "Allow delete on allowed_domains for admin or staff" ON public.allowed_domains FOR DELETE TO authenticated USING (
  (( SELECT users.role
   FROM users
  WHERE (users.id = ( SELECT auth.uid() AS uid))) = ANY (ARRAY['admin'::user_roles, 'staff'::user_roles]))
);
