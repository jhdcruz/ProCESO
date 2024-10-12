-- Update auth.users's raw_app_meta_data field based on changes in public.users

CREATE
OR REPLACE FUNCTION update_users_from_app_metadata () RETURNS TRIGGER AS $$
BEGIN
    -- Update the role and active status in public.users based on changes in raw_app_meta_data
    IF (NEW.raw_app_meta_data ? 'role' AND (OLD.raw_app_meta_data ->> 'role') IS DISTINCT FROM (NEW.raw_app_meta_data ->> 'role')) THEN
        UPDATE public.users
        SET role = (NEW.raw_app_meta_data ->> 'role')::text,
            updated_at = now() AT TIME ZONE 'utc'
        WHERE id = NEW.id;
    END IF;

    IF (NEW.raw_app_meta_data ? 'active' AND (OLD.raw_app_meta_data ->> 'active') IS DISTINCT FROM (NEW.raw_app_meta_data ->> 'active')) THEN
        UPDATE public.users
        SET active = (NEW.raw_app_meta_data ->> 'active')::boolean,
            updated_at = now() AT TIME ZONE 'utc'
        WHERE id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE
OR REPLACE TRIGGER update_users_role_active
AFTER
UPDATE OF raw_app_meta_data ON auth.users FOR EACH ROW WHEN (
  OLD.raw_app_meta_data IS DISTINCT FROM NEW.raw_app_meta_data
)
EXECUTE FUNCTION update_users_from_app_metadata ();
