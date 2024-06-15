-- CRUD policies for 'allowed_domains' table
-- Policy for SELECT
CREATE POLICY "Allow select on allowed_domains for admin or staff" ON public.allowed_domains FOR
SELECT TO authenticated USING (
    (
      SELECT role
      FROM public.users
      WHERE id = (
          SELECT auth.uid ()
        )
    ) IN ('admin', 'staff')
  );
-- Policy for INSERT
CREATE POLICY "Allow insert on allowed_domains for admin or staff" ON public.allowed_domains FOR
INSERT TO authenticated WITH CHECK (
    (
      SELECT role
      FROM public.users
      WHERE id = (
          SELECT auth.uid ()
        )
    ) IN ('admin', 'staff')
  );
-- Policy for UPDATE
CREATE POLICY "Allow update on allowed_domains for admin or staff" ON public.allowed_domains FOR
UPDATE TO authenticated USING (
    (
      SELECT role
      FROM public.users
      WHERE id = (
          SELECT auth.uid ()
        )
    ) IN ('admin', 'staff')
  ) WITH CHECK (
    (
      SELECT role
      FROM public.users
      WHERE id = (
          SELECT auth.uid ()
        )
    ) IN ('admin', 'staff')
  );
-- Policy for DELETE
CREATE POLICY "Allow delete on allowed_domains for admin or staff" ON public.allowed_domains FOR DELETE TO authenticated USING (
  (
    SELECT role
    FROM public.users
    WHERE id = (
        SELECT auth.uid ()
      )
  ) IN ('admin', 'staff')
);