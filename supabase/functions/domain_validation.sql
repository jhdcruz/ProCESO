-- Checks new user email domain against allowed domains
CREATE OR REPLACE FUNCTION check_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $ $ BEGIN IF RIGHT(
    NEW.email,
    POSITION('@' IN REVERSE(NEW.email)) - 1
  ) = ANY (
    ARRAY(
      SELECT domain_name
      FROM public.allowed_domains
    )
  ) THEN RETURN NEW;
ELSE RETURN NULL;
END IF;
END;
$$;
CREATE TRIGGER validate_user_domain BEFORE
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION check_user();