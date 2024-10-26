-- Filter data returns based on user's role
-- Admin or staff can see all activitys
-- Faculty can see activitys with visibility 'Faculty' or 'Everyone'
-- Others and the rest can see activitys with visibility 'Everyone'
create
or alter policy "Return data based on user role" on "public"."activitys" to public using (
    (
        (
            select
                users.role
            from
                public.users
            where
                users.id = auth.uid ()
        ) = 'admin' :: roles_user
    )
    or (
        (
            select
                users.role
            from
                public.users
            where
                users.id = auth.uid ()
        ) = 'staff' :: roles_user
    )
    or (
        (
            (
                select
                    users.role
                from
                    public.users
                where
                    users.id = auth.uid ()
            ) = 'faculty' :: roles_user
        )
        and (
            visibility = any (
                array [
          'Faculty'::activity_visibility,
          'Everyone'::activity_visibility
        ]
            )
        )
    )
    or (visibility = 'Everyone' :: activity_visibility)
);
