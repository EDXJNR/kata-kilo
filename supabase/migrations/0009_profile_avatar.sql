-- Profile avatars (public HTTPS URL or data URL stored by the API layer)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;

COMMENT ON COLUMN public.profiles.avatar_url IS 'Optional profile image URL (HTTPS) or compact data URL set via API';

-- Optional: create avatars bucket in Supabase Dashboard → Storage → New bucket "avatars" (public read)
-- Then prefer uploading via service role and storing the public URL in avatar_url.
