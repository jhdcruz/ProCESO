-- Filter data returns based on user's role
-- Admin or staff can see all events
-- Faculty can see events with visibility 'Faculty' or 'Everyone'
-- Others and the rest can see events with visibility 'Everyone'
create
or alter policy "Return data based on user role" on "public"."events" to public using (
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
          'Faculty'::event_visibility,
          'Everyone'::event_visibility
        ]
            )
        )
    )
    or (visibility = 'Everyone' :: event_visibility)
);