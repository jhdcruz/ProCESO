-- Save user profiles in 'users' table from supabase's private auth.users.
alter table users enable row level security;
create policy "Public profiles are viewable by everyone." on users for
select using (true);
create policy "Users can insert their own profile." on users for
insert with check (
    (
      select auth.uid()
    ) = id
  );
create policy "Users can update own profile." on users for
update using (
    (
      select auth.uid()
    ) = id
  );
CREATE POLICY "Admin/staff can perform all actions" ON users FOR ALL USING (
  (
    SELECT ROLE
    FROM users
    WHERE id = auth.uid ()
  ) IN ('staff', 'admin')
);
-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for more details.
create function public.handle_new_user() returns trigger as $$ begin
insert into public.profiles (id, email, name, avatar_url, role, active)
values (
    new.id,
    new.raw_user_meta_data->>'email',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url',
    'faculty',
    1
  );
return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_new_user();
-- Set up Storage!
insert into storage.buckets (id, name)
values ('avatars', 'avatars');
-- Set up access controls for storage.
-- See https://supabase.com/docs/guides/storage#policy-examples for more details.
create policy "Avatar images are publicly accessible." on storage.objects for
select using (bucket_id = 'avatars');
create policy "Anyone can upload an avatar." on storage.objects for
insert with check (bucket_id = 'avatars');